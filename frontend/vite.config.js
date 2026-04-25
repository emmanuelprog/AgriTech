import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

//import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    //basicSsl() // This enables the HTTPS protocol
  ],
  server: {
    //host: '0.0.0.0', // Allows your iPhone to connect
    allowedHosts: ['.ngrok-free.app'], // This allows ngrok to connect
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
