/**
 * GENZSTORE - Minimal Production-Ready Server
 * Zero dependencies - Pure Node.js Standard Library
 * Serves static storefront + Mock E-Commerce REST API
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, 'http://localhost');
  const pathname = parsedUrl.pathname;

  // --- CORS Support ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // --- API Routes & Health Probes ---
  if (pathname === '/api/health' || pathname === '/health' || pathname === '/healthz' || pathname === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', brand: 'GENZSTORE', location: 'Mumbai' }));
  }

  if (pathname === '/api/orders/create' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const orderId = 'order_mum_' + Date.now().toString(36);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          order_id: orderId,
          amount: data.amount || 1500,
          currency: 'INR',
          status: 'created'
        }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (pathname === '/api/orders/verify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        verified: true,
        message: 'Payment verified successfully by GENZSTORE Mumbai Gateway.'
      }));
    });
    return;
  }

  // --- Static File Serving ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access Denied');
  }

  const serveStream = (targetPath, contentType) => {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    fs.createReadStream(targetPath).pipe(res);
  };

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      return serveStream(filePath, MIME_TYPES[ext] || 'application/octet-stream');
    }

    // Clean URL support (e.g. /shop -> /shop.html)
    const htmlCandidate = filePath + '.html';
    if (fs.existsSync(htmlCandidate)) {
      return serveStream(htmlCandidate, MIME_TYPES['.html']);
    }

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      const notFoundPath = path.join(PUBLIC_DIR, 'index.html');
      return serveStream(notFoundPath, MIME_TYPES['.html']);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('File Not Found');
  });
});

// Support both standard numeric port (Docker/VPS bound to 0.0.0.0) and cPanel Passenger unix domain sockets
const isNumericPort = !isNaN(PORT) && !isNaN(parseFloat(PORT));
if (isNumericPort) {
  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`GENZSTORE running on port ${PORT} (0.0.0.0)`);
  });
} else {
  server.listen(PORT, () => {
    console.log('GENZSTORE running on socket ' + PORT);
  });
}

module.exports = server;