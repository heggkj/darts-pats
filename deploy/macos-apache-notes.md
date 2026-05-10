# macOS Apache Notes

The static package can be served by the Apache server included with macOS.

## Copy The Package

From the repo on the build machine or after copying the package to the Mac mini:

```sh
sudo rsync -a release/darts-pats-static-site/ /Library/WebServer/Documents/
```

The contents of `darts-pats-static-site/` should go directly into `/Library/WebServer/Documents/`, so `/Library/WebServer/Documents/index.html` exists.

## Start Or Reload Apache

```sh
sudo apachectl start
```

If Apache is already running:

```sh
sudo apachectl graceful
```

Open:

```txt
http://localhost/
```

## Kiosk Notes

- Do not open the exhibit with `file://`.
- Keep the static package as the web root.
- Disable sleep, screensaver, and notifications.
- Test the exhibit offline.
- Test idle reset, touch controls, and the intended screen orientation.
