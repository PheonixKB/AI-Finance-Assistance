import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Configure React plugin for Vite
  plugins: [react()],
  // Disable source maps to potentially resolve CSP 'eval' error
  build: {
    sourcemap: false,
  },
  // Exclude 'my_venv' from dependency optimization to prevent issues with Python virtual environment files
  optimizeDeps: {
    exclude: ['my_venv']
  },
      // Configure the development server
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5173, // Set the server port
      strictPort: true, // Exit if the port is already in use
      // Allow requests from specified hosts
      allowedHosts: [
        '.vercel.run',  // Allow all Vercel sandbox domains
        '.e2b.dev',     // Allow all E2B sandbox domains
        'localhost'
      ],
      // Deny access to the 'my_venv' directory to prevent accidental exposure or processing
      fs: {
        deny: ['.my_venv']
      }
    }
  })