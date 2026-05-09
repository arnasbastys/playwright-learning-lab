import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const interceptionPublicDir = path.join(__dirname, 'topics/interception/app/public');
const expectsWaitsPublicDir = path.join(__dirname, 'topics/expects-waits/app/public');
const apiContextPublicDir = path.join(__dirname, 'topics/api-request-context/app/public');
const emulationContextPublicDir = path.join(__dirname, 'topics/emulation-context/app/public');
const fixturesPublicDir = path.join(__dirname, 'topics/fixtures/app/public');
const port = 4173;
let labItems = [];
let labItemId = 1;
let fixtureTenantId = 1;
let fixtureNoteId = 1;
let fixtureEventId = 1;
let fixtureTenants = [];
let fixtureNotes = [];
let fixtureEvents = [];
const catalogProducts = [
  { id: 'P-001', title: 'Trail Backpack', price: 12900, inStock: true },
  { id: 'P-002', title: 'Desk Lamp', price: 4900, inStock: true },
  { id: 'P-003', title: 'Mechanical Keyboard', price: 15900, inStock: false }
];

function getNearbyPayload(lat, lng) {
  if (Math.abs(lat - 54.6872) < 1 && Math.abs(lng - 25.2797) < 1) {
    return {
      region: 'Vilnius',
      places: [
        { name: 'Old Town Coffee', type: 'cafe' },
        { name: 'Neris Riverside Run Club', type: 'sports' },
        { name: 'Bernardine Garden', type: 'park' }
      ]
    };
  }

  if (Math.abs(lat - 37.7749) < 1 && Math.abs(lng + 122.4194) < 1) {
    return {
      region: 'San Francisco',
      places: [
        { name: 'Mission Market', type: 'groceries' },
        { name: 'Golden Gate Park', type: 'park' },
        { name: 'Blue Bottle Hayes', type: 'cafe' }
      ]
    };
  }

  return {
    region: 'Generic',
    places: [
      { name: 'City Center Hub', type: 'transit' },
      { name: 'Neighborhood Grocery', type: 'groceries' }
    ]
  };
}

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
  const fixtureTenantMatch = url.pathname.match(/^\/api\/fixtures\/tenants\/([^/]+)$/);
  const fixtureNoteMatch = url.pathname.match(/^\/api\/fixtures\/notes\/(\d+)$/);

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

  if (url.pathname === '/api/nearby' && req.method === 'GET') {
    const lat = Number(url.searchParams.get('lat'));
    const lng = Number(url.searchParams.get('lng'));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      sendJson(res, 400, { message: 'lat and lng query params are required.' });
      return;
    }

    sendJson(res, 200, getNearbyPayload(lat, lng));
    return;
  }

  if (url.pathname === '/api/fixtures/tenants' && req.method === 'POST') {
    const payload = await readJsonBody(req);

    if (!payload || typeof payload.label !== 'string' || payload.label.trim() === '') {
      sendJson(res, 400, { message: 'tenant label is required.' });
      return;
    }

    const tenant = {
      id: `tenant-${fixtureTenantId++}`,
      label: payload.label.trim(),
      workerIndex: Number.isInteger(payload.workerIndex) ? payload.workerIndex : null,
      createdAt: new Date().toISOString()
    };

    fixtureTenants.push(tenant);
    sendJson(res, 201, { tenant });
    return;
  }

  if (url.pathname === '/api/fixtures/tenants' && req.method === 'GET') {
    sendJson(res, 200, { tenants: fixtureTenants });
    return;
  }

  if (fixtureTenantMatch && req.method === 'GET') {
    const tenant = fixtureTenants.find((candidate) => candidate.id === fixtureTenantMatch[1]);

    if (!tenant) {
      sendJson(res, 404, { message: 'tenant not found.' });
      return;
    }

    sendJson(res, 200, { tenant });
    return;
  }

  if (fixtureTenantMatch && req.method === 'DELETE') {
    const tenantId = fixtureTenantMatch[1];
    fixtureTenants = fixtureTenants.filter((tenant) => tenant.id !== tenantId);
    fixtureNotes = fixtureNotes.filter((note) => note.tenantId !== tenantId);
    fixtureEvents = fixtureEvents.filter((event) => event.tenantId !== tenantId);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === '/api/fixtures/notes' && req.method === 'GET') {
    const tenantId = url.searchParams.get('tenantId');
    const notes = tenantId
      ? fixtureNotes.filter((note) => note.tenantId === tenantId)
      : fixtureNotes;

    sendJson(res, 200, { notes });
    return;
  }

  if (url.pathname === '/api/fixtures/notes' && req.method === 'POST') {
    const payload = await readJsonBody(req);

    if (
      !payload ||
      typeof payload.tenantId !== 'string' ||
      typeof payload.title !== 'string' ||
      payload.title.trim() === ''
    ) {
      sendJson(res, 400, { message: 'tenantId and title are required.' });
      return;
    }

    const tenantExists = fixtureTenants.some((tenant) => tenant.id === payload.tenantId);

    if (!tenantExists) {
      sendJson(res, 404, { message: 'tenant not found.' });
      return;
    }

    const note = {
      id: fixtureNoteId++,
      tenantId: payload.tenantId,
      title: payload.title.trim(),
      profile: typeof payload.profile === 'string' ? payload.profile : 'default',
      createdAt: new Date().toISOString()
    };

    fixtureNotes.push(note);
    sendJson(res, 201, { note });
    return;
  }

  if (fixtureNoteMatch && req.method === 'DELETE') {
    const noteId = Number(fixtureNoteMatch[1]);
    fixtureNotes = fixtureNotes.filter((note) => note.id !== noteId);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === '/api/fixtures/events' && req.method === 'GET') {
    const tenantId = url.searchParams.get('tenantId');
    const events = tenantId
      ? fixtureEvents.filter((event) => event.tenantId === tenantId)
      : fixtureEvents;

    sendJson(res, 200, { events });
    return;
  }

  if (url.pathname === '/api/fixtures/events' && req.method === 'POST') {
    const payload = await readJsonBody(req);

    if (
      !payload ||
      typeof payload.tenantId !== 'string' ||
      typeof payload.name !== 'string' ||
      payload.name.trim() === ''
    ) {
      sendJson(res, 400, { message: 'tenantId and name are required.' });
      return;
    }

    const event = {
      id: fixtureEventId++,
      tenantId: payload.tenantId,
      name: payload.name.trim(),
      testTitle: typeof payload.testTitle === 'string' ? payload.testTitle : '',
      status: typeof payload.status === 'string' ? payload.status : '',
      createdAt: new Date().toISOString()
    };

    fixtureEvents.push(event);
    sendJson(res, 201, { event });
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

  if (url.pathname === '/emulation-context' || url.pathname.startsWith('/emulation-context/')) {
    const nestedPath = url.pathname.replace('/emulation-context', '') || '/';
    await serveStatic(res, emulationContextPublicDir, nestedPath);
    return;
  }

  if (url.pathname === '/fixtures' || url.pathname.startsWith('/fixtures/')) {
    const nestedPath = url.pathname.replace('/fixtures', '') || '/';
    await serveStatic(res, fixturesPublicDir, nestedPath);
    return;
  }

  await serveStatic(res, interceptionPublicDir, url.pathname);
}).listen(port, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`Playwright learning lab server running on http://127.0.0.1:${port}`);
});
