import { expect, request as requestFactory, test as base, type APIRequestContext, type Page } from '@playwright/test';

const labBaseURL = process.env.PW_LAB_BASE_URL ?? 'http://127.0.0.1:4173';

type FixtureProfile = 'default' | 'billing' | 'support';

type Tenant = {
  id: string;
  label: string;
  workerIndex: number | null;
};

type Note = {
  id: number;
  tenantId: string;
  title: string;
  profile: FixtureProfile;
};

type TestFixtures = {
  auditTrail: void;
  fixtureProfile: FixtureProfile;
  noteBoard: FixtureNoteBoard;
};

type WorkerFixtures = {
  workerTenant: Tenant;
};

export class FixtureNoteBoard {
  private readonly createdNoteIds = new Set<number>();

  constructor(
    private readonly page: Page,
    private readonly request: APIRequestContext,
    readonly tenant: Tenant,
    private readonly profile: FixtureProfile
  ) {}

  async seed(title: string): Promise<Note> {
    const response = await this.request.post('/api/fixtures/notes', {
      data: {
        tenantId: this.tenant.id,
        title,
        profile: this.profile
      }
    });

    expect(response.ok()).toBeTruthy();
    const payload = (await response.json()) as { note: Note };
    this.createdNoteIds.add(payload.note.id);
    return payload.note;
  }

  async goto(): Promise<void> {
    await this.page.goto(`/fixtures?tenantId=${this.tenant.id}&profile=${this.profile}`);
  }

  async refresh(): Promise<void> {
    await this.page.getByTestId('refresh').click();
  }

  async notes(): Promise<Note[]> {
    const response = await this.request.get(`/api/fixtures/notes?tenantId=${this.tenant.id}`);
    expect(response.ok()).toBeTruthy();
    const payload = (await response.json()) as { notes: Note[] };
    return payload.notes;
  }

  async cleanup(): Promise<void> {
    await Promise.all(
      [...this.createdNoteIds].map(async (noteId) => {
        const response = await this.request.delete(`/api/fixtures/notes/${noteId}`);
        expect(response.ok()).toBeTruthy();
      })
    );
    this.createdNoteIds.clear();
  }
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  fixtureProfile: ['default', { option: true }],

  // Worker scoped + auto: this behaves like global beforeAll/afterAll for each worker
  // process that imports this custom test object.
  workerTenant: [
    async ({}, use, workerInfo) => {
      const workerRequest = await requestFactory.newContext({ baseURL: labBaseURL });
      const createResponse = await workerRequest.post('/api/fixtures/tenants', {
        data: {
          label: `worker-${workerInfo.workerIndex}-tenant`,
          workerIndex: workerInfo.workerIndex
        }
      });

      expect(createResponse.ok()).toBeTruthy();
      const payload = (await createResponse.json()) as { tenant: Tenant };

      await use(payload.tenant);

      const deleteResponse = await workerRequest.delete(`/api/fixtures/tenants/${payload.tenant.id}`);
      expect(deleteResponse.ok()).toBeTruthy();
      await workerRequest.dispose();
    },
    { scope: 'worker', auto: true }
  ],

  // Test scoped + auto: this behaves like global beforeEach/afterEach for every test
  // that imports this custom test object, even when the test does not ask for auditTrail.
  auditTrail: [
    async ({ request, workerTenant }, use, testInfo) => {
      const startedResponse = await request.post('/api/fixtures/events', {
        data: {
          tenantId: workerTenant.id,
          name: 'beforeEach',
          testTitle: testInfo.title
        }
      });
      expect(startedResponse.ok()).toBeTruthy();

      await use();

      const finishedResponse = await request.post('/api/fixtures/events', {
        data: {
          tenantId: workerTenant.id,
          name: 'afterEach',
          testTitle: testInfo.title,
          status: testInfo.status
        }
      });
      expect(finishedResponse.ok()).toBeTruthy();
    },
    { auto: true }
  ],

  // Default scope is per test. This fixture can safely create mutable data because it
  // deletes only what it created after the test body finishes.
  noteBoard: async ({ page, request, workerTenant, fixtureProfile }, use, testInfo) => {
    const board = new FixtureNoteBoard(page, request, workerTenant, fixtureProfile);

    await board.seed(`seed for ${testInfo.title}`);
    await board.goto();

    await use(board);

    await board.cleanup();
  }
});

export { expect };
