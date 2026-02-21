import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const bypassAuth = env.VITE_AUTH0_BYPASS === 'true';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        // DEV ONLY: redirect Auth0 imports to a mock that bypasses login
        ...(bypassAuth && {
          '@auth0/auth0-react': path.resolve(__dirname, 'src/lib/devAuth0.jsx'),
        }),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: true,
    },
  };
});
