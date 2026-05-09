import { test, expect } from './fixtures';

test.describe('worker scoped fixture in a second file', () => {
  test('provisions a worker tenant for this file worker', async ({ page, noteBoard, workerTenant }) => {
    await noteBoard.refresh();

    await expect(page.getByTestId('tenant-id')).toHaveText(workerTenant.id);
    await expect(page.getByTestId('tenant-label')).toHaveText(
      `worker-${test.info().workerIndex}-tenant`
    );
    await expect(page.getByTestId('audit-list')).toContainText(
      'beforeEach: provisions a worker tenant for this file worker'
    );
  });
});
