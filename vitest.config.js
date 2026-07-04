import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Inclure uniquement le code backend Node.js
      include: ['src/**/*.js'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'frontend/**',
        '**/*.test.js',
        'vitest.config.js',
        'src/server.js',       // Démarre juste le serveur HTTP
        'src/utils/db.js',     // Initialise le client Supabase (dépendance externe)
        'src/repositories/**', // Accès DB direct — non testables sans Supabase réel
      ]
    }
  }
});
