import react from "@vitejs/plugin-react";
import { defineConfig } from 'vite';



export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://10.26.60.8:8000/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },}
});
