import path from 'path';
import { execSync } from 'child_process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function getBuildInfo() {
    let gitHash = 'dev';
    try {
        gitHash = execSync('git rev-parse --short HEAD', { stdio: ['pipe', 'pipe', 'pipe'] })
            .toString().trim();
    } catch (_) { /* not a git repo or git not available */ }
    return {
        hash: gitHash,
        time: new Date().toISOString(),
    };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const buildInfo = getBuildInfo();
    return {
      base: '/universal-ai-project-zipper/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        '__BUILD_HASH__': JSON.stringify(buildInfo.hash),
        '__BUILD_TIME__': JSON.stringify(buildInfo.time),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
