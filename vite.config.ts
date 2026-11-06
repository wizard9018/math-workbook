import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// relative base: works under https://<user>.github.io/<repo>/
export default defineConfig({ base: './', plugins: [react(), tailwindcss()] })
