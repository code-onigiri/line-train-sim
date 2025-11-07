# app

Front-end workspace for the placement, diagram, and execution flows of Line Train Simulator.

## Setup

Install dependencies with npm (default):

```bash
npm install
```

> Bun users can continue to run `bun install`; both `package-lock.json` and `bun.lock` are maintained in sync.

## Development

Start the Vite dev server:

```bash
npm run dev
```

## Quality Gates

```bash
npm test        # Vitest suite
npm run lint    # Biome lint + format checks
npm run test:e2e # Playwright regression pack
```

Use `npm run build` to generate a production bundle.
