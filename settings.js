const dotenv = require('dotenv');
dotenv.config({
  path: process.env.ENV_FILE || '.env',
});

const TVTIME_CLIENT_ID = process.env.TVTIME_CLIENT_ID;
const TVTIME_CLIENT_SECRET = process.env.TVTIME_CLIENT_SECRET;
const TVTIME_ACCESS_TOKEN = process.env.TVTIME_ACCESS_TOKEN;
const PLEX_USER = process.env.PLEX_USER;
const PORT = process.env.PORT;

if (!TVTIME_CLIENT_ID || !TVTIME_CLIENT_SECRET || !PLEX_USER || !PORT) {
  throw new Error(
    'Please make sure to configure all variables in .env file properly.'
  );
}

module.exports = {
  TVTIME_CLIENT_ID,
  TVTIME_CLIENT_SECRET,
  TVTIME_ACCESS_TOKEN,
  PLEX_USER,
  PORT,
};
