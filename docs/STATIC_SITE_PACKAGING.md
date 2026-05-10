# Static Site Packaging

## What This Is

The Darts & Pats repo uses Astro and Vite as build tools. Those tools are useful for development, but they are not part of the kiosk/runtime package.

The deployable artifact is a static site generated from `dist/` and copied into:

```sh
release/darts-pats-static-site/
```

The Mac mini or generic static web server only needs that folder. It does not need Node, npm, Astro, Vite, GitHub, Netlify, source files, or internet access.

## How To Build The Static Package

Run this on the build machine:

```sh
git pull
npm ci
npm run package:static
```

`npm ci` is needed only on the build machine. The kiosk does not need Node or npm.

`npm run package:static` creates:

```sh
release/darts-pats-static-site/
release/darts-pats-static-site.zip
release/static-package-audit.txt
```

The generated `release/` folder is ignored by Git and should not be committed.

By default, public phase reports and screenshots are excluded from the kiosk package to keep the artifact smaller. To include them for an archival handoff package:

```sh
npm run package:static -- --include-reports
```

## What To Copy To The Mac Mini

Copy either:

```sh
release/darts-pats-static-site.zip
```

or the expanded folder:

```sh
release/darts-pats-static-site/
```

to the Mac mini.

## How To Serve It

Do not use `file://`. The exhibit fetches local JSON data, so it should be served by a local web server.

Serve the contents of `darts-pats-static-site/` as the web root and open:

```txt
http://localhost/
```

The default package assumes the exhibit is served from the site root. Do not serve it from a subfolder such as `/darts-pats/` unless the project is rebuilt with a compatible base path.

## Quick Local Test

For a fast development test:

```sh
cd release/darts-pats-static-site
python3 -m http.server 8080
```

Then open:

```txt
http://localhost:8080
```

This is fine for testing. For a public kiosk, use a more durable static server such as Apache, Caddy, or nginx.

## Mac Mini Static-Server Options

### Option 1: macOS Built-In Apache

```sh
sudo rsync -a release/darts-pats-static-site/ /Library/WebServer/Documents/
sudo apachectl start
open http://localhost/
```

If Apache is already running, reload it:

```sh
sudo apachectl graceful
```

### Option 2: Caddy

Example `Caddyfile`:

```caddyfile
:80 {
    root * /path/to/darts-pats-static-site
    file_server
    try_files {path} {path}/ /index.html
}
```

### Option 3: nginx

Example nginx server block:

```nginx
server {
    listen 80;
    server_name localhost;

    root /path/to/darts-pats-static-site;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        try_files $uri =404;
    }

    location /data/ {
        try_files $uri =404;
    }

    location /_astro/ {
        try_files $uri =404;
    }
}
```

## Kiosk Browser Note

Point the kiosk browser to:

```txt
http://localhost/
```

Recommended kiosk prep:

- Disable OS sleep.
- Disable screensaver.
- Disable notifications.
- Test the idle reset.
- Test touch controls.
- Test the physical portrait or landscape orientation.

Example Chrome command:

```sh
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  http://localhost/
```

## Updating The Exhibit Later

On the build machine:

1. Pull the latest repo.
2. Make and test changes.
3. Run `npm run build`.
4. Run `npm run package:static`.
5. Copy `release/darts-pats-static-site.zip` to the Mac mini.
6. Replace the old static files with the new expanded package contents.
7. Restart or reload the kiosk browser.

## Offline Dependency Checklist

Before public use:

- Unplug internet or block network.
- Load `http://localhost/`.
- Check the browser console/network panel.
- Confirm no failed remote scripts, fonts, images, CSS, or data/API requests.
- Confirm data loads.
- Confirm images load.
- Confirm the PL2 logo loads.
- Confirm The Breeze Parade loads.
- Confirm the Memory Corridor has 616 records.
- Confirm the drawer, editor, strings board, Long Argument, and Credits sections work.
