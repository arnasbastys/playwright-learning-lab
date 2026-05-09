const params = new URLSearchParams(window.location.search);
const tenantId = params.get('tenantId');
const profile = params.get('profile') ?? 'default';

const tenantIdNode = document.querySelector('[data-testid="tenant-id"]');
const tenantLabelNode = document.querySelector('[data-testid="tenant-label"]');
const profileNode = document.querySelector('[data-testid="profile"]');
const noteCountNode = document.querySelector('[data-testid="note-count"]');
const noteListNode = document.querySelector('[data-testid="note-list"]');
const auditListNode = document.querySelector('[data-testid="audit-list"]');
const refreshButton = document.querySelector('[data-testid="refresh"]');

function renderList(listNode, rows, formatter) {
  listNode.replaceChildren(
    ...rows.map((row) => {
      const item = document.createElement('li');
      item.textContent = formatter(row);
      return item;
    })
  );
}

async function getJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  return await response.json();
}

async function refresh() {
  profileNode.textContent = profile;

  if (!tenantId) {
    tenantIdNode.textContent = 'missing tenantId';
    tenantLabelNode.textContent = 'missing tenantId';
    noteCountNode.textContent = '0 note(s)';
    renderList(noteListNode, [], () => '');
    renderList(auditListNode, [], () => '');
    return;
  }

  const [tenantPayload, notesPayload, eventsPayload] = await Promise.all([
    getJson(`/api/fixtures/tenants/${tenantId}`),
    getJson(`/api/fixtures/notes?tenantId=${tenantId}`),
    getJson(`/api/fixtures/events?tenantId=${tenantId}`)
  ]);

  tenantIdNode.textContent = tenantPayload.tenant.id;
  tenantLabelNode.textContent = tenantPayload.tenant.label;
  noteCountNode.textContent = `${notesPayload.notes.length} note(s)`;

  renderList(
    noteListNode,
    notesPayload.notes,
    (note) => `${note.title} [${note.profile}]`
  );
  renderList(
    auditListNode,
    eventsPayload.events,
    (event) => `${event.name}: ${event.testTitle}${event.status ? ` (${event.status})` : ''}`
  );
}

refreshButton.addEventListener('click', refresh);

refresh().catch((error) => {
  tenantIdNode.textContent = 'load failed';
  tenantLabelNode.textContent = error.message;
});
