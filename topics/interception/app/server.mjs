import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const interceptionPublicDir = path.join(__dirname, 'public');
const expectsWaitsPublicDir = path.join(__dirname, '../../expects-waits/app/public');
const port = 4173;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders
  });
  res.end(body);
}

async function serveStatic(res, publicDir, pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    sendJson(res, 400, { message: 'Invalid path.' });
    return;
  }

  try {
    const content = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] ?? 'application/octet-stream',
      'Content-Length': content.length
    });
    res.end(content);
  } catch {
    sendJson(res, 404, { message: 'Not found.' });
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

  if (url.pathname === '/api/checkout' && req.method === 'POST') {
    sendJson(res, 200, {
      orderId: 'ORD-BASELINE-001',
      message: 'Order confirmed from the default local API.'
    });
    return;
  }

  if (url.pathname === '/expects-waits' || url.pathname.startsWith('/expects-waits/')) {
    const nestedPath = url.pathname.replace('/expects-waits', '') || '/';
    await serveStatic(res, expectsWaitsPublicDir, nestedPath);
    return;
  }

  await serveStatic(res, interceptionPublicDir, url.pathname);
}).listen(port, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`Playwright learning lab server running on http://127.0.0.1:${port}`);
});
