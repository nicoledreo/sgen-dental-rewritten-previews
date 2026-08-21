// Minimal static server for the the-pawsitive-vet mockup.  usage: node server.js [port]
const http = require('http'), fs = require('fs'), path = require('path');
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.webp':'image/webp', '.avif':'image/avif', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.svg':'image/svg+xml', '.gif':'image/gif', '.ico':'image/x-icon', '.woff2':'font/woff2', '.woff':'font/woff',
  '.ttf':'font/ttf', '.json':'application/json; charset=utf-8', '.txt':'text/plain; charset=utf-8' };
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2]) || 8080;
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/the-pawsitive-vet/the-pawsitive-vet.html';
  const f = path.join(ROOT, path.normalize(p).replace(/^([/\\])+/, ''));
  if (!f.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404, {'content-type':'text/plain'}).end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, () => console.log('the-pawsitive-vet -> http://localhost:' + PORT + '/the-pawsitive-vet/the-pawsitive-vet.html'));
