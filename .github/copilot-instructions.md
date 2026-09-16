# Repository instructions for GitHub Copilot

This repository is a monorepo managed with npm workspaces. Follow the conventions below when making changes.

## Commands

```sh
npm i                   # Install all workspaces
npm run build           # Build all workspaces
npm run lint            # ESLint with auto-fix
npm run format          # Prettier formatting
npm test                # Unit tests across all workspaces
npm run studio          # Local dev server with AEM proxy
npm run gallery         # Gallery mode (stop studio first)
```

### Per-workspace tests

```sh
# web-components
cd web-components && npm test         # Unit tests (Web Test Runner)
cd web-components && npm run test:ci  # CI mode

# studio
cd studio && npm test
cd studio && npm run test:ci

# io/studio (Node.js >=22 required)
cd io/studio && npm test
cd io/studio && npm run coverage
```

### E2E tests (Nala / Playwright)

```sh
npx playwright install              # One-time setup
export IMS_EMAIL=<val>
export IMS_PASS=<val>               # Use @adobetest.com credentials from colleagues
npm run nala local                  # Run locally
npm run nala MWPW-160756            # Run on branch
npm run nala MWPW-160756 mode=ui    # UI mode
```

## Repository structure

Monorepo with three workspaces:

- `web-components/` — Core Lit-based merchandising component library (`@adobecom/mas`). Built with esbuild into `dist/mas.js`. Components include merch-card, catalog, checkout-link, price, and commerce service integrations.
- `studio/` — M@S Studio authoring tool (`@adobecom/mas-studio`). Lit web component for creating/editing merch fragments in Adobe Experience Manager. Has its own AEM proxy server for local dev.
- `io/studio/` — Adobe I/O Runtime serverless backend. Node.js >=22 required. Integrates with OST (Offer Service Tier) and WCS (Web Commerce Services). Tested with Mocha.
- `nala/` — Playwright E2E tests. Separate projects for `mas-studio-chromium` and `mas-docs-chromium`. Requires IMS authentication setup.
- `da/` — Document API content (blocks, fonts, scripts, styles).

### Studio internal structure (`/studio`)

| Folder | Purpose |
|---|---|
| `common/` | Main views, top bar, constants, fields, repository interaction, store, utils |
| `fragments/` | Views and models for fragments view |
| `placeholders/` | Views and models for placeholders view |
| `promotions/` | Views and models for promotions view |
| `translation/` | Views and models for translation view |

## Code style

- Modern JavaScript only — no TypeScript.
- Use `const`/`let`, arrow functions, optional chaining (`?.`), nullish coalescing (`??`), destructuring, template literals.
- `async/await` over `.then()` chains; `for...of` over `.forEach()`; early returns over nested conditionals.
- No defensive code: no runtime type checks, no `typeof` guards, no `method && method()` patterns, no `try/catch` unless there is a known recoverable failure mode.
- Prefer named exports over default exports. Barrel `index.js` files re-export only — no logic.
- Co-locate related code; avoid scattering logic across many tiny utility files.
- Always follow Prettier rules — single quotes, 4-space indent, 128-char line width (root); single quotes, 4-space indent (web-components). Write code that passes `npm run format` without changes.

## Web Components (Lit + Adobe Spectrum)

- Use Lit for all custom elements with reactive properties (`static properties`).
- Use `render()` for declarative templates — no imperative DOM manipulation.
- Use getters (for example `get headerTemplate()`) for rendering HTML sections, not `renderXyz()` methods.
- Only use per-item render functions when iterating over a list.
- Use Adobe Spectrum Web Components (`@spectrum-web-components/*`) for UI primitives. Do not reinvent what Spectrum provides.
- CSS via `static styles` and CSS custom properties — avoid inline styles. Use `styleMap`/`classMap` for dynamic styles.
- Dispatch custom events (not callbacks) for child-to-parent communication.
- In Lit components, use `willUpdate()` for derived state — avoid computing in `render()`.

## Testing

Unit tests live in `.html` files and render visually verifiable test cases. Each test file should display the component or behavior under test in a visible, inspectable way. Test meaningful behavior and visual states — not implementation details.

Coverage thresholds enforced: 85% branches/statements/lines, 65% functions (web-components); similar thresholds in studio.

## Branch naming

Feature branches must follow the format `MWPW-XXXXXX` (Jira ticket number). IMS client regex check will fail and sign-in will break otherwise.

## Environments

- Preview: https://main--mas--adobecom.aem.page/
- Live: https://main--mas--adobecom.aem.live/

## Node version

- Node 20 for most development (`.nvmrc`).
- Node >=22.16 required for `io/www`. If committing changes in `/io/www`, ensure Node 22.16+ is active — the Husky pre-commit hook runs tests and `build:client`.

## Migration note

The local Claude Code config includes project-level instructions in `CLAUDE.md` and environment/tool permissions in `.claude/settings.local.json`. Secret values or access tokens from the Claude config were not copied into this repository. Keep those in your local shell, environment, or secure secret management for this project.
