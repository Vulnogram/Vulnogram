#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const entryArg = process.argv[2] || 'src/js/edit/index.js';
const outputArg = process.argv[3] || 'public/js/vg-editor.js';
const entryPath = path.resolve(repoRoot, entryArg);
const outputPath = path.resolve(repoRoot, outputArg);
const prependedFiles = [
    path.resolve(repoRoot, 'public/js/tagify.min.js')
];

const seen = new Set();
const ordered = [];

const importPattern = /^\s*import\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]\s*;?\s*$/gm;

function normalizeModulePath(fromFile, specifier) {
    if (!specifier.startsWith('.')) {
        throw new Error('Only relative imports are supported: ' + specifier);
    }

    var resolved = path.resolve(path.dirname(fromFile), specifier);
    if (!path.extname(resolved)) {
        resolved = resolved + '.js';
    }

    return resolved;
}

function ensureParentDir(filePath) {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function collectModules(filePath) {
    if (seen.has(filePath)) {
        return;
    }
    seen.add(filePath);

    const source = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = importPattern.exec(source)) !== null) {
        const dep = normalizeModulePath(filePath, match[1]);
        collectModules(dep);
    }

    ordered.push({
        filePath,
        source
    });
}

function stripModuleSyntax(source) {
    const lines = source.split(/\r?\n/);
    const out = [];
    let skippingExportList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (skippingExportList) {
            if (trimmed === '};' || trimmed === '}') {
                skippingExportList = false;
            }
            continue;
        }

        if (/^import\b/.test(trimmed)) {
            continue;
        }

        if (/^export\s*\{/.test(trimmed)) {
            if (!(trimmed.includes('}'))) {
                skippingExportList = true;
            }
            continue;
        }

        if (/^export\s+default\b/.test(trimmed)) {
            out.push(line.replace(/^\s*export\s+default\s+/, ''));
            continue;
        }

        if (/^export\s+(var|let|const|function|class)\b/.test(trimmed)) {
            out.push(line.replace(/^\s*export\s+/, ''));
            continue;
        }

        out.push(line);
    }

    return out.join('\n').replace(/\s+$/, '') + '\n';
}

collectModules(entryPath);

const renderedModules = ordered
    .map(function (moduleInfo) {
        return stripModuleSyntax(moduleInfo.source).replace(/\s+$/, '');
    })
    .filter(function (moduleSource) {
        return moduleSource.trim().length > 0;
    });

const prependedChunks = prependedFiles.map(function (filePath) {
    return fs.readFileSync(filePath, 'utf8').replace(/\s+$/, '');
});

const output = prependedChunks.concat(renderedModules).join('\n\n') + '\n';
ensureParentDir(outputPath);
fs.writeFileSync(outputPath, output);
process.stdout.write(
    'Bundled ' + ordered.length + ' module(s) and ' + prependedChunks.length +
    ' prepended file(s) into ' + path.relative(repoRoot, outputPath) + '\n'
);
