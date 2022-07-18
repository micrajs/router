import {defineConfig} from '@micra/vite-config/library';
import {cwd} from '@micra/vite-config/utilities/cwd';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'path-to-regexp',
        '@micra/error',
        '@micra/request-handler',
        '@micra/request-handler/data/utilities/error',
      ],
      input: {
        index: cwd('index.ts'),
        ServiceProvider: cwd('./ServiceProvider.ts'),
      },
    },
  },
});
