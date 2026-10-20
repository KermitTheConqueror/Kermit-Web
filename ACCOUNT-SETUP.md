# Local Google accounts

Run the game site on port 8000 and run `python account-server.py` from this directory for the account page on http://localhost:8001/.

The Account dialog embeds the account page on its separate origin. The account server only serves four allowlisted assets, rejects other Host headers, and allows framing only by the two local game-site origins on port 8000. Firebase initializes only at the exact account origin. Tokens and profile data are never sent back to the game site: the frame renders the current user itself. Session persistence lasts for this browser tab. Closing the dialog keeps its frame alive. Google authentication uses a popup; the main site does not navigate. The games' origin must never host authentication tokens.

Firebase project: kermit-web. Google provider is enabled. If sign-in reports auth/unauthorized-domain, authorize localhost in Firebase Authentication > Settings > Authorized domains. Do not add unrelated domains.

The user must finish Google sign-in themselves. Game saves and achievements are not synced. Production deployment is not configured: use a dedicated HTTPS account origin with the same strict asset allowlist and update the exact-origin guard and Account link before deploying. Do not serve arbitrary game files from the account origin.

Implementation reference: https://firebase.google.com/docs/auth/web/google-signin
