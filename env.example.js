/**
 * Example Environment Configuration (Public Template)
 *
 * Copy this file to `env.js` and configure your credentials.
 * Include `env.js` before `app.js` in `index.html`.
 *
 * IMPORTANT SECURITY RULES:
 * 1. Only expose public credentials (SUPABASE_URL and SUPABASE_ANON_KEY).
 * 2. NEVER put the Supabase service-role key or database password in this file.
 * 3. In production on Netlify, you can inject window.__ENV__ at build time or via script.
 */
window.__ENV__ = {
  APP_NAME: 'Deepak · Digital Humanities Portfolio',
  NODE_ENV: 'production',
  BACKEND_PROVIDER: 'supabase', // 'supabase' or 'local'
  AUTH_PROVIDER: 'supabase',    // 'supabase' or 'local'
  DATABASE_PROVIDER: 'supabase',// 'supabase' or 'local'

  // Supabase Public Configuration (Safe for client browsers)
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-public-anon-key-here',

  // Designated owner email for owner identification
  OWNER_EMAIL: 'deepak.owner@example.com'
};
