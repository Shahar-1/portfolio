// Tiny zero-dependency Node.js server: serves the portfolio files.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC = new Set(['index.html', 'style.css', 'script.js', 'creative.css', 'midnight.css', 'interactive.css', 'interactive.js', 'hero.css', 'hero.js', 'creative.js', 'Shahar_Banu_Software_Engineer.pdf']);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.pdf': 'application/pdf'
};
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY'
};

function send(res, code, body, headers = {}) {
  res.writeHead(code, { ...SECURITY, ...headers });
  res.end(body);
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  const name = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!PUBLIC.has(name)) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });

  fs.readFile(path.join(ROOT, name), (err, data) => {
    if (err) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
    send(res, 200, data, { 'Content-Type': TYPES[path.extname(name)] || 'application/octet-stream' });
  });
}).listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
