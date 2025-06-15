import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import run from "vite-plugin-run";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // dev 环境自动运行 Express 后端
    mode === 'development' &&
    run({
      // 监控 server 目录和 server/index.js 变动自动重启
      name: "run-express-server",
      run: ["node server/index.js"],
      watch: ["server/**/*.js"],
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
