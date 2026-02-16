export {};

declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T = unknown> {
      toHaveDataPhase(expectedPhase: string, options?: { timeout?: number }): Promise<R>;
    }
  }
}
