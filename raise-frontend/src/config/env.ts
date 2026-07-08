/**
 * Environment configuration
 * Validates and exports environment variables
 */

function getEnvVar(key: string, defaultValue?: string): string {
  // Use typeof window to detect client vs server
  const value = typeof window === 'undefined' 
    ? process.env[key] || defaultValue
    : (window as any)[key] || process.env[key] || defaultValue;
  
  if (!value) {
    console.error(`Missing environment variable: ${key}`);
    console.error(`Available env vars:`, Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')));
    throw new Error(`Missing environment variable: ${key}`);
  }
  
  return value;
}

// Create env object with getter functions to delay evaluation
const createEnv = () => ({
  // API Configuration
  get apiUrl() { return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'; },
  get apiVersion() { return process.env.NEXT_PUBLIC_API_VERSION || 'v1'; },
  
  // App Configuration
  get appName() { return process.env.NEXT_PUBLIC_APP_NAME || 'Raise'; },
  get appUrl() { return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; },
  
  // Supabase Configuration  
  get supabaseUrl() { 
    const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!value) {
      throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
    }
    return value;
  },
  get supabaseAnonKey() { 
    const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!value) {
      throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return value;
  },
  
  // Feature Flags
  get isDevelopment() { return process.env.NODE_ENV === 'development'; },
  get isProduction() { return process.env.NODE_ENV === 'production'; },
  get isTest() { return process.env.NODE_ENV === 'test'; },
});

export const env = createEnv();

export default env;

