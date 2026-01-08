import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    globals: true,
    exclude: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/e2e/**'],
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.toml',
        },
        miniflare: {
          assets: {
            directory: './dist/client',
          },
        },
      },
    },
  },
})
