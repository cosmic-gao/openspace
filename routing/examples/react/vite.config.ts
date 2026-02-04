import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { routing } from '@routing/react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        routing({ dir: 'src/pages' }),
    ],
})
