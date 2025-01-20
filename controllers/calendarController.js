const { google } = require('googleapis');
const oauth2Client = require('../config/googleAuth');
const Event = require('../models/Event');
const refreshTokenHandler = require('../utils/refreshTokenHandler');

const fetchCalendarEvents = async (calendarId) => {
  await refreshTokenHandler();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.list({
    calendarId: calendarId,
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items;
};

const storeEventsInDb = async (events) => {
  for (const event of events) {
    const { id, summary, start, end } = event;
    await Event.upsert({
      event_id: id,
      summary,
      start_time: start.dateTime || start.date,
      end_time: end.dateTime || end.date,
    });
  }
};

const fetchAndStoreCalendarEvents = async (req, res) => {
  try {
    const { calendarIds } = req.body;
    let allEvents = [];

    for (const calendarId of calendarIds) {
      const events = await fetchCalendarEvents(calendarId);
      allEvents = allEvents.concat(events);
    }

    await storeEventsInDb(allEvents);
    res.status(200).send(allEvents);
  } catch (error) {
    if (error.message === 'RefreshTokenExpired') {
      res.status(401).send('Refresh token expired. Please log in again.');
    } else {
      res.status(500).send('Error fetching and storing calendar events');
    }
  }
};

// Fetch all data from Google Sheet and process into JSON
const fetchGoogleSheetData = async (spreadsheetId) => {
  await refreshTokenHandler();
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: '', // Leave range empty to fetch all data
  });

  const rows = response.data.values;

  if (!rows || rows.length < 2) {
    throw new Error('Invalid or insufficient data in the sheet');
  }

  // Use the first row as keys and the rest as values
  const keys = rows[0];
  const data = rows.slice(1).map(row => {
    const obj = {};
    keys.forEach((key, index) => {
      obj[key] = row[index] || null; // Assign null for missing values
    });
    return obj;
  });

  return data;
};

// Controller to fetch Google Sheets data
const fetchGoogleSheetDataController = async (req, res) => {
  try {
    const { spreadsheetId } = req.body; // No range needed for the entire sheet
    const sheetData = await fetchGoogleSheetData(spreadsheetId);
    res.status(200).json(sheetData);
  } catch (error) {
    res.status(500).send(error.message || 'Error fetching Google Sheet data');
  }
};


module.exports = { fetchAndStoreCalendarEvents, fetchGoogleSheetDataController, };
