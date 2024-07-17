const express = require('express');
const oauth2Client = require('../config/googleAuth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Route to start OAuth flow
router.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
  });
  res.redirect(authUrl);
});

// OAuth2 callback route
router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Save the tokens for future use
    fs.writeFileSync(path.join(__dirname, '../tokens.json'), JSON.stringify(tokens));
    res.send('Authorization successful! You can close this window.');
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.send('Error retrieving access token');
  }
});

module.exports = router;