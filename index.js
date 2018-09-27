const express = require('express');
const multer = require('multer');
const { TVTIME_ACCESS_TOKEN, PLEX_USER, PORT } = require('./settings');
const got = require('got');
const FormData = require('form-data');

const app = express();
const upload = multer({ dest: '/tmp/' });

function parseGuid(guid) {
  // Example input: com.plexapp.agents.thetvdb://76156/1/18?lang=en
  const match = guid.match(/:\/\/([0-9]+)\/([0-9]+)\/([0-9]+)/);
  if (!match) {
    return null;
  }
  return {
    tvdb: match[1],
    season: match[2],
    episode: match[3],
  };
}

app.post('/*', upload.single('thumb'), async function(req, res) {
  // TODO: TrY CATCH JSON
  let data = null;
  try {
    data = JSON.parse(req.body.payload);
  } catch (e) {
    res.sendStatus(400);
    return;
  }

  if (data.event !== 'media.scrobble') {
    res.send({ skipped: true, reason: 'Wrong event, expects media.scrobble' });
    return;
  }
  if (!PLEX_USER.split(',').includes(data.Account.title)) {
    res.send({ skipped: true, reason: `Wrong user, expects ${PLEX_USER}` });
    return;
  }

  const showInfo = parseGuid(data.Metadata.guid);

  const form = new FormData();
  form.append('access_token', TVTIME_ACCESS_TOKEN);
  form.append('show_id', showInfo.tvdb);
  form.append('season', showInfo.season);
  form.append('episode', showInfo.episode);

  let tvtimeSuccess = false;
  let errorMsg = '';
  try {
    const tvtimeRes = await got.post(
      `https://api.tvtime.com/v1/show_progress`,
      {
        body: form,
        headers: form.getHeaders(),
      }
    );
    const body = JSON.parse(tvtimeRes.body);
    tvtimeSuccess = body.result === 'OK';
  } catch (e) {
    errorMsg = e.message;
  }
  const showTitle = data.Metadata.grandparentTitle;
  const logPrefix = `${showTitle} S${showInfo.season}E${
    showInfo.episode
  } (tvdb: ${showInfo.tvdb})`;

  if (tvtimeSuccess) {
    console.log(`${logPrefix} successfully marked as watched`);
  } else {
    console.log(`${logPrefix} Failed to mark as watched (${errorMsg})`);
  }

  res.send({ ok: tvtimeSuccess, reason: errorMsg });
});

app.listen(PORT, () => {
  console.log(`Plex TVTime webhook listening on ${PORT}`);
});
