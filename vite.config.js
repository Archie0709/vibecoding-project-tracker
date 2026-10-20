import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // M12: forward API calls to the Spring Boot backend, so the browser sees one origin
    // (no CORS setup needed, and the login cookie works the same in dev and demo).
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
