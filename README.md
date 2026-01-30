# @gooselanding/envguard-nextjs

**Type-safe runtime environment variables for Next.js with validation.**

Stop rebuilding Docker images for config changes. Get TypeScript autocomplete and validation for all your env vars.

[![npm version](https://img.shields.io/npm/v/@gooselanding/envguard-nextjs.svg)](https://www.npmjs.com/package/@gooselanding/envguard-nextjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why?

Next.js bakes environment variables at **build time**, which sucks for Docker deployments:

❌ Build once → Can't deploy to multiple environments  
❌ Change API_URL → Rebuild entire image  
❌ No type safety → Runtime errors in production  
❌ No validation → Silent failures

**EnvGuard fixes this:**

✅ Runtime environment variables (change without rebuilding)  
✅ Full TypeScript support (autocomplete + type checking)  
✅ Zod validation (fail fast with clear errors)  
✅ Zero config (works out of the box)  
✅ Next.js 13, 14, 15+ support

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

const apiUrl = env.NEXT_PUBLIC_API_URL; // ✅ TypeScript autocomplete!
```

---

## Docker Usage

**Change env vars without rebuilding:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
ENV DATABASE_URL=""
CMD ["npm", "start"]
```
```bash
# Same image, different envs!
docker run -e DATABASE_URL=postgres://staging app:latest
docker run -e DATABASE_URL=postgres://prod app:latest
```

---

## Support This Project

If envguard-nextjs saved you time:
- ⭐ Star the repo
- 📢 Share with your team
- ☕ [Buy me a coffee](https://buymeacoffee.com/willzhangfly)

## License

MIT