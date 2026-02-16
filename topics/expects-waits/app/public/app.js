const delayedActionButton = document.getElementById('delayed-action');
const delayedResult = document.querySelector('[data-testid="delayed-result"]');
const syncStatus = document.querySelector('[data-testid="sync-status"]');
const jobProgressEl = document.querySelector('[data-testid="job-progress"]');
const saveButton = document.getElementById('start-save');
const savePanel = document.querySelector('[data-testid="save-panel"]');
const saveText = document.querySelector('[data-testid="save-text"]');

window.__jobProgress = 0;

setTimeout(() => {
  delayedActionButton.disabled = false;
}, 900);

delayedActionButton.addEventListener('click', () => {
  delayedResult.textContent = 'Action completed after control became actionable.';
});

setTimeout(() => {
  syncStatus.textContent = 'Synced 24 records';
}, 1400);

const progressTimer = setInterval(() => {
  window.__jobProgress = Math.min(window.__jobProgress + 20, 100);
  jobProgressEl.textContent = `${window.__jobProgress}%`;

  if (window.__jobProgress === 100) {
    clearInterval(progressTimer);
  }
}, 350);

saveButton.addEventListener('click', () => {
  savePanel.setAttribute('data-phase', 'queued');
  saveText.textContent = 'Queued...';

  setTimeout(() => {
    savePanel.setAttribute('data-phase', 'writing');
    saveText.textContent = 'Writing to database...';
  }, 500);

  const completionDelay = 1400 + Math.floor(Math.random() * 900);
  setTimeout(() => {
    savePanel.setAttribute('data-phase', 'done');
    saveText.textContent = 'Saved successfully';
  }, completionDelay);
});
