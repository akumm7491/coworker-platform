import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const paths = {
  root: resolve(__dirname, '..'),
  src: resolve(__dirname),
  shared: resolve(__dirname, 'services/shared'),
  agent: resolve(__dirname, 'services/agent'),
} as const;

export default paths;
