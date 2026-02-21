# API Documentation - Swagger

This project uses **automatic Swagger/OpenAPI documentation generation**.

## For Backend Developers

### Generate Documentation

After adding or modifying routes, regenerate the Swagger docs:

```bash
npm run swagger
```

This scans your routes and generates `swagger-output.json`.

### Add Documentation to Routes

Use simple comments in your route files:

```javascript
// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get all reviews'
// #swagger.description = 'Returns all reviews for the authenticated user'
/* #swagger.responses[200] = {
      description: 'List of reviews',
      content: {
        "application/json": {
          schema: { $ref: "#/definitions/Review" }
        }
      }
    }
*/
router.get('/api/reviews', ReviewController.get_all_reviews);
```

### View Documentation Locally

1. Generate docs: `npm run swagger`
2. Start server: `npm start`
3. Open browser: http://localhost:5001/api-docs

## For Frontend Developers

### Generate TypeScript Types

Install `openapi-typescript`:

```bash
npm install --save-dev openapi-typescript
```

Generate types from **local backend**:

```bash
npx openapi-typescript http://localhost:5001/api-docs/swagger.json -o types/api.ts
```

Generate types from **production**:

```bash
npx openapi-typescript https://yourdomain.com/api-docs/swagger.json -o types/api.ts
```

### Add to package.json

```json
{
  "scripts": {
    "types:api": "openapi-typescript https://yourdomain.com/api-docs/swagger.json -o types/api.ts"
  }
}
```

Now run: `npm run types:api` whenever the API changes.

## Available Endpoints

- **Swagger UI**: `/api-docs` (interactive documentation)
- **OpenAPI JSON**: `/api-docs/swagger.json` (raw spec for code generation)

## Notes

- `swagger-output.json` is **not committed** to git (it's auto-generated)
- Always run `npm run swagger` after changing routes
- The JSON endpoint is public (no authentication required)
- Schema definitions are in `swagger.js`
