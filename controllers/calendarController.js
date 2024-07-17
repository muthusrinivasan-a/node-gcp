const { google } = require('googleapis');
const pool = require('../config/db');
const oauth2Client = require('../config/googleAuth');
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const event of events) {
      const { id, summary, start, end } = event;
      await client.query(
        'INSERT INTO events (event_id, summary, start_time, end_time) VALUES ($1, $2, $3, $4) ON CONFLICT (event_id) DO NOTHING',
        [id, summary, start.dateTime || start.date, end.dateTime || end.date]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error storing events in the database:', error);
    throw error;
  } finally {
    client.release();
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
    res.status(500).send('Error fetching and storing calendar events');
  }
};

module.exports = { fetchAndStoreCalendarEvents };
