import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      exclude: [
        'src/main.tsx',
        'src/types/**',
        'src/test/setup.ts',
        'eslint.config.js',
        'vite.config.ts',
        'vitest.config.ts',
        'dist/**',
        'coverage/**',
      ],
    },
  },
});
