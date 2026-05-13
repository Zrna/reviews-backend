# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

Backend API for **Moovier**, a personal movie & TV review app. Authenticated users create reviews tied to TMDB-sourced media (movies/TV shows) with a rating, free-text review, optional URL, and a "watch again" flag. The API powers a web frontend (`reviews-web`) and a React Native mobile client (`reviews-mobile`). Endpoints expose user reviews (latest, paginated, grouped by rating), recommendations (from `data/recommendations.json`), and user/auth management.

## Common commands

- `npm start` — run the dev server via `nodemon` (watches `index.ts`, `config`, `controllers`, `middlewares`, `models`, `routes`, `utils`; executes with `ts-node`).
- `npm run build` — `tsc` compile to `dist/`.
- `npm run start:prod` — run the compiled build from `dist/index.js`.
- `npm run lint` / `npm run lint:fix` — ESLint over the repo.
- `npm run swagger` — regenerate `swagger-output.json` from route JSDoc-style `#swagger.*` comments. **Run this after adding/modifying any route** — `swagger-output.json` is gitignored and the server skips mounting `/api-docs` when it's missing.
- `npm run swagger:dev` — regenerate Swagger and start the dev server.
- `npm run migration:generate <name>` — scaffold a new Sequelize migration into `migrations/`.
- `npm run migration:run` / `npm run migration:undo` — apply / revert migrations.

Node `>=20` is required (`.nvmrc` pins `20.18.0`). No test runner is configured.

### Pre-commit hook

Husky runs `npx tsc --noEmit && npx lint-staged` on commit. `lint-staged` runs `eslint --fix` on staged `*.{js,ts}` and `prettier --write` on staged `*.{json,md}`. A type error or lint failure blocks the commit — fix the root cause rather than bypassing with `--no-verify`.

## Architecture

Express 5 + Sequelize (MySQL) REST API. Single entrypoint `index.ts` wires middleware → routes → 404 → global error handler in that order; **the global `errorHandler` must remain last**.

### Request lifecycle (`index.ts`)

1. `validateEnv()` runs before any other import that may read `process.env`. Required vars: DB\_\*, NODE_ENV, PORT, TOKEN_SECRET, TMDB_ACCESS_TOKEN, GOOGLE_OAUTH_CLIENT_IDS.
2. Sequelize authenticates, then `syncGenresFromTMDB()` pulls movie+TV genre catalogs from TMDB into the `genres` table on every boot (no-op when unchanged — see `utils/genreSync.ts`).
3. Swagger UI mounts at `/api-docs` and the raw OpenAPI JSON at `/api-docs/swagger.json`, but only if `swagger-output.json` exists on disk.
4. Per-request middleware order: `requestId` → `compression` → `cookieParser` → `cors` (credentials, origin `http://localhost:3000`) → JSON/urlencoded body parsers → `pino-http` logger → `apiLimiter` (rate limit) → routes.
5. Routes mount unauthenticated `statusRoutes` first, then `authRoutes`, `userRoutes`, `reviewRoutes`, `recommendationRoutes`. All non-auth routers apply `router.use(validateToken)` at the top.

### Auth model (dual web + mobile)

`middlewares/token.ts` reads the access token from the `access-token` **cookie first**, then falls back to an `Authorization: Bearer …` header for mobile clients. On every request, if the token is within `TOKEN_REFRESH_THRESHOLD` of expiring it issues a fresh JWT — set as a cookie for web _and_ returned via the `X-New-Token` response header for mobile to capture. Sliding session, no separate refresh endpoint.

`req.userId` is populated by `validateToken` and is the canonical way controllers identify the caller — use `getUserIdFromRequest(req)` from `utils/user.ts`. Token-related constants (`TOKEN_EXPIRATION`, `TOKEN_REFRESH_THRESHOLD`, `COOKIE_MAX_AGE`) live in `utils/token.ts`.

Auth supports email/password, Google OAuth, and Apple — see `LOGIN_METHODS.md` for the contract.

### Data layer (`models/`)

`models/index.ts` initializes Sequelize from `config/config.js` (env-driven), then calls each model's `initModel(sequelize)` followed by `associate({...})`. Associations are wired centrally there — **don't define associations inside the model files themselves**. Adding a new model means: create the file with `initModel` + `associate` static methods, then register both calls in `models/index.ts`.

Core entities: `User`, `Review`, `Media`, `Genre`, `MediaGenre` (join). `Review` belongs to `User` and `Media`; `Media` has many `Genre`s through `MediaGenre`. `data/recommendations.json` is static seed-style content used by `RecommendationController`.

### Routes & controllers

One router file per resource in `routes/` (`Auth`, `User`, `Review`, `Recommendation`, `Status`); one controller per resource in `controllers/`. Routes are thin: validator middleware (`middlewares/validators.ts`) → optional `pagination` middleware → controller. Pagination uses `req.pagination` (set by `middlewares/pagination.ts`) with `DEFAULT_PAGINATION` fallback.

Swagger docs are inline comments above each route (`// #swagger.tags`, `#swagger.summary`, `#swagger.security`). `swagger-autogen` parses these — see `SWAGGER.md` and `swagger.ts` for schema definitions. Always update these comments when adding/changing endpoints, then run `npm run swagger`.

### Error handling

Controllers use `try { … } catch (err) { return next(err); }` and let `middlewares/errorHandler.ts` produce the response. It branches on `err.name` for `SequelizeValidationError`, `SequelizeUniqueConstraintError`, `SequelizeDatabaseError`, `JsonWebTokenError`, `TokenExpiredError`, then falls through to a generic handler that hides 500 details and stack traces in production. All error responses include `requestId` for log correlation.

### Logging

`utils/logger.ts` exports a `pino` logger. `pino-http` is wired in `index.ts` with `customProps` injecting `requestId` and `userId` into every HTTP log line, and a custom log level (5xx→error, 4xx→warn, else info). When logging from controllers, pass `{ err, requestId: req.id, userId: req.userId }` as the first arg so traces stay correlated.

### Migrations

`sequelize-cli` migrations live in `migrations/` with timestamp prefixes. `config/config.js` reads DB credentials from env vars for `development`, `test`, and `production`. There is no schema sync — every schema change must be a migration.
