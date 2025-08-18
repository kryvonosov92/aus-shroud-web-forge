import type * as processType from 'node:process'

type IEnv = typeof processType.env;

function readFromProcessEnv() {
  try {
    if (process) {
      return process?.env ?? {} as IEnv;
    }
  } catch (_) {}
  return {} as IEnv;
}

/**
 * @deprecated This function will be removed in a future version as we're phasing out Vite support.
 * TODO: Remove Vite support when migrating fully to Next.js
 */
function readFromImportMetaEnv(): IEnv {
  try {
    // Vite provides import.meta.env at build time
    // Next.js does not, but this guard keeps it safe
    // @ts-ignore
    const metaEnv = (import.meta as any)?.env
    if (metaEnv && typeof metaEnv === 'object') {
      return metaEnv as IEnv
    }
  } catch (_) {}
  return {}
}

const processEnv = readFromProcessEnv()
const metaEnv = readFromImportMetaEnv()

/**
 * Reads an environment variable value from available sources.
 * 
 * This function attempts to read environment variables in the following priority order:
 * 1. Node.js process.env (server-side and build-time)
 * 2. Vite's import.meta.env (client-side, deprecated)
 * 
 * @param key - The environment variable key to read
 * @returns The environment variable value as a string, or undefined if not found
 * 
 * @example
 * ```typescript
 * const apiUrl = readEnvKey('API_URL')
 * const port = readEnvKey('PORT') || '3000'
 * ```
 */
function readEnvKey(key: string): string | undefined {
  return (processEnv[key] ?? metaEnv[key] ?? undefined) as IEnv[keyof IEnv] 
}

export type RuntimeEnv = {
  nodeEnv: 'development' | 'production' | 'test'
  appEnv: string // custom, e.g. development | production | staging | preview
  vercelEnv?: 'development' | 'preview' | 'production'
  siteUrl?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean
  isPreview: boolean
}

export function getRuntimeEnv(): RuntimeEnv {
  const nodeEnv = (readEnvKey('NODE_ENV') as RuntimeEnv['nodeEnv']) || 'development'

  // Prefer explicit custom env; fall back to Vercel/Node
  const appEnv =
    readEnvKey('APP_ENV') ||
    readEnvKey('NEXT_PUBLIC_APP_ENV') ||
    (readEnvKey('VERCEL_ENV') as string) ||
    nodeEnv

  const vercelEnv = (readEnvKey('VERCEL_ENV') || readEnvKey('NEXT_PUBLIC_VERCEL_ENV')) as RuntimeEnv['vercelEnv'] | undefined

  const siteUrl = readEnvKey('NEXT_PUBLIC_SITE_URL') || readEnvKey('SITE_URL')

  // Support both current Vite names and future Next.js names
  const supabaseUrl = readEnvKey('NEXT_PUBLIC_SUPABASE_URL') || readEnvKey('VITE_SUPABASE_URL')
  const supabaseAnonKey = readEnvKey('NEXT_PUBLIC_SUPABASE_ANON_KEY') || readEnvKey('VITE_SUPABASE_ANON_KEY')

  const isDevelopment = nodeEnv === 'development'
  const isProduction = nodeEnv === 'production'
  const isTest = nodeEnv === 'test'
  const isPreview = vercelEnv === 'preview' || appEnv === 'preview'

  return {
    nodeEnv,
    appEnv,
    vercelEnv,
    siteUrl,
    supabaseUrl,
    supabaseAnonKey,
    isDevelopment,
    isProduction,
    isTest,
    isPreview,
  }
}

export const env = getRuntimeEnv()

