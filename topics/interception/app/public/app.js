const checkoutButton = document.getElementById('checkout-btn');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');

function setStatus(message) {
  statusEl.textContent = message;
}

function setError(message) {
  errorEl.textContent = message;
}

async function placeOrder() {
  checkoutButton.disabled = true;
  setError('');
  setStatus('Submitting order...');

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku: 'starter-pack',
        quantity: 1,
        ts: Date.now()
      })
    });

    let payload;
    try {
      payload = await response.json();
    } catch {
      setStatus('');
      setError('Received invalid JSON from server.');
      return;
    }

    if (!response.ok) {
      setStatus('');

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after') ?? 'unknown';
        setError(`Rate limited. Try again in ${retryAfter}s.`);
        return;
      }

      setError(payload.message ?? `Request failed with status ${response.status}.`);
      return;
    }

    setStatus(`Success: ${payload.orderId}`);
  } catch {
    setStatus('');
    setError('Network failure. Check your connection and retry.');
  } finally {
    checkoutButton.disabled = false;
  }
}

checkoutButton.addEventListener('click', () => {
  void placeOrder();
});
