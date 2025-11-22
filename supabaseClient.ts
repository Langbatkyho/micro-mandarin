import { createClient } from '@supabase/supabase-js';

// Safe access to env variables
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key];
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// If environment variables are missing, create a dummy client to prevent crash during initial load
// Real client will only work if env vars are set properly
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder');

if (!supabaseUrl) {
  console.warn("Missing VITE_SUPABASE_URL. Auth features will not work until configured.");
}
