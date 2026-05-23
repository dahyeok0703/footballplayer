import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    host: true,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
