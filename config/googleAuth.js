const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Load tokens if they exist
if (fs.existsSync(path.join(__dirname, '../tokens.json'))) {
  const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, '../tokens.json')));
  oauth2Client.setCredentials(tokens);
}

module.exports = oauth2Client;