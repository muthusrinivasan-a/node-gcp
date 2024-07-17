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

module.exports = { fetchAndStoreCalendarEvents };