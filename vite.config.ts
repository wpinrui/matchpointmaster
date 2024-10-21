import react from '@vitejs/plugin-react-swc'
import { fileTypeFromBuffer } from 'file-type'
import fs from 'fs'
import { defineConfig, Plugin } from 'vite'
import { checker } from 'vite-plugin-checker'
import eslint from 'vite-plugin-eslint'
import viteTsconfigPaths from 'vite-tsconfig-paths'

const dataUrlLoader: Plugin = {
  name: 'dataUrlLoader',
  async transform(code, id) {
    const [path, query] = id.split('?')
    if (query != 'data-url') return null

    const data = fs.readFileSync(path)
    const filetype = await fileTypeFromBuffer(data)
    const base64 = data.toString('base64')

    return `export default 'data:${filetype?.mime || 'application/octet-stream'};base64,${base64}';`
  }
}

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    eslint(),
    checker({
      typescript: true
    }),
    dataUrlLoader
  ],
  server: {
    port: 3000
  }
})
