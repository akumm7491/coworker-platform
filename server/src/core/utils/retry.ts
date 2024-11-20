export async function retry<T>(fn: () => Promise<T>, attempts: number, delay: number): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;

    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, attempts - 1, delay);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
