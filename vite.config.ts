import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(rootDirectory, 'src/app'),
      '@pages': path.resolve(rootDirectory, 'src/pages'),
      '@features': path.resolve(rootDirectory, 'src/features'),
      '@entities': path.resolve(rootDirectory, 'src/entities'),
      '@shared': path.resolve(rootDirectory, 'src/shared'),
      '@services': path.resolve(rootDirectory, 'src/services')
    }
  }
});
