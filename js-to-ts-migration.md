# Plan: Migrate reviews-backend from JavaScript to TypeScript

## Context

Express 4 + Sequelize 6 (MySQL) REST API using CommonJS modules, Node 20, with ESLint + Prettier + Husky. Migrate to TypeScript incrementally without changing functionality.

**Key decision:** Stay on CommonJS (`"module": "commonjs"` in tsconfig). Express 4 and Sequelize 6 have first-class CommonJS support. TypeScript with CommonJS still allows `import/export` syntax — `tsc` compiles them to `require/module.exports`.

---

## Phase 0 — TypeScript Tooling & Configuration ✅

No files renamed or changed functionally. App continues to run as JS via `allowJs: true`.

### 0.1 Install TypeScript, ts-node, and base config

```bash
npm install --save-dev typescript ts-node @tsconfig/node20
```

### 0.2 Install @types/\* packages

```bash
npm install --save-dev @types/node @types/express @types/bcrypt @types/compression @types/cookie-parser @types/cors @types/jsonwebtoken @types/morgan @types/swagger-ui-express
```

Packages that ship their own types (no `@types` needed): `axios`, `dotenv`, `express-rate-limit`, `express-validator`, `mysql2`, `sequelize`.

### 0.3 Create `tsconfig.json`

```json
{
  "extends": "@tsconfig/node20/tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "target": "ES2022",
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "allowJs": true,
    "checkJs": false,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  },
  "include": ["**/*.ts", "**/*.js"],
  "exclude": ["node_modules", "dist", "migrations", "utils/JSON"]
}
```

- `allowJs: true` — lets `.ts` and `.js` coexist during migration
- `checkJs: false` — no errors from unconverted JS files
- `strict: true` from the start — easier to enable early than retrofit later
- `noUnusedLocals/Parameters: false` initially — avoid noise during migration
- `migrations/` excluded — sequelize-cli requires plain JS
- `utils/JSON/` excluded — standalone CLI scripts, not part of the server

### 0.4 Create `nodemon.json`

```json
{
  "watch": ["index.ts", "config", "controllers", "middlewares", "models", "routes", "utils"],
  "ext": "ts,js,json",
  "exec": "ts-node index.ts"
}
```

### 0.5 Update `package.json` scripts

```json
{
  "start": "nodemon",
  "build": "tsc",
  "start:prod": "node dist/index.js",
  "swagger": "ts-node swagger.ts",
  "swagger:dev": "ts-node swagger.ts && npm start",
  "lint": "eslint . --ext .js,.ts"
}
```

### 0.6 Update ESLint for TypeScript

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Update `.eslintrc.json`: set `parser` to `@typescript-eslint/parser`, add `plugin:@typescript-eslint/recommended` to extends, add `@typescript-eslint` plugin. Keep `@typescript-eslint/no-var-requires` OFF during migration.

### 0.7 Update lint-staged in `package.json`

```json
"lint-staged": {
  "*.{js,ts}": ["eslint --fix"],
  "*.+(json|md)": ["prettier --write"]
}
```

### 0.8 Add `dist/` to `.gitignore`

### 0.9 Create type declaration for untyped modules: `types/global.d.ts`

- Declaration for `swagger-autogen` (no official types)

---

## Phase 1 — Shared Type Definitions ✅

Pure additive work — new files only, no renames.

### 1.1 Create `types/express.d.ts`

Augment Express `Request` with custom properties:

- `req.id: string` (from `requestId` middleware)
- `req.userId?: number` (from `validateToken` middleware)
- `req.authenticated?: boolean` (from `validateToken` middleware)
- `req.pagination: { page: number; pageSize: number; offset: number }` (from `pagination` middleware)

### 1.2 Create `types/models.ts`

Define attribute interfaces for each Sequelize model:

- `UserAttributes`, `UserCreationAttributes`
- `ReviewAttributes`, `ReviewCreationAttributes`
- `ImageAttributes`, `ImageCreationAttributes`

### 1.3 Create `types/api.ts`

Define shared response/payload types:

