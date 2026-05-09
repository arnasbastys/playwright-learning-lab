import { test, expect } from './fixtures';

test.describe('fixtures scope topic', () => {
  test('test-scoped fixture seeds data for just this test', async ({ page, noteBoard }) => {
    await expect(page.getByTestId('note-count')).toHaveText('1 note(s)');
    await expect(page.getByTestId('note-list')).toContainText(
      'seed for test-scoped fixture seeds data for just this test [default]'
    );

    await noteBoard.seed('note created inside the test body');
    await noteBoard.refresh();

    await expect(page.getByTestId('note-count')).toHaveText('2 note(s)');
    await expect(page.getByTestId('note-list')).toContainText(
      'note created inside the test body [default]'
    );
  });

  test('next test gets a fresh test-scoped fixture but same worker tenant', async ({
    page,
    noteBoard,
    workerTenant
  }) => {
    await expect(page.getByTestId('tenant-id')).toHaveText(workerTenant.id);
    await expect(page.getByTestId('tenant-label')).toHaveText(
      `worker-${test.info().workerIndex}-tenant`
    );

    await expect(page.getByTestId('note-count')).toHaveText('1 note(s)');
    await expect(page.getByTestId('note-list')).not.toContainText('note created inside the test body');
    expect(await noteBoard.notes()).toHaveLength(1);
  });

  test('automatic test fixture acts like a file-wide beforeEach', async ({ page, noteBoard }) => {
    await noteBoard.refresh();

    await expect(page.getByTestId('audit-list')).toContainText(
      'beforeEach: automatic test fixture acts like a file-wide beforeEach'
    );
  });
});

test.describe('suite-scoped option fixtures', () => {
  test.use({ fixtureProfile: 'billing' });

  test('test.use overrides the profile option for a describe block', async ({ page, noteBoard }) => {
    await expect(page.getByTestId('profile')).toHaveText('billing');
    await expect(page.getByTestId('note-list')).toContainText(
      'seed for test.use overrides the profile option for a describe block [billing]'
    );

    await noteBoard.seed('billing-only seeded note');
    await noteBoard.refresh();

    await expect(page.getByTestId('note-list')).toContainText('billing-only seeded note [billing]');
  });
});
