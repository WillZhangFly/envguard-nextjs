# @gooselanding/envguard-nextjs

**Type-safe runtime environment variables for Next.js with Zod validation.**

Stop rebuilding Docker images for config changes. Get TypeScript autocomplete and validation for all your env vars.

[![npm version](https://img.shields.io/npm/v/@gooselanding/envguard-nextjs.svg)](https://www.npmjs.com/package/@gooselanding/envguard-nextjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## Why This Package?

Next.js bakes environment variables at **build time**, which creates problems for Docker deployments:

| Problem | With Next.js Default | With EnvGuard |
|---------|---------------------|---------------|
| Change API_URL | Rebuild entire image | Just restart |
| Deploy to staging/prod | Build separate images | Same image, different env |
| Type safety | None | Full TypeScript support |
| Validation | Silent failures | Fail fast with clear errors |

---

## Comparison with Alternatives

| Feature | envguard-nextjs | envalid | env-var | t3-env |
|---------|----------------|---------|---------|--------|
| Next.js optimized | **Yes** | No | No | Yes |
| Runtime validation | **Yes** | Build-time | Build-time | Build-time |
| Docker-friendly | **Yes** | No | No | No |
| Zod schema | **Yes** | Custom | Custom | Yes |
| Zero config | **Yes** | No | No | No |
| Client/Server split | **Yes** | No | No | Yes |
| Bundle size | **~2KB** | ~8KB | ~12KB | ~5KB |

### Why not envalid or env-var?
They validate at build time, so you still need to rebuild for env changes. **EnvGuard validates at runtime**, perfect for Docker deployments.

### Why not t3-env?
t3-env is great but still requires rebuilds. EnvGuard is specifically designed for **runtime configuration** without rebuilding.

---

## Installation

```bash
npm install @gooselanding/envguard-nextjs zod
```

---

## Quick Start

### 1. Define your schema

Create `env.ts`:
```typescript
import { z, createEnv } from '@gooselanding/envguard-nextjs';

export const env = createEnv({
  schema: z.object({
    DATABASE_URL: z.string().url(),
    API_SECRET: z.string().min(32),
    NEXT_PUBLIC_API_URL: z.string().url(),
  }),
});
```

### 2. Use anywhere with full type safety
```typescript
import { env } from './env';

const apiUrl = env.NEXT_PUBLIC_API_URL; // TypeScript autocomplete!
const dbUrl = env.DATABASE_URL;         // Type-checked!
```

---

## Features

### Runtime Environment Variables
Change env vars without rebuilding your Docker image:
```bash
# Same image, different environments!
docker run -e DATABASE_URL=postgres://staging app:latest
docker run -e DATABASE_URL=postgres://prod app:latest
```

### Full TypeScript Support
- Autocomplete for all env vars
- Compile-time type checking
- No more `process.env.TYPO` bugs

### Zod Validation
```typescript
z.object({
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  EMAIL: z.string().email(),
  API_URL: z.string().url(),
  DEBUG: z.enum(['true', 'false']).transform(v => v === 'true'),
})
```

### Client/Server Separation
```typescript
import { createClientEnv, createServerEnv, z } from '@gooselanding/envguard-nextjs';

// Server-only (throws if used in browser)
const serverEnv = createServerEnv({
  DATABASE_URL: z.string(),
  API_SECRET: z.string(),
});

// Client-safe (must start with NEXT_PUBLIC_)
const clientEnv = createClientEnv({
  NEXT_PUBLIC_API_URL: z.string(),
});
```

### Clear Error Messages
```
❌ EnvGuard: Validation failed

  • DATABASE_URL: Invalid url
  • API_SECRET: String must contain at least 32 character(s)

📝 Required:
  export DATABASE_URL=<value>
  export API_SECRET=<value>

💡 Check your .env files
```

---

## Docker Usage

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["npm", "start"]
```

**Deploy to any environment:**
```bash
# Staging
docker run -e DATABASE_URL=postgres://staging -e API_SECRET=... app:latest

# Production
docker run -e DATABASE_URL=postgres://prod -e API_SECRET=... app:latest
```

No rebuilds needed!

---

## API Reference

### `createEnv(config)`
Main function to create a validated env object.

```typescript
createEnv({
  schema: z.object({ ... }),     // Required: Zod schema
  envPath?: string,               // Optional: Custom .env path
  allowMissingInDev?: boolean,    // Optional: Skip errors in dev
  onError?: (error) => void,      // Optional: Custom error handler
})
```

### `initEnv(config)`
Initialize env validation (called automatically by `createEnv`).

### `getEnv()`
Get the validated env object after initialization.

### `createServerEnv(schema)` / `createClientEnv(schema)`
Helper functions for type-safe client/server env separation.

---

## Next.js Plugin (Optional)

```javascript
// next.config.js
const { withEnvGuard } = require('@gooselanding/envguard-nextjs/plugin');

module.exports = withEnvGuard({
  // your next config
});
```

---

## Support This Project

If envguard-nextjs saved you time:
- Star the [GitHub repo](https://github.com/willzhangfly/envguard-nextjs)
- Share with your team
- [Buy me a coffee](https://buymeacoffee.com/willzhangfly)

## License

MIT
