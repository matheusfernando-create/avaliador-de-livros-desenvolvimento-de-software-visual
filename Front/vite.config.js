import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O front chama "/backend/..." e o Vite repassa para a API em http://localhost:5195.
// Assim não é preciso configurar CORS na API.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/backend": {
        target: "http://localhost:5195",
        changeOrigin: true,
        rewrite: (caminho) => caminho.replace(/^\/backend/, ""),
      },
    },
  },
});
