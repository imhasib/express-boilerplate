# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start with nodemon (hot reload)
npm run start            # Production with PM2

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run coverage         # Coverage report
npx jest tests/integration/auth.test.js  # Run single test file
npx jest -t "should return 201"          # Run tests matching pattern

# Linting
npm run lint             # Check ESLint
npm run lint:fix         # Fix ESLint errors
npm run prettier         # Check Prettier
npm run prettier:fix     # Fix Prettier errors

# Docker
npm run docker:dev       # Development container
npm run docker:prod      # Production container
npm run docker:test      # Test in container
```

## Architecture

This is an Express 5 REST API with MongoDB/Mongoose following a layered architecture:

```
Routes → Controllers → Services → Models
```

### Request Flow

1. **Routes** (`src/routes/v1/`) - Define endpoints with middleware chain
2. **Middlewares** - Applied in order: `auth()` → `validate(schema)` → controller
3. **Controllers** (`src/controllers/`) - Handle HTTP, call services, send responses
4. **Services** (`src/services/`) - Business logic, database operations
5. **Models** (`src/models/`) - Mongoose schemas with plugins

### Key Patterns

**Authentication**: JWT-based via Passport. Use `auth()` middleware for protected routes, `auth('permission')` for authorization.

```javascript
router.get('/users', auth('getUsers'), userController.getUsers);
```

**Validation**: Joi schemas in `src/validations/`. Applied via `validate()` middleware.

```javascript
router.post('/users', validate(userValidation.createUser), userController.createUser);
```

**Error Handling**: Throw `ApiError` anywhere - caught by `asyncHandler` and processed by error middleware.

```javascript
throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
```

**Roles & Permissions**: Defined in `src/config/roles.js`. Map roles to arrays of rights (e.g., `admin: ['getUsers', 'manageUsers']`).

### Model Plugins

All models should use these plugins from `src/models/plugins/`:
- `toJSON` - Removes `__v`, `password`, transforms `_id` to `id`
- `paginate` - Adds `.paginate(filter, options)` static method

### Testing Structure

- `tests/unit/` - Unit tests for models, middlewares
- `tests/integration/` - API endpoint tests using supertest
- `tests/fixtures/` - Test data (users, tokens)
- `tests/utils/setupTestDB.js` - MongoDB memory server setup

### API Versioning

All routes are prefixed with `/v1`. Swagger docs at `/v1/api-docs`.

### Environment

Required env vars: `NODE_ENV`, `PORT`, `MONGODB_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`. See `.env.example` for full list.
