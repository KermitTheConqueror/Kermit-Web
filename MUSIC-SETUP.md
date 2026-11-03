# Spotify music
Open music.html. Official Spotify links work with embeds without an app secret.
Playback is controlled by Spotify and may be limited by account, region, and embed restrictions.
For in-page search, configure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET as server-only environment variables in Vercel, then redeploy. Spotify developer access/quota rules apply. Never add the secret to HTML, browser JavaScript, or GitHub.
For local search, start work/preview-hosted-fix.cjs with these environment variables set. Do not paste secrets into chat.
Recent selections are stored in the current browser, not synchronized with a Spotify account.

