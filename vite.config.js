import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002, // ← change to any port you want
    
  },

  // configureServer(server) {
  //   server.httpServer?.once('listening', () => {
  //     const info = server.config.server
  //     const protocol = info.https ? 'https' : 'http'
  //     const host = info.host || 'localhost'
  //     const port = info.port || 3000
  //     console.log(`\n🚀 Custom Start URL: ${protocol}://${host}:${port}/hospital-register\n`)
  //   })
  // },
})

