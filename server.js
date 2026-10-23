const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.apk': 'application/vnd.android.package-archive'
};

const server = http.createServer((req, res) => {
  let safeUrl = '/';
  try {
    safeUrl = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch (e) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }
  const ROUTE_ALIASES = {
    '/': 'index.html',
    '/install': 'install.html',
    '/install/': 'install.html',
    '/boost': 'install.html',
    '/boost/': 'install.html',
    '/download': 'install.html',
    '/download/': 'install.html',
    '/demo': 'index.html',
    '/demo/': 'index.html',
    '/release': 'index.html',
    '/release/': 'index.html',
    '/rilis': 'index.html',
    '/rilis/': 'index.html'
  };
  const relPath = ROUTE_ALIASES[safeUrl] || safeUrl.replace(/^[/\\]+/, '');
  const filePath = path.resolve(ROOT, relPath);
  const relativeToRoot = path.relative(ROOT, filePath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🌌 SEED Cosmic Reboot running at http://localhost:${PORT}`);
  });
}

module.exports = server;
