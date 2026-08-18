import { withPayload } from '@payloadcms/tanstack-start'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default withPayload(undefined, {
  payloadConfigPath: path.resolve(__dirname, 'src', 'payload.config.ts'),
  vite: {
    resolve: {
      alias: [
        // Project `@/` → `src/` alias.
        {
          find: /^@\//,
          replacement: path.resolve(__dirname, 'src') + '/',
        },
        // Pin tslib to its ESM build; the UMD one breaks CJS interop at boot.
        {
          find: /^tslib$/,
          replacement: path.resolve(__dirname, 'node_modules', 'tslib', 'tslib.es6.mjs'),
        },
        // Stub the blob client upload handler out of the client bundle.
        {
          find: /^@payloadcms\/storage-vercel-blob\/client$/,
          replacement: path.resolve(__dirname, 'src', 'stubs', 'vercel-blob-client.ts'),
        },
      ],
    },
    server: {
      port: 3000,
      warmup: {
        clientFiles: [
          './src/app/__root.tsx',
          './src/app/_payload.tsx',
          './src/app/_payload/admin.index.tsx',
          './src/app/_payload/admin.$.tsx',
        ],
      },
    },
  },
})
