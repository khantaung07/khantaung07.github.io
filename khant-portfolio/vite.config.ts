import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { leetifyPlugin } from './server/leetify.mjs'

export default defineConfig({
  plugins: [react(), leetifyPlugin()],
})
