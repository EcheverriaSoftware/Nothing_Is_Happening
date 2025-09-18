# Nothing Is Happening — Hide "What's happening" on X

This Chromium extension removes the "What's happening" module across X/Twitter, on every page and route.

## Install
1. Download/clone this folder.
2. Chrome/Edge: go to `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode, click "Load unpacked", select this folder.

It runs automatically on `x.com` and `twitter.com`.

## Notes
- Implemented via a content script that observes DOM mutations and deletes the module by accessible heading/aria-labels.
- Targets both the legacy `Twitter` and current `X` domains.
