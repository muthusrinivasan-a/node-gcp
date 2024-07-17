const express = require('express');
const { fetchAndStoreCalendarEvents } = require('../controllers/calendarController');

const router = express.Router();

/**
 * @swagger
 * /api/fetch-calendar-events:
 *   post:
 *     summary: Fetch and store Google Calendar events
 *     description: Fetch events from Google Calendar and store them in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               calendarIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Events fetched and stored successfully
 *       500:
 *         description: Error fetching and storing events
 */
router.post('/fetch-calendar-events', fetchAndStoreCalendarEvents);

module.exports = router;