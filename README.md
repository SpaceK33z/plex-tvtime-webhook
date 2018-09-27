# Plex TVTime Webhook

[TVTime](https://www.tvtime.com/) is an awesome app to monitor the TV shows you're watching. Unfortunately I have to keep it in sync manually after I've watched a TV show on [Plex](https://www.plex.tv/), which feels kinda cumbersome.

TVTime [has a scrobbler](https://github.com/tvshowtime/tvshowtime-plex-scrobbler/) that seems to do this, but it hasn't gotten any updates, is very difficult to install and requires you to set Plex logging to `DEBUG` level, which causes a lot of data.

My solution works on a relatively new feature from Plex, using webhooks.

## Installation

Make sure you have `node` v8+ and `npm` or `yarn` installed.

Run `npm install` or `yarn` to install the dependencies.

Copy `.env.example` to `.env` and fill out the `PORT` and `PLEX_USER`. You don't need to touch the other variables.

Run `./register.js` in this repository. Do what the command tells you.

Run the webserver with `node index.js` and make sure to keep it running via e.g. systemd (TODO: add systemd example).

Make sure you know Plex can access the IP and port where the webserver runs.

> Warning beforehand: yes, the node_modules size is 79MB. Blablab nodejs is crap yep you can stop. It would be very easy to trim this down, but I made this very quickly and don't have the time for it yet.

This step is for the simple and avanced routes. Add a webhook in Plex, you can learn [how to do it here](https://support.plex.tv/articles/115002267687-webhooks/).

The webhook URL you should be using is `http://[your-ip]:[your-port]`.

**Now you are done!** To test, you can start playing a TV show from Plex, scroll to the end, wait a few seconds and in TVTime the episode should be marked as watched!