- `PaginationMeta` — totalRecords, page, pageSize, totalPages, hasPreviousPage, hasNextPage
- `ErrorResponse` — error, requestId, message, details, stack
- `JwtPayload` — id, email, iat, exp

---

## Phase 2 — Convert Utility Files (.js → .ts) ✅

Start from leaf nodes (files imported by others but import nothing from the project).

### Files (in order)

| #   | File                   | Key typing notes                                                 |
| --- | ---------------------- | ---------------------------------------------------------------- |
| 2.1 | `utils/validateEnv.ts` | `(): void`, no project imports                                   |
| 2.2 | `utils/platforms.ts`   | `platformUrls: Record<string, string>`, return `string \| null`  |
| 2.3 | `utils/pagination.ts`  | Use `PaginationMeta` from `types/api.ts`                         |
| 2.4 | `utils/token.ts`       | `createAccessToken(user: { id: number; email: string }): string` |
| 2.5 | `utils/user.ts`        | `(req: Request) => number \| undefined`                          |
| 2.6 | `utils/image.ts`       | `getBase64(url: string): Promise<string \| undefined>`           |

### Per-file process

1. Rename `.js` → `.ts`
2. Replace `require()` with `import` statements
3. Replace `module.exports` with `export`
4. Add parameter and return types
5. Verify `npm start` still works

---

## Phase 3 — Convert Middleware Files (.js → .ts) ✅

### Files (in order)

| #   | File                          | Key typing notes                                                                                                                                   |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | `middlewares/requestId.ts`    | Uses `crypto` (typed via `@types/node`), sets `req.id`                                                                                             |
| 3.2 | `middlewares/rateLimiter.ts`  | `express-rate-limit` ships own types                                                                                                               |
| 3.3 | `middlewares/pagination.ts`   | Sets `req.pagination`, typed via Express augmentation                                                                                              |
| 3.4 | `middlewares/validators.ts`   | `express-validator` ships own types; let TS infer array types                                                                                      |
| 3.5 | `middlewares/token.ts`        | JWT verify returns `JwtPayload \| string`, needs cast. `process.env.TOKEN_SECRET!` (non-null assertion OK since `validateEnv()` checks at startup) |
| 3.6 | `middlewares/errorHandler.ts` | Define local `AppError` interface extending `Error` with `statusCode?`, `status?`, `errors?`                                                       |

---

## Phase 4 — Convert Sequelize Models (.js → .ts) ✅

Most architecturally significant change.

### 4.1–4.3 Convert `models/User.ts`, `models/Review.ts`, `models/Image.ts`

Switch from factory pattern to **class-based Sequelize models**:

```typescript
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  // ... attribute declarations ...

  public static associate(models: Record<string, any>): void { ... }
  public static initModel(sequelize: Sequelize): typeof User { ... }
}
export default User;
```

### 4.4 Convert `models/index.ts`

Replace the dynamic `fs.readdirSync` loader with **explicit typed imports**:

```typescript
import User from './User';
import Review from './Review';
import Image from './Image';

User.initModel(sequelize);
Review.initModel(sequelize);
Image.initModel(sequelize);
// Then call associate() on each
```

**Config path pitfall:** `config/config.js` stays as JS. In `models/index.ts`, use `path.join(process.cwd(), 'config', 'config.js')` instead of `__dirname`-relative path, so it works both in source and compiled `dist/` output.

---

## Phase 5 — Convert Controllers (.js → .ts) ✅

### Files (in order)

| #   | File                                      | Key typing notes                                                                                                                   |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | `controllers/ImageController.ts`          | Returns `Promise<Image \| null>`                                                                                                   |
| 5.2 | `controllers/AuthController.ts`           | `bcrypt` typed via `@types/bcrypt`, handlers typed as `(req: Request, res: Response, next: NextFunction) => Promise<void>`         |
| 5.3 | `controllers/UserController.ts`           | Destructures `user.dataValues` — typed by model attributes                                                                         |
| 5.4 | `controllers/ReviewController.ts`         | Largest controller — `findAndCountAll`, pagination, Image include                                                                  |
| 5.5 | `controllers/RecommendationController.ts` | Import JSON with `import data from '../data/recommendations.json'` (`resolveJsonModule: true`). Define `Recommendation` interface. |

