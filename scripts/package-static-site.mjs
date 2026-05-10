#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(rootDir, 'release');
const packageName = 'darts-pats-static-site';
const packageDir = path.join(releaseDir, packageName);
const zipPath = path.join(releaseDir, `${packageName}.zip`);
const tarPath = path.join(releaseDir, `${packageName}.tar.gz`);
const auditPath = path.join(releaseDir, 'static-package-audit.txt');
const includeReports = process.argv.includes('--include-reports');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const requiredPackageFiles = [
  'index.html',
  '_astro',
  'assets',
  'assets/logos/pl2-logo.jpg',
  'assets/prototypes/phase-9b/harrisonburg-parade-landscape-reference-draft.png',
  'assets/prototypes/phase-9b/harrisonburg-parade-portrait-reference-draft.png',
  'data/town_gown_exhibit_records_enriched.json',
  'data/town_gown_exhibit_analysis_summary.json',
  'data/town_gown_exhibit_records_enriched.csv',
  'scripts/exhibit.js',
];

const textExtensions = new Set([
  '.css',
  '.csv',
  '.html',
  '.js',
  '.json',
  '.mjs',
  '.svg',
  '.txt',
  '.webmanifest',
  '.xml',
]);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || rootDir,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
  });

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`Command failed: ${command} ${args.join(' ')}\n${output}`);
  }

  return result.stdout?.trim() || '';
}

function commandExists(command) {
  return spawnSync(command, ['--help'], { stdio: 'ignore' }).status === 0
    || spawnSync(command, ['-h'], { stdio: 'ignore' }).status === 0
    || spawnSync('which', [command], { encoding: 'utf8', stdio: 'ignore' }).status === 0;
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function removeNamedFiles(dir, filename) {
  if (!existsSync(dir)) return;
  const entries = await readdir(dir, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await removeNamedFiles(fullPath, filename);
    } else if (entry.isFile() && entry.name === filename) {
      await rm(fullPath, { force: true });
    }
  }));
}

async function relativeTopLevelEntries(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .map((entry) => `${entry.name}${entry.isDirectory() ? '/' : ''}`)
    .sort((a, b) => a.localeCompare(b));
}

