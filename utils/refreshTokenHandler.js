const fs = require('fs');
const path = require('path');
const oauth2Client = require('../config/googleAuth');

const refreshTokenHandler = async () => {
  const newTokens = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(newTokens.credentials);
  fs.writeFileSync(path.join(__dirname, '../refresh_token.json'), JSON.stringify(newTokens.credentials));
};

module.exports = refreshTokenHandler;
