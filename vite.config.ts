import { payloadPlugin } from '@payloadcms/tanstack-start/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import rsc from '@vitejs/plugin-rsc'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default payloadPlugin({
  payloadConfigPath: path.resolve(__dirname, 'src', 'payload.config.ts'),
  reactPlugin: react(),
  rscPlugin: rsc(),
  tanstackStart,
  additionalAliases: [
    {
      find: /^@\//,
      replacement: path.resolve(__dirname, 'src') + '/',
    },
    {
      find: /^tslib$/,
      replacement: path.resolve(__dirname, 'node_modules', 'tslib', 'tslib.es6.mjs'),
    },
    {
      find: /^@payloadcms\/storage-vercel-blob\/client$/,
      replacement: path.resolve(__dirname, 'src', 'stubs', 'vercel-blob-client.ts'),
    },
  ],
})