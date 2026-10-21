# Deploying the Movies and Cloud Gaming fix

Upload the patch files to the root of your existing GitHub repository. Preserve the api and server folder structure. Commit the changes so Vercel redeploys.

In your Vercel project, add the environment variable TMDB_READ_ACCESS_TOKEN with your TMDB API Read Access Token. Enable it for Production (and Preview if desired), then redeploy. Never commit the token or put it in public JSON.

The Vercel Root Directory must contain index.html and api/. This is a plain static website with Vercel functions, not a Python-server deployment. Use the Other framework preset without a build command; do not configure an output directory that excludes api/.

After deployment, check /api/movies returns results, then open Movies and Cloud Gaming. Cloud Gaming uses the original catalog in cloud-catalog/ instead of a localhost address. Include that entire folder when uploading. Games are loaded from CloudMoon; its account, availability and subscription requirements still apply. Catalog loading was checked locally; signed-in game streaming has not been tested.

The movie catalog fix does not guarantee availability of the third-party movie player. Repository preview and other localhost-only services are outside this patch.
