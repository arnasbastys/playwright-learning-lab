const stateEl = document.querySelector('[data-testid="catalog-state"]');
const listEl = document.querySelector('[data-testid="catalog-list"]');

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function renderProducts(products) {
  listEl.innerHTML = '';

  if (!Array.isArray(products) || products.length === 0) {
    stateEl.textContent = 'No products available.';
    return;
  }

  stateEl.textContent = `${products.length} product(s) loaded.`;

  for (const product of products) {
    if (typeof product.title !== 'string' || typeof product.price !== 'number') {
      const broken = document.createElement('li');
      broken.dataset.testid = 'product-corrupt';
      broken.textContent = 'Corrupt product payload';
      listEl.append(broken);
      continue;
    }

    const row = document.createElement('li');
    row.dataset.testid = `product-${product.id}`;

    const name = document.createElement('span');
    name.textContent = product.title;

    const meta = document.createElement('span');
    meta.innerHTML = `<span class="price">${formatPrice(product.price)}</span> · <span class="${product.inStock ? 'stock-ok' : 'stock-out'}">${product.inStock ? 'In stock' : 'Sold out'}</span>`;

    row.append(name, meta);
    listEl.append(row);
  }
}

async function loadCatalog() {
  try {
    const response = await fetch('/api/products');
    const payload = await response.json();
    renderProducts(payload.products ?? []);
  } catch {
    stateEl.textContent = 'Could not load catalog.';
  }
}

void loadCatalog();