---

## Phase 6 — Convert Routes (.js → .ts) ✅

Thin wiring files, all follow the same pattern:

```typescript
import { Router } from 'express';
const router = Router();
// ... route definitions ...
export default router;
```

### Files

| #   | File                       |
| --- | -------------------------- |
| 6.1 | `routes/Auth.ts`           |
| 6.2 | `routes/Review.ts`         |
| 6.3 | `routes/User.ts`           |
| 6.4 | `routes/Recommendation.ts` |
| 6.5 | `routes/Status.ts`         |

Swagger comment annotations remain unchanged — `swagger-autogen` parses them as plain comments.

---

## Phase 7 — Convert Entry Point & Config

### 7.1 `config/config.js` — DO NOT CONVERT

Sequelize-cli requires JS. No typing benefit.

### 7.2 `config/swaggerOptions.ts`

Convert or delete if unused.

### 7.3 `swagger.ts`

Uses `swagger-autogen` — covered by declaration file from Phase 0. Update endpoint file reference from `'./index.js'` to `'./index.ts'`.

### 7.4 `index.ts`

Convert entry point last (all dependencies already typed). Key changes:

- All `require()` → `import` statements
- Morgan custom tokens: `morgan.token('id', (req) => (req as any).id)`
- `app.listen` callback: use `server.on('error', ...)` pattern

---

## Phase 8 — Tighten Types & Clean Up

### 8.1 Enable stricter tsconfig options

```json
"noUnusedLocals": true,
"noUnusedParameters": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true
```

### 8.2 Set `"allowJs": false`

### 8.3 Change `@typescript-eslint/no-var-requires` to `"error"`

### 8.4 Audit `any` usage — replace with proper types where feasible

### 8.5 Add type check to pre-commit hook

```bash
npx tsc --noEmit && npx lint-staged
```

### 8.6 Review notes

- [ ] `process.env.TOKEN_SECRET!` non-null assertion in `utils/token.ts` — safe because `validateEnv()` checks at startup, but consider a stricter pattern (e.g. a typed config object)

---

## Phase 9 — Production Build Pipeline

### 9.1 Verify production build

```bash
npm run build && node dist/index.js
```

### 9.2 Config path resolution

Ensure `config/config.js` is reachable from compiled `dist/` output.

### 9.3 Update deployment scripts

Add `npm run build` step, change production start to `node dist/index.js`.

---

## Files That Stay as JavaScript

| File                             | Reason                                    |
| -------------------------------- | ----------------------------------------- |
| `config/config.js`               | Required by sequelize-cli as JS           |
| `migrations/*.js` (7 files)      | sequelize-cli only runs JS migrations     |
| `utils/JSON/lowercaseKeys.js`    | Standalone CLI script, not part of server |
| `utils/JSON/removeProperties.js` | Standalone CLI script, not part of server |

---

## Commit Strategy

Each phase = one commit, keeping the project in a working state at every step:

1. `chore: add TypeScript tooling and configuration` — Phase 0
2. `refactor: add shared TypeScript type definitions` — Phase 1
3. `refactor: convert utility files to TypeScript` — Phase 2
4. `refactor: convert middleware files to TypeScript` — Phase 3
5. `refactor: convert Sequelize models to TypeScript` — Phase 4
6. `refactor: convert controllers to TypeScript` — Phase 5
7. `refactor: convert route files to TypeScript` — Phase 6
8. `refactor: convert entry point and swagger to TypeScript` — Phase 7
9. `chore: tighten TypeScript strict mode and clean up` — Phase 8 + 9

---

## Verification (per phase)

After every phase:

1. `tsc --noEmit` — no type errors
2. `npm start` — server boots, "Database connected" message appears
3. Test core flows: register → login → create review → get reviews → update → delete
4. Verify response shapes are identical (no client breakage)