async function summarizeDirectory(dir) {
  const files = await listFiles(dir);
  let totalBytes = 0;
  for (const file of files) totalBytes += (await stat(file)).size;
  return { fileCount: files.length, totalBytes };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = units.shift();
  while (value >= 1024 && units.length) {
    value /= 1024;
    unit = units.shift();
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${unit}`;
}

function cleanUrl(url) {
  return url.replace(/[),.;\]}]+$/, '');
}

function classifyUrl(line, url) {
  const lowerLine = line.toLowerCase();
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.startsWith('http://www.w3.org/') || lowerUrl.startsWith('https://www.w3.org/')) {
    return { severity: 'harmless', reason: 'SVG/XML namespace, not a network dependency' };
  }

  const isAnchorHref = /<a\b/i.test(line) && new RegExp(`href=["']${escapeRegExp(url)}["']`, 'i').test(line);
  if (isAnchorHref) {
    return { severity: 'harmless', reason: 'Plain credit link; not required for runtime' };
  }

  if (/(<script\b|<link\b|rel=["']stylesheet|src=["']|@import|url\(|fetch\()/i.test(line)) {
    return { severity: 'fail', reason: 'Remote runtime dependency candidate' };
  }

  if (/(fonts\.googleapis|fonts\.gstatic|unpkg|jsdelivr|analytics|gtag|plausible)/i.test(`${line} ${url}`)) {
    return { severity: 'fail', reason: 'Disallowed remote service/CDN/analytics reference' };
  }

  if (/\bcdn\b/i.test(line) || lowerUrl.includes('cdn')) {
    return { severity: 'fail', reason: 'CDN reference' };
  }

  return { severity: 'review', reason: 'External URL appears as text; not classified as a runtime dependency' };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function classifyFetch(line) {
  if (/fetch\(\s*['"`]https?:\/\//i.test(line)) {
    return { severity: 'fail', reason: 'Remote fetch call' };
  }
  return { severity: 'review', reason: 'Fetch call found; appears local or constant-based' };
}

async function auditPackage() {
  const files = await listFiles(packageDir);
  const findings = [];
  const patterns = [
    'https://',
    'http://',
    'fonts.googleapis',
    'fonts.gstatic',
    'cdn',
    'unpkg',
    'jsdelivr',
    'analytics',
    'gtag',
    'plausible',
    'fetch(',
  ];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!textExtensions.has(ext)) continue;
    const rel = path.relative(packageDir, file);
    const content = await readFile(file, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      if (!patterns.some((pattern) => lowerLine.includes(pattern.toLowerCase()))) return;

      const urls = [...line.matchAll(/https?:\/\/[^\s"'<>\\]+/gi)].map((match) => cleanUrl(match[0]));
      urls.forEach((url) => {
        const classification = classifyUrl(line, url);
        findings.push({
          file: rel,
          line: index + 1,
          match: url,
          ...classification,
        });
      });

      if (/fetch\(/i.test(line)) {
        const classification = classifyFetch(line);
        findings.push({
          file: rel,
          line: index + 1,
          match: line.trim().slice(0, 180),
          ...classification,
        });
      }

      ['fonts.googleapis', 'fonts.gstatic', 'unpkg', 'jsdelivr', 'analytics', 'gtag', 'plausible'].forEach((pattern) => {
        if (lowerLine.includes(pattern)) {
          findings.push({
            file: rel,
            line: index + 1,
            match: pattern,
            severity: 'fail',
            reason: 'Disallowed remote service/CDN/analytics pattern',
          });
        }
      });

      if (/\bcdn\b/i.test(line) && !urls.some((url) => url.toLowerCase().includes('cdn'))) {
        findings.push({
          file: rel,
          line: index + 1,
          match: line.trim().slice(0, 180),
          severity: 'review',
          reason: 'Text contains "cdn"; review for CDN reference',
        });
      }
    });
  }

  const failures = findings.filter((finding) => finding.severity === 'fail');
  const auditText = [
    'Darts & Pats Static Package Audit',
    `Generated: ${new Date().toISOString()}`,
    `Package: ${packageDir}`,
    '',
    'Scan patterns:',
    ...patterns.map((pattern) => `- ${pattern}`),
    '',
    `Summary: ${failures.length ? 'FAIL' : 'PASS'}`,
    `Failures: ${failures.length}`,
    `Review-only findings: ${findings.filter((finding) => finding.severity === 'review').length}`,
    `Harmless findings: ${findings.filter((finding) => finding.severity === 'harmless').length}`,
    '',
    'Findings:',
    findings.length
      ? findings.map((finding) => [
        `- [${finding.severity.toUpperCase()}] ${finding.file}:${finding.line}`,
        `  Match: ${finding.match}`,
        `  Reason: ${finding.reason}`,
      ].join('\n')).join('\n')
      : '- None',
    '',
    failures.length
      ? 'FAIL: Remote runtime dependency candidates were found. Remove them before kiosk deployment.'
      : 'PASS: No remote scripts, CSS, fonts, images, data/API calls, analytics scripts, or CDN-hosted runtime libraries were found. External URLs are limited to harmless namespaces/credit links or local fetch review items.',
    '',
  ].join('\n');

  await writeFile(auditPath, auditText, 'utf8');
  if (failures.length) throw new Error(`Static package audit failed. See ${auditPath}`);

  return {
    status: failures.length ? 'FAIL' : 'PASS',
    findings,
    failures,
    auditText,
  };
}

async function findPackageFiles(relativeDir, matcher = () => true) {
  const dir = path.join(packageDir, relativeDir);
  if (!existsSync(dir)) return [];
  const files = await listFiles(dir);
  return files
    .map((file) => path.relative(packageDir, file))
    .filter(matcher)
    .sort((a, b) => a.localeCompare(b));
}

async function assertRequiredFiles() {
  const missing = [];
  for (const rel of requiredPackageFiles) {
    if (!existsSync(path.join(packageDir, rel))) missing.push(rel);
  }
  if (missing.length) {
    throw new Error(`Package is missing required static files:\n${missing.map((item) => `- ${item}`).join('\n')}`);
  }
}

async function writeManifest(auditResult, archiveInfo) {
  const branch = run('git', ['branch', '--show-current'], { capture: true });
  const commit = run('git', ['rev-parse', 'HEAD'], { capture: true });
  const topLevel = await relativeTopLevelEntries(packageDir);
  const dataFiles = await findPackageFiles('data');
  const assetFiles = await findPackageFiles('assets');
  const assetDirs = [...new Set(assetFiles.map((file) => file.split('/').slice(0, 2).join('/')))].sort();
  const summary = await summarizeDirectory(packageDir);
  const manifestPath = path.join(packageDir, 'STATIC_PACKAGE_MANIFEST.txt');

  const manifest = [
    'Darts & Pats Static Package Manifest',
    `Generated: ${new Date().toISOString()}`,
    `Git branch: ${branch}`,
    `Git commit: ${commit}`,
    `Build command: npm run build`,
    `Reports included: ${includeReports ? 'yes (--include-reports)' : 'no (reports/ removed by default)'}`,
    `Package folder: release/${packageName}/`,
    `Archive: ${archiveInfo.name}`,
    `Package file count: ${summary.fileCount}`,
    `Package size before archive: ${formatBytes(summary.totalBytes)}`,
    `Audit status: ${auditResult.status}`,
    `Audit findings: ${auditResult.findings.length} total; ${auditResult.failures.length} failures`,
    '',
    'Top-level package contents:',
    ...topLevel.map((entry) => `- ${entry}`),
    '',
    'Data files found:',
    ...dataFiles.map((file) => `- ${file}`),
    '',
    'Asset directories found:',
    ...assetDirs.map((dir) => `- ${dir}/`),
    '',
    'Required kiosk data files:',
    ...requiredPackageFiles
      .filter((file) => file.startsWith('data/'))
      .map((file) => `- ${file}: ${existsSync(path.join(packageDir, file)) ? 'found' : 'missing'}`),
    '',
    'Runtime notes:',
    '- This package is static-only: HTML, CSS, JavaScript, local data, and local assets.',
    '- The runtime web server does not need Node, npm, Astro, Vite, GitHub, Netlify, or internet access.',
    '- Serve this folder as the web root. Do not use file://.',
    '',
  ].join('\n');

  await writeFile(manifestPath, manifest, 'utf8');
}

async function createArchive() {
  if (commandExists('zip')) {
    run('zip', ['-rq', path.basename(zipPath), packageName], { cwd: releaseDir });
    return {
      name: `release/${path.basename(zipPath)}`,
      path: zipPath,
      type: 'zip',
    };
  }

  run('tar', ['-czf', path.basename(tarPath), packageName], { cwd: releaseDir });
  return {
    name: `release/${path.basename(tarPath)}`,
    path: tarPath,
    type: 'tar.gz',
  };
}

async function sha256(file) {
  const buffer = await readFile(file);
  return createHash('sha256').update(buffer).digest('hex');
}

async function main() {
  console.log('Cleaning old static package output...');
  await rm(packageDir, { recursive: true, force: true });
  await rm(zipPath, { force: true });
  await rm(tarPath, { force: true });
  await rm(auditPath, { force: true });
  await rm(distDir, { recursive: true, force: true });
  await mkdir(releaseDir, { recursive: true });

  console.log('Running production build...');
  run(npmCommand, ['run', 'build']);

  console.log('Copying dist/ to release package...');
  await cp(distDir, packageDir, { recursive: true });

  if (!includeReports) {
    console.log('Removing public reports from kiosk package...');
    await rm(path.join(packageDir, 'reports'), { recursive: true, force: true });
  }

  await removeNamedFiles(packageDir, '.DS_Store');
  await assertRequiredFiles();

  console.log('Auditing package for external runtime dependencies...');
  const auditResult = await auditPackage();

  console.log('Creating archive...');
  const archiveInfo = await createArchive();

  await writeManifest(auditResult, archiveInfo);

  // Recreate the archive so the manifest is included.
  await rm(archiveInfo.path, { force: true });
  const finalArchive = await createArchive();
  const archiveStats = await stat(finalArchive.path);
  const archiveHash = await sha256(finalArchive.path);

  console.log('');
  console.log(`Static package created: ${finalArchive.name}`);
  console.log(`Archive type: ${finalArchive.type}`);
  console.log(`Archive size: ${formatBytes(archiveStats.size)}`);
  console.log(`SHA-256: ${archiveHash}`);
  console.log(`Audit report: ${path.relative(rootDir, auditPath)}`);
  console.log(`Manifest: ${path.relative(rootDir, path.join(packageDir, 'STATIC_PACKAGE_MANIFEST.txt'))}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
