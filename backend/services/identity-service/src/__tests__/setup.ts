// Mock crypto.randomUUID() since it's not available in the test environment
global.crypto = {
  ...global.crypto,
  randomUUID: () => '00000000-0000-0000-0000-000000000000',
};
