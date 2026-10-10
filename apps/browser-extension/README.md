# LifeLens Browser Monitor

This Chrome/Edge Manifest V3 extension records the hostname of the active HTTP(S) tab once per minute while the user explicitly enables monitoring. It sends records to the LifeLens Worker as `browser-extension` network events with `eventType: screen-time`.

It does not read page contents, inspect private traffic, or monitor anything while disabled.

## Install locally

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this `apps/browser-extension` folder.
5. Open the extension popup, confirm the API URL, and enable monitoring.

The default API URL is `https://lifelen.ethicxedge.workers.dev`. The Worker must have a configured D1 database and the deployed API must accept the extension's device records.
