import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // reactのインポートを追加

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        base: "/NeuroFlow/", 

        plugins: [react()], // reactプラグインを追加
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});