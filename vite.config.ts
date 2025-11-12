import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve'
  const isBuild = command === 'build'

  return {
    publicDir: isBuild ? false : undefined,
    plugins: [
      vue(),
      // 只在开发模式下启用 vue-devtools
      ...(isDev ? [vueDevTools()] : []),
      dts({
        include: ['src/components/KFrame'],
        entryRoot: './src/components/KFrame',
        outDir: './dist',
        insertTypesEntry: true,
        tsconfigPath: './tsconfig.app.json',
      }),
    ],
    server: {
      port: 5656,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      lib: {
        entry: fileURLToPath(new URL('./src/components/KFrame/index.ts', import.meta.url)),
        name: 'KFrame',
        formats: ['es', 'umd'],
        fileName: (format) => `kframe.${format === 'es' ? 'js' : 'umd.js'}`,
      },
      cssCodeSplit: false,
      cssMinify: true,
      minify: 'esbuild',
      // 使用 esbuild 压缩，性能更好
      // 如需使用 terser，需要安装 terser 依赖
      rollupOptions: {
        external: ['vue', '@vueuse/core'],
        output: {
          globals: {
            vue: 'Vue',
            '@vueuse/core': 'VueUse',
          },
          exports: 'named',
          // 确保 CSS 文件正确输出
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') {
              return 'kframe.css'
            }
            return assetInfo.name || 'asset'
          },
        },
      },
    },
  }
})
