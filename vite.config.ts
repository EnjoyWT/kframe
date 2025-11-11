import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    publicDir: command === 'build' ? false : undefined,
    plugins: [
      vue(),
      vueDevTools(),
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
      rollupOptions: {
        external: ['vue', '@vueuse/core'],
        output: {
          globals: {
            vue: 'Vue',
            '@vueuse/core': 'VueUse',
          },
          exports: 'named',
        },
      },
    },
  }
})
