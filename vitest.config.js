import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.js',
        'vitest.config.js',
        'src/server.js', // Exclu car il ne fait que démarrer le serveur
        'src/utils/db.js' // Exclu car il initialise juste le client Supabase
      ]
    }
  }
});
