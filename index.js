const restify = require('restify');
const { TVTIME_ACCESS_TOKEN, PLEX_USER, PORT } = require('./settings');
const got = require('got');
const FormData = require('form-data');

const server = restify.createServer();

server.use(restify.plugins.bodyParser());

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

server.post('/plex', async (req, res, next) => {
  const data = req.body;

  if (data.event !== 'media.scrobble') {
    res.send({ skipped: true, reason: 'Wrong event, expects media.scrobble' });
    return next();
  }
  if (data.Account.title !== PLEX_USER) {
    res.send({ skipped: true, reason: `Wrong user, expects ${PLEX_USER}` });
    return next();
  }

  const showInfo = parseGuid(data.Metadata.guid);

  console.log('showInfo', showInfo);

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
  const logPrefix = `${showTitle} S${showInfo.season}E${showInfo.episode}`;

  if (tvtimeSuccess) {
    console.log(`${logPrefix} successfully marked as watched`);
  } else {
    console.log(`${logPrefix} Failed to mark as watched (${errorMsg})`);
  }

  res.send({ ok: tvtimeSuccess, reason: errorMsg });
  return next();
});

server.listen(PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});
