const countEl = document.querySelector('[data-testid="item-count"]');
const listEl = document.querySelector('[data-testid="item-list"]');

function renderItems(items) {
  listEl.innerHTML = '';

  for (const item of items) {
    const li = document.createElement('li');
    li.dataset.testid = `item-${item.id}`;
    li.textContent = `${item.title} (${item.status})`;
    listEl.append(li);
  }

  countEl.textContent = `${items.length} item(s)`;
}

async function loadItems() {
  try {
    const response = await fetch('/api/lab-items');
    const payload = await response.json();
    renderItems(payload.items ?? []);
  } catch {
    countEl.textContent = 'Could not load data';
  }
}

void loadItems();
