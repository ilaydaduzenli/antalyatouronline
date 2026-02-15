import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                tours: resolve(__dirname, 'tours.html'),
                tourDetail: resolve(__dirname, 'tour-detail.html'),
                transfers: resolve(__dirname, 'transfers.html'),
                services: resolve(__dirname, 'services.html'),
                blog: resolve(__dirname, 'blog.html'),
                about: resolve(__dirname, 'about.html'),
                contact: resolve(__dirname, 'contact.html'),
                legal: resolve(__dirname, 'legal.html')
            }
        }
    },
    base: './'
});
