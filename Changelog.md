# Vulnogram 1.0.0 Release Notes

This release summarizes changes from branch `0.5.0` to branch `1.0.0`.

## Highlights

- Added automatic draft caching in browser storage and support for tracking and publishing multiple CVE records at the same time (without the need for server mode deployment)

- Renamed deployment modes in docs/UI language:
  - Browser mode -> Solo mode
  - Server mode -> Team mode
- Introduced realtime collaborative editing for Team mode using Socket.IO + JSON Patch (RFC 6902 style patch flow).

- Replaced legacy WYSIHTML5 rich text editor with a new built-in `SimpleHtml` editor.
- Added CVE workflow improvements in CVE editor and portal integration:
  - Better CVE Services session lifecycle handling
  - Semver validation for affected-version ranges
  - ADP requirement fixes and related UI improvements, including direct ADP publish support (`PUT /cve/{id}/adp`)
  - CPE name/type alias override mappings
  - Improved example loading and loading a CNA's recent CVEs

- Added documentation generation tooling and automated docs/screenshots.

## Breaking And Important Changes

- Removed legacy CVE v4 section and files (`default/cve/*` removed). CVE editing is now centered on `cve5`.
- Removed `/review` routes and related Preview/Slides shortcuts used by the old CVE flow.
- Docker build baseline updated from Node 12 to Node 18 (fix for Docker build issue #246).
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
- Improved CVE Services responsiveness and latency feedback:
  - Added spinner/text feedback for portal open, list fetch, CVE load, and publish actions.
  - Preserved selected portal filter state/year across portal view refreshes.
- Support cached drafts publishing workflow improvements:
  - Updated Drafts Manager table/actions with sortable columns and clearer status behavior.
- Portal/login dialogs refreshed with updated form styling and iconography.
- CVSS 4 UI cleanup:
  - Label simplification (for example, Base Severity -> Severity, CVSS-B -> Score)
  - Additional copy/vector UI polish
- Broad CSS and icon refactors (including removal of unused code and improved consistency).
- Each section gets its own favicon

## Data, Schema, And Content Updates

- ADP schema/workflow updates:
  - Validation now prevents duplicate ADP containers for the same organization.
  - ADP container schema/UI refinements for metadata and authoring flow.
- Updated CWE dataset and added `scripts/parse-cwe.js` to regenerate CWE examples.
- Added NVD empty-state guidance in list UI.
- Refreshed CVE Services guide screenshots and related documentation pages.
- Updated schema generator default engine metadata to `Vulnogram 1.0.0`.

## Developer And Build Changes
- Added editor bundling script: `scripts/bundle-editor.js`.
- Added documentation generation script: `scripts/gendoc.js`.
- Expanded doc-generation automation to support richer scripted capture steps for screenshots/workflows.
- Makefile updated for new editor bundle + CSS/asset targets.
- Added new realtime server module: `lib/realtime.js`.

## Upgrade Notes

- If you relied on old CVE4 or `/review/*` endpoints, migrate workflows to CVE5 and current preview/render paths.
- If you build with Docker, ensure your image/runtime baseline is Node 18 (or newer) rather than Node 12.
- For Team mode behind reverse proxies, ensure Socket.IO/websocket transport is allowed.
- To disable realtime behavior, set `VULNOGRAM_REALTIME=false` or `realtime.enabled = false`.
