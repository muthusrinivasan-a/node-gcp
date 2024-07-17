const fs = require('fs');
const path = require('path');
const oauth2Client = require('../config/googleAuth');

const refreshTokenHandler = async () => {
  try {
    const { credentials } = await oauth2Client.getAccessToken();
    oauth2Client.setCredentials(credentials);

    // Save the new credentials
    fs.writeFileSync(path.join(__dirname, '../tokens.json'), JSON.stringify(credentials));
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token is expired or invalid
      throw new Error('RefreshTokenExpired');
    } else {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }
};

module.exports = refreshTokenHandler;