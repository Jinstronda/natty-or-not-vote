// NEW FILE
// Minimal stub of the previous loadingTimeout utilities – only what the app still needs.

/**
 * Executes the provided async operation without any timeout logic.
 * This keeps the public API unchanged for the existing codebase while we
 * progressively simplify and replace legacy utilities.
 */
export const withDatabaseTimeout = async <T>(operation: () => Promise<T>, _config?: unknown): Promise<T> => {
  return operation();
}; 