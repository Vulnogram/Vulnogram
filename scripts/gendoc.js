#!/usr/bin/env node
'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const http = require('http');
const crypto = require('crypto');
const { pathToFileURL } = require('url');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_MANIFEST_PATH = path.join(PROJECT_ROOT, 'docs', 'screenshot-manifest.json');
const DEFAULT_STATE_FILENAME = '.screenshot-state.json';

function printUsage() {
  console.log(
    [
      'Usage: node scripts/gendoc.js [options]',
      '',
      'Options:',
      '  --manifest <path>   Path to screenshot manifest JSON (default: docs/screenshot-manifest.json)',
      '  --base-url <url>    Capture from an existing Vulnogram URL instead of local standalone server',
      '  --port <number>     Port for local standalone server (default: 0 = random)',
      '  --only <ids>        Comma-separated screenshot IDs to capture',
      '  --force             Rewrite screenshot files even if hash did not change',
      '  --no-capture        Regenerate markdown/state without taking new screenshots',
      '  --help              Show this help text'
    ].join('\n')
  );
}

function parseArgs(argv) {
  const options = {
    manifestPath: DEFAULT_MANIFEST_PATH,
    baseUrl: null,
    port: 0,
    only: null,
    force: false,
    capture: true
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else if (arg === '--manifest') {
      i += 1;
      options.manifestPath = argv[i];
    } else if (arg.startsWith('--manifest=')) {
      options.manifestPath = arg.split('=').slice(1).join('=');
    } else if (arg === '--base-url') {
      i += 1;
      options.baseUrl = argv[i];
    } else if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.split('=').slice(1).join('=');
    } else if (arg === '--port') {
      i += 1;
      options.port = Number(argv[i] || 0);
    } else if (arg.startsWith('--port=')) {
      options.port = Number(arg.split('=').slice(1).join('') || 0);
    } else if (arg === '--only') {
      i += 1;
      options.only = String(argv[i] || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (arg.startsWith('--only=')) {
      options.only = arg
        .split('=')
        .slice(1)
        .join('=')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--no-capture') {
      options.capture = false;
    } else {
      throw new Error('Unknown option: ' + arg);
    }
  }

  if (!Number.isFinite(options.port) || options.port < 0 || options.port > 65535) {
    throw new Error('Invalid port: ' + options.port);
  }
  return options;
}

function normalizeManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Manifest JSON must be an object');
  }
  if (!Array.isArray(manifest.sections) || manifest.sections.length === 0) {
    throw new Error('Manifest is missing non-empty "sections" array');
  }
  if (!Array.isArray(manifest.screenshots) || manifest.screenshots.length === 0) {
    throw new Error('Manifest is missing non-empty "screenshots" array');
  }

  const sectionIds = new Set();
  for (const section of manifest.sections) {
    if (!section || typeof section !== 'object' || !section.id || !section.title) {
      throw new Error('Each section must include "id" and "title"');
    }
    sectionIds.add(section.id);
  }

  const screenshotIds = new Set();
  for (const shot of manifest.screenshots) {
    if (!shot || typeof shot !== 'object') {
      throw new Error('Each screenshot entry must be an object');
    }
    if (!shot.id || !shot.file || !shot.section || !shot.alt || !Array.isArray(shot.steps)) {
      throw new Error('Screenshot entries require "id", "file", "section", "alt", and "steps"');
    }
    if (!sectionIds.has(shot.section)) {
      throw new Error('Screenshot "' + shot.id + '" references unknown section "' + shot.section + '"');
    }
    if (screenshotIds.has(shot.id)) {
      throw new Error('Duplicate screenshot id in manifest: ' + shot.id);
    }
    screenshotIds.add(shot.id);
  }

  return manifest;
}

async function readJson(filePath) {
  const raw = await fsp.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function readJsonIfExists(filePath, fallback) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function writeTextIfChanged(filePath, content) {
  let current = null;
  try {
    current = await fsp.readFile(filePath, 'utf8');
  } catch (error) {
    if (!(error && error.code === 'ENOENT')) {
      throw error;
    }
  }
  if (current === content) {
    return false;
  }
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, content, 'utf8');
  return true;
}

