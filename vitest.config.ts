import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Nur die framework-unabhängigen Core-Unit-Tests laufen unter vitest.
    // Angular-Component-Specs (TestBed/Karma) sind hier bewusst ausgeschlossen.
    include: ['src/app/core/**/*.spec.ts'],
    globals: true,
    environment: 'node',
  },
});
