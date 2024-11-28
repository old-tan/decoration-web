import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  console.log("mode---", mode)
  console.log("env---", env)
  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_APP_PORT),
      open: true,
      proxy: {
        [env.VITE_APP_BASE_URL]: {
          target: env.VITE_APP_BASE_URL,
          changeOrigin: true,
          // eg: localhost:3000/dev-api/user/me -> http://xxx.com/user/me
          rewrite: (path) => {
            path.replace(new RegExp("^" + env.VITE_APP_BASE_URL), "")
          },
        },
      },
    },
    css: {
      // preprocessorOptions: {
      //   less: {
      //     javascriptEnabled: true,
      //     // additionalData: `@use "@/styles/variables.scss" as *;`,
      //   },
      // },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
