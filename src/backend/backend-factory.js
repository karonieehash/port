import { SupabaseRepository } from './database/supabase/supabase-repository.js';
import { LocalRepository } from './database/local/local-repository.js';
import { SupabaseAuth } from './auth/supabase/supabase-auth.js';
import { LocalAuth } from './auth/local/local-auth.js';

/**
 * Backend Factory
 *
 * Instantiates the appropriate Database and Auth adapters based on application configuration.
 * Gracefully falls back to local providers if Supabase credentials are not provided.
 */
export function createBackend(config) {
  const isSupabaseConfigured = Boolean(config.supabase?.url && config.supabase?.anonKey);

  let authAdapter;
  let repositoryAdapter;

  if (config.authProvider === 'supabase' && isSupabaseConfigured) {
    authAdapter = new SupabaseAuth({
      url: config.supabase.url,
      anonKey: config.supabase.anonKey,
      ownerEmail: config.supabase.ownerEmail
    });
  } else {
    authAdapter = new LocalAuth(config.supabase?.ownerEmail || 'owner@example.com');
  }

  if (config.databaseProvider === 'supabase' && isSupabaseConfigured) {
    repositoryAdapter = new SupabaseRepository({
      url: config.supabase.url,
      anonKey: config.supabase.anonKey,
      getAuthToken: () => (typeof authAdapter.getAccessToken === 'function' ? authAdapter.getAccessToken() : null)
    });
  } else {
    repositoryAdapter = new LocalRepository();
  }

  return {
    authAdapter,
    repositoryAdapter,
    isLocalFallback: !isSupabaseConfigured
  };
}
