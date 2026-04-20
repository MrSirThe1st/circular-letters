type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

function readEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseEnv(): SupabaseEnv {
  return {
    url: readEnv('NEXT_PUBLIC_SUPABASE_URL'),
    publishableKey: readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  };
}