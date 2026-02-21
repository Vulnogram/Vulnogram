# Vulnogram 1.0.0 Release Notes

This release summarizes changes from branch `0.5.0` to branch `1.0.0`.

## Highlights

- Introduced realtime collaborative editing for Team mode using Socket.IO + JSON Patch (RFC 6902 style patch flow).
- Added automatic draft caching in browser storage with cross-tab sync and draft error-count indicators.
- Renamed product modes in docs/UI language:
  - Browser mode -> Solo mode
  - Server mode -> Team mode
- Refactored the editor frontend into modular source files and introduced a bundled editor artifact (`public/js/vg-editor.js`).
- Replaced legacy WYSIHTML5 comment editing with a new built-in `SimpleHtml` editor.
- Added CVE workflow improvements in CVE 5 editor and portal integration:
  - Better CVE Services session lifecycle handling
  - Semver validation for affected-version ranges
  - ADP requirement fixes and related UI improvements
  - CPE name/type alias override mappings
  - Improved example loading and recent-CVE helper behavior
- Added documentation generation tooling and updated end-user docs/screenshots.

## Breaking And Important Changes

- Removed legacy CVE v4 section and files (`default/cve/*` removed). CVE editing is now centered on `cve5`.
- Removed `/review` routes and related Preview/Slides shortcuts used by the old CVE flow.
- Team mode now initializes an HTTP/HTTPS server wrapper to support realtime sockets.
- Added new realtime configuration block in `config/conf.js`:
  - `realtime.enabled`
  - `realtime.debounceMs`
  - patch size/op limits and rate limiting controls
- Default JSON editor loading switched to local asset (`/js/jsoneditor.min.js`) instead of CDN default.
- Standalone generation updated to relative paths and CVSS4 inclusion by default.

## UX And Interface Updates

- Major layout modernization:
  - Responsive sidebar/top-header structure
  - Improved action placement and status display
  - Drafts and realtime status visibility in editor UI
- CVSS 4 UI cleanup:
  - Label simplification (for example, Base Severity -> Severity, CVSS-B -> Score)
  - Additional copy/vector UI polish
- Broad CSS and icon refactors (including removal of old/dead assets and improved consistency).
- Each section gets its own favicon

## Data, Schema, And Content Updates

- Updated CWE dataset and added `scripts/parse-cwe.js` to regenerate CWE examples.
- Added NVD empty-state guidance in list UI.

## Developer And Build Changes

- Added editor bundling script: `scripts/bundle-editor.js`.
- Added documentation generation script: `scripts/gendoc.js`.
- Makefile updated for new editor bundle + CSS/asset targets.
- Added new realtime server module: `lib/realtime.js`.

## Upgrade Notes

- If you relied on old CVE4 or `/review/*` endpoints, migrate workflows to CVE5 and current preview/render paths.
- For Team mode behind reverse proxies, ensure Socket.IO/websocket transport is allowed.
- To disable realtime behavior, set `VULNOGRAM_REALTIME=false` or `realtime.enabled = false`.
