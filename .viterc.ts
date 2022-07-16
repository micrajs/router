import { defineConfig } from '@micra/vite-config/library';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'path-to-regexp',
        '@micra/error',
      ],
    },
  },
});
