import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // build.test.ts and page.test.ts both shell out to `npx astro build` and
    // read/write the same `dist/` directory. Running test files in parallel
    // races two concurrent Astro builds against each other (content
    // collection sync + dist writes stomp on one another). Force sequential
    // file execution so those builds never overlap.
    fileParallelism: false,
  },
});
