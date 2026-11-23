/**
 * Application Configuration Layer
 *
 * Supports configuration via window.__ENV__ or default values.
 * Keeps public credentials safe and validates required values.
 */
export function getAppConfig() {
  const env = (typeof window !== 'undefined' && window.__ENV__) || {};

  return {
    appName: env.APP_NAME || 'Deepak Digital Humanities Portfolio',
    environment: env.NODE_ENV || 'production',
    backendProvider: env.BACKEND_PROVIDER || 'supabase', // 'supabase' | 'local'
    authProvider: env.AUTH_PROVIDER || 'supabase',       // 'supabase' | 'local'
    databaseProvider: env.DATABASE_PROVIDER || 'supabase',// 'supabase' | 'local'
    supabase: {
      url: env.SUPABASE_URL || '',
      anonKey: env.SUPABASE_ANON_KEY || '',
      ownerEmail: env.OWNER_EMAIL || ''
    }
  };
}

/**
 * Validates configuration and returns diagnostic status
 * @param {object} config
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateConfig(config) {
  const errors = [];
  if (config.backendProvider === 'supabase') {
    if (!config.supabase.url) {
      errors.push('Missing SUPABASE_URL in configuration.');
    }
    if (!config.supabase.anonKey) {
      errors.push('Missing SUPABASE_ANON_KEY in configuration.');
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
