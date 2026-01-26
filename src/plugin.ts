import type { NextConfig } from 'next';

export interface EnvGuardPluginOptions {
  schemaPath?: string;
  debug?: boolean;
}

export function withEnvGuard(
  nextConfig: NextConfig = {},
  options: EnvGuardPluginOptions = {}
): NextConfig {
  return {
    ...nextConfig,
    webpack(config, context) {
      if (typeof nextConfig.webpack === 'function') {
        config = nextConfig.webpack(config, context);
      }
      return config;
    },
    env: {
      ...nextConfig.env,
      __ENVGUARD_RUNTIME__: 'true',
    },
  };
}
