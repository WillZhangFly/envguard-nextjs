import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

let runtimeEnv: Record<string, string> = {};
let isInitialized = false;

export interface EnvGuardConfig<T extends z.ZodRawShape> {
  schema: z.ZodObject<T>;
  envPath?: string;
  allowMissingInDev?: boolean;
  onError?: (error: z.ZodError) => void;
}

export function initEnv<T extends z.ZodRawShape>(
  config: EnvGuardConfig<T>
): z.infer<z.ZodObject<T>> {
  if (isInitialized && process.env.NODE_ENV !== 'test') {
    console.warn('EnvGuard already initialized.');
    return runtimeEnv as z.infer<z.ZodObject<T>>;
  }

  const envVars = loadEnvVars(config.envPath);
  const mergedEnv = { ...envVars, ...process.env };

  try {
    const validated = config.schema.parse(mergedEnv);
    runtimeEnv = validated as Record<string, string>;
    isInitialized = true;

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ EnvGuard: Validated');
    }

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      if (config.onError) {
        config.onError(error);
      } else {
        handleValidationError(error, config.allowMissingInDev);
      }
    }
    throw error;
  }
}

export function getEnv(): Record<string, string> {
  if (!isInitialized) {
    throw new Error('EnvGuard not initialized. Call initEnv() first.');
  }
  return { ...runtimeEnv };
}

function loadEnvVars(customPath?: string): Record<string, string> {
  const env: Record<string, string> = {};

  if (customPath && fs.existsSync(customPath)) {
    Object.assign(env, parseEnvFile(customPath));
    return env;
  }

  const mode = process.env.NODE_ENV || 'development';
  const envFiles = ['.env', `.env.${mode}`, '.env.local', `.env.${mode}.local`];
  const rootDir = process.cwd();

  for (const file of envFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      Object.assign(env, parseEnvFile(filePath));
    }
  }

  return env;
}

function parseEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  const content = fs.readFileSync(filePath, 'utf-8');

  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }
  });

  return env;
}

function handleValidationError(error: z.ZodError, allowMissingInDev?: boolean): never {
  const isDev = process.env.NODE_ENV === 'development';

  console.error('\n❌ EnvGuard: Validation failed\n');

  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    console.error(`  • ${path}: ${issue.message}`);
  });

  console.error('\n📝 Required:');
  error.issues
    .filter((issue) => issue.code === 'invalid_type')
    .forEach((issue) => {
      const key = issue.path[0];
      console.error(`  export ${key}=<value>`);
    });

  if (allowMissingInDev && isDev) {
    console.warn('\n⚠️ Dev mode: Continuing\n');
    return process.exit(0) as never;
  }

  console.error('\n💡 Check your .env files\n');
  process.exit(1);
}

export function createEnv<T extends z.ZodRawShape>(
  config: EnvGuardConfig<T>
): z.infer<z.ZodObject<T>> {
  initEnv(config);
  return getEnv() as z.infer<z.ZodObject<T>>;
}

export function createServerEnv<T extends z.ZodRawShape>(schema: T): z.ZodObject<T> {
  return z.object(schema);
}

export function createClientEnv<T extends z.ZodRawShape>(schema: T): z.ZodObject<T> {
  Object.keys(schema).forEach((key) => {
    if (!key.startsWith('NEXT_PUBLIC_')) {
      throw new Error(`Client env "${key}" must start with NEXT_PUBLIC_`);
    }
  });
  return z.object(schema);
}

export type { z };
