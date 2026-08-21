const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 7015;
const DIR = __dirname;

http.createServer((req, res) => {
  const filePath = path.join(DIR, req.url === '/' ? 'pillar-chiropractic.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath);
  const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2' };
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Pillar Chiropractic server running on http://localhost:${PORT}`));
