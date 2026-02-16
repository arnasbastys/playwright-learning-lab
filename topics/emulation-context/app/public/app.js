const locateBtn = document.getElementById('locate-btn');
const refreshBtn = document.getElementById('refresh-btn');
const statusEl = document.querySelector('[data-testid="nearby-status"]');
const listEl = document.querySelector('[data-testid="nearby-list"]');
const localeEl = document.querySelector('[data-testid="locale-value"]');
const timezoneEl = document.querySelector('[data-testid="timezone-value"]');
const inputProfileEl = document.querySelector('[data-testid="input-profile"]');
const currencyEl = document.querySelector('[data-testid="currency-sample"]');

let lastCoords = null;

function renderEnvironmentSnapshot() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isTouch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;

  localeEl.textContent = navigator.language;
  timezoneEl.textContent = timezone;
  inputProfileEl.textContent = isTouch ? 'Touch-first layout' : 'Pointer + keyboard layout';
  currencyEl.textContent = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD'
  }).format(1234.56);
}

function renderPlaces(region, places) {
  listEl.innerHTML = '';

  for (const place of places) {
    const li = document.createElement('li');
    li.textContent = `${place.name} (${place.type})`;
    listEl.append(li);
  }

  statusEl.textContent = `Region: ${region}`;
}

async function fetchNearby(coords) {
  try {
    const url = `/api/nearby?lat=${coords.latitude}&lng=${coords.longitude}`;
    const response = await fetch(url);
    const payload = await response.json();

    renderPlaces(payload.region, payload.places ?? []);
    refreshBtn.disabled = false;
  } catch {
    statusEl.textContent = 'Network error while loading nearby spots.';
  }
}

async function locateAndLoad() {
  statusEl.textContent = 'Looking up your location...';

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: 3_000
      });
    });

    lastCoords = position.coords;
    await fetchNearby(position.coords);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 1) {
      statusEl.textContent = 'Location permission denied.';
      return;
    }

    statusEl.textContent = 'Could not read your location.';
  }
}

locateBtn.addEventListener('click', () => {
  void locateAndLoad();
});

refreshBtn.addEventListener('click', () => {
  if (!lastCoords) {
    statusEl.textContent = 'Nothing to refresh yet.';
    return;
  }

  void fetchNearby(lastCoords);
});

renderEnvironmentSnapshot();
