#!/usr/bin/env node

const got = require('got');
const FormData = require('form-data');
const { TVTIME_CLIENT_ID, TVTIME_CLIENT_SECRET } = require('./settings');

(async () => {
  console.log('== Requesting tvshowtime.com auth ==');

  const form = new FormData();
  form.append('client_id', TVTIME_CLIENT_ID);

  const res = await got.post(`https://api.tvtime.com/v1/oauth/device/code`, {
    body: form,
    headers: form.getHeaders(),
  });
  const body = JSON.parse(res.body);
  const userCode = body.user_code;
  const deviceCode = body.device_code;
  const authUrl = body.verification_url;
  console.log('Please do the following to authorize the scrobbler:');
  console.log(`Connect on ${authUrl}`);
  console.log(`Enter the code: ${userCode}`);

  setInterval(async () => {
    const form = new FormData();
    form.append('client_id', TVTIME_CLIENT_ID);
    form.append('client_secret', TVTIME_CLIENT_SECRET);
    form.append('code', deviceCode);
    console.log('deviceCode', deviceCode);
    const res = await got.post(`https://api.tvtime.com/v1/oauth/access_token`, {
      body: form,
      headers: form.getHeaders(),
    });
    const body = JSON.parse(res.body);
    if (body.result === 'OK') {
      console.log(
        `Go to your .env file and paste: TVTIME_ACCESS_TOKEN=${
          body.access_token
        }`
      );
      process.exit(0);
    } else {
      console.log('Polled for access but failed.', body);
    }
  }, 10000);
})();
