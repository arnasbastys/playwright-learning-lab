import { expect as baseExpect } from '@playwright/test';

type PhaseAssertOptions = {
  timeout?: number;
};

export const expect = baseExpect.extend({
  async toHaveDataPhase(locator, expectedPhase: string, options: PhaseAssertOptions = {}) {
    try {
      await baseExpect(locator).toHaveAttribute('data-phase', expectedPhase, {
        timeout: options.timeout
      });

      return {
        name: 'toHaveDataPhase',
        pass: true,
        message: () => `expected locator not to have data-phase "${expectedPhase}"`
      };
    } catch (error) {
      return {
        name: 'toHaveDataPhase',
        pass: false,
        message: () => (error instanceof Error ? error.message : String(error))
      };
    }
  }
});
