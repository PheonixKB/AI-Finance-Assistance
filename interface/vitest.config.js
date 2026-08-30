import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setupTests.jsx'],
    include: ['src/__tests__/**/*.test.{js,jsx,ts,tsx}'],
    globals: true,
  },
});
