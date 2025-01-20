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
const fetchGoogleSheetData = async (req, res) => {
  await refreshTokenHandler();
 try {
    const { spreadsheetId, range } = req.body;

    if (!spreadsheetId) {
      return res.status(400).send('Spreadsheet ID is required');
    }

    // Initialize Google Sheets API
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range || '', // Fetch entire sheet if range is not specified
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).send('No data found in the spreadsheet');
    }

    // Convert the data into JSON
    const keys = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      keys.forEach((key, index) => {
        obj[key] = row[index] || null;
      });
      return obj;
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error.message);
    res.status(500).send('Failed to fetch Google Sheets data');
  }
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


private renameKeys(obj: any, keyMap: { [key: string]: string }): any {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = keyMap[key] || key; // Use mapped key or retain original
      acc[newKey] = obj[key];
      return acc;
    }, {} as any);
  }