async function fileHash(filePath) {
  const buffer = await fsp.readFile(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function toUtcTimestamp(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function asPublicDocPath(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function makeMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.map': 'application/json; charset=utf-8'
  };
  return map[ext] || 'application/octet-stream';
}

function startStaticServer(rootDir, port) {
  const absoluteRoot = path.resolve(rootDir);
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const parsed = new URL(req.url || '/', 'http://127.0.0.1');
        let requestPath = decodeURIComponent(parsed.pathname || '/');
        if (requestPath === '/') {
          requestPath = '/index.html';
        }

        const relativePath = path.normalize(requestPath).replace(/^[/\\]+/, '');
        let filePath = path.resolve(absoluteRoot, relativePath);
        const rel = path.relative(absoluteRoot, filePath);
        if (rel.startsWith('..') || path.isAbsolute(rel)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        let stat;
        try {
          stat = await fsp.stat(filePath);
        } catch (error) {
          if (error && error.code === 'ENOENT') {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
          throw error;
        }

        if (stat.isDirectory()) {
          filePath = path.join(filePath, 'index.html');
          stat = await fsp.stat(filePath);
        }

        const data = await fsp.readFile(filePath);
        res.writeHead(200, {
          'Content-Type': makeMimeType(filePath),
          'Content-Length': data.length
        });
        res.end(data);
      } catch (error) {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });

    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function loadPlaywrightModule() {
  const moduleNames = ['playwright', 'playwright-core'];
  for (const moduleName of moduleNames) {
    try {
      const mod = await import(moduleName);
      return mod.default || mod;
    } catch (error) {
      continue;
    }
  }
  return null;
}

async function applyAction(page, action, context) {
  const name = action.action;
  if (!name) {
    throw new Error('Action entry is missing "action"');
  }

  switch (name) {
    case 'setViewport': {
      const width = Number(action.width || 1600);
      const height = Number(action.height || 1000);
      await page.setViewportSize({ width, height });
      break;
    }
    case 'goto': {
      let targetUrl = context.baseUrl;
      if (action.url) {
        targetUrl = String(action.url);
      } else if (action.path) {
        targetUrl = new URL(String(action.path), context.baseUrl).toString();
      }
      await page.goto(targetUrl, { waitUntil: action.waitUntil || 'networkidle' });
      break;
    }
    case 'setStyle': {
      const selector = String(action.selector || '').trim();
      const property = String(action.property || '').trim();
      if (!selector || !property) {
        throw new Error('setStyle action requires "selector" and "property"');
      }
      const value = String(action.value || '');
      const important = Boolean(action.important);
      await page.evaluate(
        ({ targetSelector, cssProperty, cssValue, useImportant }) => {
          const element = document.querySelector(targetSelector);
          if (!element) {
            throw new Error('Style target selector not found: ' + targetSelector);
          }
          element.style.setProperty(cssProperty, cssValue, useImportant ? 'important' : '');
        },
        {
          targetSelector: selector,
          cssProperty: property,
          cssValue: value,
          useImportant: important
        }
      );
      break;
    }
    case 'loadCveDocument': {
      const cveId = String(action.cveId || '').trim();
      if (!cveId) {
        throw new Error('loadCveDocument action requires "cveId"');
      }
      await page.evaluate(async (docId) => {
        if (typeof window.cveLoad !== 'function') {
          throw new Error('window.cveLoad is unavailable');
        }
        await Promise.resolve(window.cveLoad(docId));
      }, cveId);
      break;
    }
    case 'addArrowOverlay': {
      const selector = String(action.selector || '').trim();
      if (!selector) {
        throw new Error('addArrowOverlay action requires "selector"');
      }
      const color = String(action.color || '#d62828');
      const outlineColor = String(action.outlineColor || '#ffffff');
      const width = Math.max(4, Number(action.width || 14));
      const outlineWidth = Math.max(width + 2, Number(action.outlineWidth || width + 8));
      const startOffsetX = Number(action.startOffsetX || -320);
      const startOffsetY = Number(action.startOffsetY || 200);
      const endOffsetX = Number(action.endOffsetX || 0);
      const endOffsetY = Number(action.endOffsetY || 0);
      const curve = Number(action.curve || 110);

      await page.evaluate(
        ({
          targetSelector,
          strokeColor,
          strokeOutlineColor,
          strokeWidth,
          strokeOutlineWidth,
          offsetX,
          offsetY,
          targetOffsetX,
          targetOffsetY,
          curveY
        }) => {
          const target = document.querySelector(targetSelector);
          if (!target) {
            throw new Error('Arrow target selector not found: ' + targetSelector);
          }

          const rect = target.getBoundingClientRect();
          const endX = rect.left + rect.width / 2 + targetOffsetX;
          const endY = rect.top + rect.height / 2 + targetOffsetY;
          const startX = endX + offsetX;
          const startY = endY + offsetY;

          const c1X = startX + (endX - startX) * 0.35;
          const c1Y = startY - curveY;
          const c2X = startX + (endX - startX) * 0.75;
          const c2Y = endY + curveY * 0.2;
          const pathD = ['M', startX, startY, 'C', c1X, c1Y, c2X, c2Y, endX, endY].join(' ');

          const svgNS = 'http://www.w3.org/2000/svg';
          const overlayId = '__gendoc_arrow_overlay__';
          const outlineMarkerId = '__gendoc_arrow_head_outline__';
          const colorMarkerId = '__gendoc_arrow_head_color__';

          let overlay = document.getElementById(overlayId);
          if (!overlay) {
            overlay = document.createElementNS(svgNS, 'svg');
            overlay.setAttribute('id', overlayId);
            overlay.style.position = 'fixed';
            overlay.style.left = '0';
            overlay.style.top = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '2147483647';
            overlay.style.overflow = 'visible';
            if (document.body) {
              document.body.appendChild(overlay);
            } else {
              throw new Error('Document body is unavailable for arrow overlay');
            }
          }

          const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
          const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
          overlay.setAttribute('viewBox', '0 0 ' + viewportWidth + ' ' + viewportHeight);
          overlay.setAttribute('width', String(viewportWidth));
          overlay.setAttribute('height', String(viewportHeight));
          overlay.replaceChildren();

          const defs = document.createElementNS(svgNS, 'defs');
          const markerOutline = document.createElementNS(svgNS, 'marker');
          const markerColor = document.createElementNS(svgNS, 'marker');
          const outlineHeadSize = Math.max(strokeOutlineWidth * 2.2, 24);
          const colorHeadSize = Math.max(strokeWidth * 2.2, 20);

          markerOutline.setAttribute('id', outlineMarkerId);
          markerOutline.setAttribute('viewBox', '0 0 ' + outlineHeadSize + ' ' + outlineHeadSize);
          markerOutline.setAttribute('refX', String(outlineHeadSize - 2));
          markerOutline.setAttribute('refY', String(outlineHeadSize / 2));
          markerOutline.setAttribute('markerWidth', String(outlineHeadSize));
          markerOutline.setAttribute('markerHeight', String(outlineHeadSize));
          markerOutline.setAttribute('orient', 'auto');
          markerOutline.setAttribute('markerUnits', 'userSpaceOnUse');
          const outlineHead = document.createElementNS(svgNS, 'path');
          outlineHead.setAttribute(
            'd',
            'M 0 0 L ' + outlineHeadSize + ' ' + outlineHeadSize / 2 + ' L 0 ' + outlineHeadSize + ' z'
          );
          outlineHead.setAttribute('fill', strokeOutlineColor);
          markerOutline.appendChild(outlineHead);

          markerColor.setAttribute('id', colorMarkerId);
          markerColor.setAttribute('viewBox', '0 0 ' + colorHeadSize + ' ' + colorHeadSize);
          markerColor.setAttribute('refX', String(colorHeadSize - 2));
          markerColor.setAttribute('refY', String(colorHeadSize / 2));
          markerColor.setAttribute('markerWidth', String(colorHeadSize));
          markerColor.setAttribute('markerHeight', String(colorHeadSize));
          markerColor.setAttribute('orient', 'auto');
          markerColor.setAttribute('markerUnits', 'userSpaceOnUse');
          const colorHead = document.createElementNS(svgNS, 'path');
          colorHead.setAttribute(
            'd',
            'M 0 0 L ' + colorHeadSize + ' ' + colorHeadSize / 2 + ' L 0 ' + colorHeadSize + ' z'
          );
          colorHead.setAttribute('fill', strokeColor);
          markerColor.appendChild(colorHead);

          defs.appendChild(markerOutline);
          defs.appendChild(markerColor);
          overlay.appendChild(defs);

          const outlinePath = document.createElementNS(svgNS, 'path');
          outlinePath.setAttribute('d', pathD);
          outlinePath.setAttribute('fill', 'none');
          outlinePath.setAttribute('stroke', strokeOutlineColor);
          outlinePath.setAttribute('stroke-width', String(strokeOutlineWidth));
          outlinePath.setAttribute('stroke-linecap', 'round');
          outlinePath.setAttribute('stroke-linejoin', 'round');
          outlinePath.setAttribute('marker-end', 'url(#' + outlineMarkerId + ')');
          overlay.appendChild(outlinePath);

          const colorPath = document.createElementNS(svgNS, 'path');
          colorPath.setAttribute('d', pathD);
          colorPath.setAttribute('fill', 'none');
          colorPath.setAttribute('stroke', strokeColor);
          colorPath.setAttribute('stroke-width', String(strokeWidth));
          colorPath.setAttribute('stroke-linecap', 'round');
          colorPath.setAttribute('stroke-linejoin', 'round');
          colorPath.setAttribute('marker-end', 'url(#' + colorMarkerId + ')');
          overlay.appendChild(colorPath);
        },
        {
          targetSelector: selector,
          strokeColor: color,
          strokeOutlineColor: outlineColor,
          strokeWidth: width,
          strokeOutlineWidth: outlineWidth,
          offsetX: startOffsetX,
          offsetY: startOffsetY,
          targetOffsetX: endOffsetX,
          targetOffsetY: endOffsetY,
          curveY: curve
        }
      );
      break;
    }
    case 'addCircleOverlay': {
      const selector = String(action.selector || '').trim();
      if (!selector) {
        throw new Error('addCircleOverlay action requires "selector"');
      }
      const color = String(action.color || '#d62828');
      const outlineColor = String(action.outlineColor || '#ffffff');
      const width = Math.max(2, Number(action.width || 8));
      const outlineWidth = Math.max(width + 2, Number(action.outlineWidth || width + 6));
      const paddingX = Number(action.paddingX || 24);
      const paddingY = Number(action.paddingY || 16);
      const centerOffsetX = Number(action.centerOffsetX || 0);
      const centerOffsetY = Number(action.centerOffsetY || 0);
      const containerSelector = String(action.containerSelector || '').trim();

      await page.evaluate(
        ({
          targetSelector,
          strokeColor,
          strokeOutlineColor,
          strokeWidth,
          strokeOutlineWidth,
          padX,
          padY,
          offsetX,
          offsetY,
          overlayContainerSelector
        }) => {
          const target = document.querySelector(targetSelector);
          if (!target) {
            throw new Error('Circle target selector not found: ' + targetSelector);
          }

          const rect = target.getBoundingClientRect();
          const cx = rect.left + rect.width / 2 + offsetX;
          const cy = rect.top + rect.height / 2 + offsetY;
          const rx = Math.max(10, rect.width / 2 + padX);
          const ry = Math.max(10, rect.height / 2 + padY);

          const svgNS = 'http://www.w3.org/2000/svg';
          const overlayId = '__gendoc_circle_overlay__';
          let overlayHost = document.body;
          if (overlayContainerSelector) {
            overlayHost = document.querySelector(overlayContainerSelector);
            if (!overlayHost) {
              throw new Error('Circle overlay container not found: ' + overlayContainerSelector);
            }
          }

          let overlay = document.getElementById(overlayId);
          if (!overlay) {
            overlay = document.createElementNS(svgNS, 'svg');
            overlay.setAttribute('id', overlayId);
            overlay.style.position = 'fixed';
            overlay.style.left = '0';
            overlay.style.top = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '2147483647';
            overlay.style.overflow = 'visible';
            overlayHost.appendChild(overlay);
          } else if (overlay.parentElement !== overlayHost) {
            overlay.remove();
            overlayHost.appendChild(overlay);
          }

          const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
          const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
          overlay.setAttribute('viewBox', '0 0 ' + viewportWidth + ' ' + viewportHeight);
          overlay.setAttribute('width', String(viewportWidth));
          overlay.setAttribute('height', String(viewportHeight));
          overlay.replaceChildren();

          const outlineEllipse = document.createElementNS(svgNS, 'ellipse');
          outlineEllipse.setAttribute('cx', String(cx));
          outlineEllipse.setAttribute('cy', String(cy));
          outlineEllipse.setAttribute('rx', String(rx));
          outlineEllipse.setAttribute('ry', String(ry));
          outlineEllipse.setAttribute('fill', 'none');
          outlineEllipse.setAttribute('stroke', strokeOutlineColor);
          outlineEllipse.setAttribute('stroke-width', String(strokeOutlineWidth));
          overlay.appendChild(outlineEllipse);

          const colorEllipse = document.createElementNS(svgNS, 'ellipse');
          colorEllipse.setAttribute('cx', String(cx));
          colorEllipse.setAttribute('cy', String(cy));
          colorEllipse.setAttribute('rx', String(rx));
          colorEllipse.setAttribute('ry', String(ry));
          colorEllipse.setAttribute('fill', 'none');
          colorEllipse.setAttribute('stroke', strokeColor);
          colorEllipse.setAttribute('stroke-width', String(strokeWidth));
          overlay.appendChild(colorEllipse);
        },
        {
          targetSelector: selector,
          strokeColor: color,
          strokeOutlineColor: outlineColor,
          strokeWidth: width,
          strokeOutlineWidth: outlineWidth,
          padX: paddingX,
          padY: paddingY,
          offsetX: centerOffsetX,
          offsetY: centerOffsetY,
          overlayContainerSelector: containerSelector
        }
      );
      break;
    }
    case 'showBrowserFrame': {
      const heightPx = Math.max(48, Number(action.height || 64));
      const radiusPx = Math.max(8, Number(action.radius || 14));
      const displayUrl = action.url ? String(action.url) : '';
      await page.evaluate(
        ({ frameHeight, frameRadius, urlText }) => {
          const frameId = '__gendoc_browser_frame__';
          const styleId = '__gendoc_browser_frame_style__';
          const doc = document;
          const body = doc.body;
          const head = doc.head || doc.documentElement;
          if (!body || !head) {
            return;
          }

          const existingFrame = doc.getElementById(frameId);
          if (existingFrame) {
            const urlNode = existingFrame.querySelector('[data-gendoc-url]');
            if (urlNode) {
              urlNode.textContent = urlText || window.location.href;
            }
            return;
          }

          if (!doc.getElementById(styleId)) {
            const style = doc.createElement('style');
            style.id = styleId;
            style.textContent =
              'body[data-gendoc-browser-frame="1"]{' +
              'margin:0 !important;' +
              'padding-top:calc(' +
              frameHeight +
              'px + 12px) !important;' +
              'background:#e9edf4 !important;' +
              'box-sizing:border-box;' +
              '}' +
              '#' +
              frameId +
              '{position:fixed;top:10px;left:12px;right:12px;height:' +
              frameHeight +
              'px;background:#f8fafc;border:1px solid #c7d2e3;border-radius:' +
              frameRadius +
              'px;display:flex;align-items:center;gap:10px;padding:0 12px;z-index:2147483647;box-shadow:0 4px 12px rgba(16,24,40,0.08);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}' +
              '#' +
              frameId +
              ' .gendoc-dot{width:11px;height:11px;border-radius:50%;display:inline-block;}' +
              '#' +
              frameId +
              ' .gendoc-url{flex:1;min-width:0;padding:10px 14px;border-radius:999px;background:#eef2f8;border:1px solid #d0dae8;color:#1f2937;font-size:15px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}';
            head.appendChild(style);
          }

          const frame = doc.createElement('div');
          frame.id = frameId;
          frame.innerHTML =
            '<span class="gendoc-dot" style="background:#ff5f57"></span>' +
            '<span class="gendoc-dot" style="background:#ffbd2e"></span>' +
            '<span class="gendoc-dot" style="background:#28c840"></span>' +
            '<div class="gendoc-url" data-gendoc-url></div>';

          body.setAttribute('data-gendoc-browser-frame', '1');
          body.prepend(frame);

          const urlNode = frame.querySelector('[data-gendoc-url]');
          if (urlNode) {
            urlNode.textContent = urlText || window.location.href;
          }
        },
        { frameHeight: heightPx, frameRadius: radiusPx, urlText: displayUrl }
      );
      break;
    }
    case 'waitForSelector': {
      await page.waitForSelector(String(action.selector), {
        state: action.state || 'visible',
        timeout: Number(action.timeout || 30000)
      });
      break;
    }
    case 'click': {
      await page.click(String(action.selector), {
        timeout: Number(action.timeout || 30000)
      });
      break;
    }
    case 'waitForTimeout': {
      await page.waitForTimeout(Number(action.ms || 200));
      break;
    }
    case 'selectTab': {
      const tabId = String(action.tabId || '');
      if (!tabId) {
        throw new Error('selectTab action requires "tabId"');
      }
      await page.click('label[for="' + tabId + '"]');
      if (action.waitForSelector) {
        await page.waitForSelector(String(action.waitForSelector), {
          state: 'visible',
          timeout: Number(action.timeout || 30000)
        });
      }
      break;
    }
    case 'showPortalLogin': {
      await page.evaluate(() => {
        var dialog = document.getElementById('cvePortalDialog');
        if (typeof window.showPortalLogin === 'function') {
          window.showPortalLogin();
        } else {
          var nav = document.getElementById('cvePortalNav');
          if (nav) {
            nav.click();
          }
        }
        if (dialog && !dialog.open && typeof dialog.showModal === 'function') {
          dialog.showModal();
        }
      });
      break;
    }
    case 'renderPortalMock': {
      const variant = String(action.variant || 'member');
      await page.evaluate((kind) => {
        var dialog = document.getElementById('cvePortalDialog');
        var port = document.getElementById('port');
        if (!dialog || !port) {
          throw new Error('Portal dialog container is missing');
        }
        if (!dialog.open && typeof dialog.showModal === 'function') {
          dialog.showModal();
        }
        if (typeof window.cveRender !== 'function') {
          port.innerHTML = '<div class="pad">Portal template render function is unavailable.</div>';
          return;
        }

        var isAdmin = kind === 'admin';
        var userInfo = {
          username: isAdmin ? 'admin.user' : 'cna.user',
          name: {
            first: isAdmin ? 'Portal' : 'CNA',
            last: isAdmin ? 'Admin' : 'User'
          },
          active: true,
          authority: {
            active_roles: isAdmin ? ['ADMIN'] : ['USER']
          }
        };
        var orgInfo = {
          name: 'Example CNA',
          short_name: 'example-cna',
          authority: {
            active_roles: ['CNA']
          }
        };

        port.innerHTML = window.cveRender({
          ctemplate: 'portal',
          portalType: 'test',
          userInfo: userInfo,
          org: orgInfo
        });

        if (isAdmin) {
          var data = [
            {
              username: 'getid',
              org_UUID: 'ba34e592-f0ae-45a4-bc65-de9154191442',
              time: {
                created: '2022-05-06T02:15:30.328Z',
                modified: '2024-10-22T18:49:26.224Z'
              },
              UUID: 'cd8598c5-4d8c-4fbc-9196-787ec1ad187b',
              active: true,
              authority: {
                active_roles: []
              },
              name: {
                first: 'Get',
                last: 'Ident',
                middle: '',
                suffix: ''
              }
            },
            {
              username: 'alice.redwood',
              org_UUID: 'ba34e592-f0ae-45a4-bc65-de9154191442',
              time: {
                created: '2023-01-10T09:20:11.100Z',
                modified: '2025-01-14T11:03:00.500Z'
              },
              UUID: '63ed3ae8-68f7-4ead-b8f4-4c22fa730001',
              active: true,
              authority: {
                active_roles: ['ADMIN']
              },
              name: {
                first: 'Alice',
                last: 'Redwood',
                middle: '',
                suffix: ''
              }
            },
            {
              username: 'bruno.kent',
              org_UUID: 'ba34e592-f0ae-45a4-bc65-de9154191442',
              time: {
                created: '2023-02-18T13:42:19.000Z',
                modified: '2024-09-12T08:17:44.000Z'
              },
              UUID: '63ed3ae8-68f7-4ead-b8f4-4c22fa730002',
              active: true,
              authority: {
                active_roles: ['USER']
              },
              name: {
                first: 'Bruno',
                last: 'Kent',
                middle: '',
                suffix: ''
              }
            },
            {
              username: 'cora.fields',
              org_UUID: 'ba34e592-f0ae-45a4-bc65-de9154191442',
              time: {
                created: '2023-03-22T16:00:00.000Z',
                modified: '2025-02-03T21:12:05.000Z'
              },
              UUID: '63ed3ae8-68f7-4ead-b8f4-4c22fa730003',
              active: true,
              authority: {
                active_roles: ['USER']
              },
              name: {
                first: 'Cora',
                last: 'Fields',
                middle: 'M',
                suffix: ''
              }
            },
            {
              username: 'diego.lake',
              org_UUID: 'ba34e592-f0ae-45a4-bc65-de9154191442',
              time: {
                created: '2023-05-01T07:33:28.000Z',
                modified: '2024-11-29T10:02:31.000Z'
              },
              UUID: '63ed3ae8-68f7-4ead-b8f4-4c22fa730004',
              active: false,
              authority: {
                active_roles: ['USER']
              },
              name: {
                first: 'Diego',
                last: 'Lake',
                middle: '',
                suffix: ''
              }
            },
            {
              username: 'eva.north',
              org_UUID: 'ba34e592-f0ae-45a4-bc65-de9154191442',
              time: {
                created: '2023-07-12T12:44:53.000Z',
                modified: '2025-01-19T19:45:17.000Z'
              },
              UUID: '63ed3ae8-68f7-4ead-b8f4-4c22fa730005',
              active: true,
              authority: {
                active_roles: []
              },
              name: {
                first: 'Eva',
                last: 'North',
                middle: '',
                suffix: 'Jr.'
              }
            },
            {
              username: 'farah.hill',
              org_UUID: 'ba34e592-f0ae-45a4-bc65-de9154191442',
              time: {
                created: '2023-09-03T05:27:40.000Z',
                modified: '2024-12-08T14:08:09.000Z'
              },
              UUID: '63ed3ae8-68f7-4ead-b8f4-4c22fa730006',
              active: true,
              authority: {
                active_roles: ['USER']
              },
              name: {
                first: 'Farah',
                last: 'Hill',
                middle: '',
                suffix: ''
              }
            }
          ];

          var userListPopup = document.getElementById('userListPopup');
          if (userListPopup) {
            userListPopup.setAttribute('ontoggle', '');
          }

          var userList = document.getElementById('userlist');
          if (userList) {
            userList.innerHTML = window.cveRender({
              ctemplate: 'listUsers',
              users: data
            });
          }
        }
      }, variant);
      break;
    }
    case 'openUserList': {
      await page.evaluate(() => {
        var summary = document.querySelector('#userListPopup > summary');
        if (summary) {
          summary.click();
        }
      });
      break;
    }
    default:
      throw new Error('Unsupported action: ' + name);
  }
}

async function captureScreenshot(page, shot, screenshotsDir, context) {
  const tempPath = path.join(
    os.tmpdir(),
    'gendoc-' +
      shot.id +
      '-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).slice(2, 8) +
      '.png'
  );
  const outputPath = path.join(screenshotsDir, shot.file);

  for (const step of shot.steps) {
    await applyAction(page, step, context);
  }

  if (shot.target) {
    await page.locator(shot.target).first().screenshot({
      path: tempPath,
      animations: 'disabled'
    });
  } else {
    await page.screenshot({
      path: tempPath,
      fullPage: Boolean(shot.fullPage),
      animations: 'disabled'
    });
  }

  const nextHash = await fileHash(tempPath);
  let previousHash = null;
  try {
    previousHash = await fileHash(outputPath);
  } catch (error) {
    if (!(error && error.code === 'ENOENT')) {
      throw error;
    }
  }

  const changed = context.force || nextHash !== previousHash;
  if (changed) {
    await fsp.mkdir(path.dirname(outputPath), { recursive: true });
    await fsp.copyFile(tempPath, outputPath);
  }
  await fsp.unlink(tempPath).catch(() => undefined);

  return {
    id: shot.id,
    file: shot.file,
    hash: nextHash,
    changed,
    exists: true
  };
}

async function getExistingScreenshotStatus(shot, screenshotsDir) {
  const outputPath = path.join(screenshotsDir, shot.file);
  try {
    const hash = await fileHash(outputPath);
    return {
      id: shot.id,
      file: shot.file,
      hash,
      changed: false,
      exists: true
    };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return {
        id: shot.id,
        file: shot.file,
        hash: null,
        changed: false,
        exists: false
      };
    }
    throw error;
  }
}

function buildMarkdown(manifest, screenshotStatuses, generatedAt) {
  const title = manifest.title || 'Using Vulnogram with CVE Services';
  const sourcePdfTitle = manifest.sourcePdfTitle || 'Using Vulnogram with CVE Services';
  const sourcePdfDate = manifest.sourcePdfDate || 'unknown';
  const sourcePdf = manifest.sourcePdf;
  const screenshotsDir = asPublicDocPath(manifest.screenshotsDir || 'screenshots');
  const sections = manifest.sections || [];

  const lines = [];
  lines.push('# ' + title);
  lines.push('');
  lines.push(
    'This guide is adapted from [' +
      sourcePdfTitle +
      '](' +
      sourcePdf +
      ') and aligned to the current Vulnogram UI.'
  );
  lines.push('');
  lines.push('- Source PDF date: ' + sourcePdfDate);
  lines.push('- Source PDF URL: ' + sourcePdf);
  lines.push('- Last generated: ' + generatedAt);
  lines.push('- Screenshot refresh script: `node scripts/gendoc.js`');
  lines.push('');

  for (const section of sections) {
    lines.push('## ' + section.title);
    lines.push('');
    if (section.text) {
      lines.push(section.text);
      lines.push('');
    }

    const sectionShots = manifest.screenshots.filter((shot) => shot.section === section.id);
    for (const shot of sectionShots) {
      const status = screenshotStatuses.get(shot.id);
      const imagePath = './' + asPublicDocPath(path.join(screenshotsDir, shot.file));
      lines.push('![' + shot.alt + '](' + imagePath + ')');
      if (shot.caption) {
        lines.push('*' + shot.caption + '*');
      }
      if (!status || !status.exists) {
        lines.push('_Screenshot missing. Run `node scripts/gendoc.js` to generate this file._');
      }
      lines.push('');
    }
  }

  lines.push('## Regenerate Documentation');
  lines.push('');
  lines.push('- Capture screenshots and regenerate markdown: `node scripts/gendoc.js`');
  lines.push('- Regenerate markdown only: `node scripts/gendoc.js --no-capture`');
  lines.push('- Capture specific screenshots: `node scripts/gendoc.js --only 02-portal-login,03-reserve-cve-ids`');
  lines.push('');
  lines.push(
    'The screenshot workflow is incremental: each image is hashed and only rewritten when the rendered output changes.'
  );
  lines.push('');

  return lines.join('\n');
}

function selectScreenshots(manifest, onlyIds) {
  if (!onlyIds || onlyIds.length === 0) {
    return manifest.screenshots.slice();
  }
  const known = new Set(manifest.screenshots.map((shot) => shot.id));
  for (const id of onlyIds) {
    if (!known.has(id)) {
      throw new Error('Unknown screenshot ID in --only: ' + id);
    }
  }
  return manifest.screenshots.filter((shot) => onlyIds.includes(shot.id));
}

function mergeStatuses(manifest, updates, existingStatuses) {
  const merged = new Map();
  const updateMap = new Map();
  for (const item of updates) {
    updateMap.set(item.id, item);
  }
  for (const shot of manifest.screenshots) {
    if (updateMap.has(shot.id)) {
      merged.set(shot.id, updateMap.get(shot.id));
    } else if (existingStatuses.has(shot.id)) {
      merged.set(shot.id, existingStatuses.get(shot.id));
    }
  }
  return merged;
}

function buildState(manifest, statuses, priorState, generatedAt) {
  const state = {
    generatedAt,
    sourcePdf: manifest.sourcePdf,
    screenshots: {}
  };

  for (const shot of manifest.screenshots) {
    const status = statuses.get(shot.id);
    const previous = priorState && priorState.screenshots ? priorState.screenshots[shot.id] : null;
    state.screenshots[shot.id] = {
      file: shot.file,
      hash: status ? status.hash : previous ? previous.hash : null,
      exists: status ? status.exists : previous ? previous.exists : false,
      updatedAt: status && status.changed ? generatedAt : previous ? previous.updatedAt : generatedAt
    };
  }
  return state;
}

function summarizeStatuses(statuses) {
  let updated = 0;
  let unchanged = 0;
  let missing = 0;
  for (const status of statuses.values()) {
    if (!status.exists) {
      missing += 1;
    } else if (status.changed) {
      updated += 1;
    } else {
      unchanged += 1;
    }
  }
  return { updated, unchanged, missing };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifestPath = path.resolve(PROJECT_ROOT, options.manifestPath);
  const manifest = normalizeManifest(await readJson(manifestPath));

  const docsDir = path.dirname(manifestPath);
  const screenshotsDir = path.resolve(docsDir, manifest.screenshotsDir || 'screenshots');
  const markdownPath = path.resolve(docsDir, manifest.outputMarkdown || 'using-vulnogram-cve-services.md');
  const statePath = path.resolve(docsDir, DEFAULT_STATE_FILENAME);

  await fsp.mkdir(screenshotsDir, { recursive: true });

  const priorState = await readJsonIfExists(statePath, { screenshots: {} });
  const selectedShots = selectScreenshots(manifest, options.only);

  const existingStatuses = new Map();
  for (const shot of manifest.screenshots) {
    existingStatuses.set(shot.id, await getExistingScreenshotStatus(shot, screenshotsDir));
  }

  let baseUrl = options.baseUrl || 'http://127.0.0.1:3555/';
  let server = null;
  let browser = null;
  let capturedStatuses = [];

  try {
    if (options.capture) {
      const playwright = await loadPlaywrightModule();
      if (!playwright || !playwright.chromium) {
        throw new Error(
          'Playwright is not installed. Install it with `npm install --save-dev playwright` and `npx playwright install chromium`, or rerun with --no-capture.'
        );
      }

      if (!options.baseUrl) {
        const standaloneRoot = path.join(PROJECT_ROOT, 'standalone');
        try {
          server = await startStaticServer(standaloneRoot, options.port);
          const address = server.address();
          const port = typeof address === 'object' && address ? address.port : options.port;
          baseUrl = 'http://127.0.0.1:' + port + '/';
        } catch (error) {
          const code = error && error.code ? error.code : '';
          if (code === 'EPERM' || code === 'EACCES') {
            baseUrl = pathToFileURL(path.join(standaloneRoot, 'index.html')).toString();
            console.warn('Local server unavailable; falling back to file URL capture:', baseUrl);
          } else {
            throw error;
          }
        }
      }

      browser = await playwright.chromium.launch({ headless: true });
      for (const shot of selectedShots) {
        const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
        page.setDefaultTimeout(30000);
        const status = await captureScreenshot(page, shot, screenshotsDir, {
          baseUrl,
          force: options.force
        });
        capturedStatuses.push(status);
        await page.close();
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server) {
      await closeServer(server);
    }
  }

  let mergedStatuses = existingStatuses;
  if (capturedStatuses.length > 0) {
    mergedStatuses = mergeStatuses(manifest, capturedStatuses, existingStatuses);
  }

  if (!options.capture) {
    mergedStatuses = existingStatuses;
  }

  const generatedAt = toUtcTimestamp(new Date());
  const markdown = buildMarkdown(manifest, mergedStatuses, generatedAt);
  const markdownChanged = await writeTextIfChanged(markdownPath, markdown);

  const nextState = buildState(manifest, mergedStatuses, priorState, generatedAt);
  await writeJson(statePath, nextState);

  const summary = summarizeStatuses(mergedStatuses);
  console.log('Documentation generated at:', markdownPath);
  console.log('Screenshots directory:', screenshotsDir);
  console.log(
    'Screenshot summary:',
    summary.updated + ' updated,',
    summary.unchanged + ' unchanged,',
    summary.missing + ' missing'
  );
  console.log('Markdown', markdownChanged ? 'updated.' : 'unchanged.');
}

main().catch((error) => {
  console.error('gendoc failed:', error && error.message ? error.message : error);
  process.exit(1);
});
