import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const interceptionPublicDir = path.join(__dirname, 'topics/interception/app/public');
const expectsWaitsPublicDir = path.join(__dirname, 'topics/expects-waits/app/public');
const apiContextPublicDir = path.join(__dirname, 'topics/api-request-context/app/public');
const port = 4173;
let labItems = [];
let labItemId = 1;
const catalogProducts = [
  { id: 'P-001', title: 'Trail Backpack', price: 12900, inStock: true },
  { id: 'P-002', title: 'Desk Lamp', price: 4900, inStock: true },
  { id: 'P-003', title: 'Mechanical Keyboard', price: 15900, inStock: false }
];

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

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const body = Buffer.concat(chunks).toString('utf-8');

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
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
  const labItemIdMatch = url.pathname.match(/^\/api\/lab-items\/(\d+)$/);

  if (url.pathname === '/api/checkout' && req.method === 'POST') {
    sendJson(res, 200, {
      orderId: 'ORD-BASELINE-001',
      message: 'Order confirmed from the default local API.'
    });
    return;
  }

  if (url.pathname === '/api/lab-items' && req.method === 'GET') {
    sendJson(res, 200, { items: labItems });
    return;
  }

  if (url.pathname === '/api/lab-items' && req.method === 'POST') {
    const payload = await readJsonBody(req);

    if (!payload || typeof payload.title !== 'string' || payload.title.trim() === '') {
      sendJson(res, 400, { message: 'title is required.' });
      return;
    }

    const newItem = {
      id: labItemId++,
      title: payload.title.trim(),
      status: payload.status === 'done' ? 'done' : 'pending'
    };

    labItems.push(newItem);
    sendJson(res, 201, { item: newItem });
    return;
  }

  if (labItemIdMatch && req.method === 'DELETE') {
    const id = Number(labItemIdMatch[1]);
    labItems = labItems.filter((item) => item.id !== id);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === '/api/test-data/reset' && req.method === 'POST') {
    labItems = [];
    labItemId = 1;
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === '/api/products' && req.method === 'GET') {
    sendJson(res, 200, { products: catalogProducts });
    return;
  }

  if (url.pathname === '/expects-waits' || url.pathname.startsWith('/expects-waits/')) {
    const nestedPath = url.pathname.replace('/expects-waits', '') || '/';
    await serveStatic(res, expectsWaitsPublicDir, nestedPath);
    return;
  }

  if (url.pathname === '/api-context' || url.pathname.startsWith('/api-context/')) {
    const nestedPath = url.pathname.replace('/api-context', '') || '/';
    await serveStatic(res, apiContextPublicDir, nestedPath);
    return;
  }

  await serveStatic(res, interceptionPublicDir, url.pathname);
}).listen(port, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`Playwright learning lab server running on http://127.0.0.1:${port}`);
});
