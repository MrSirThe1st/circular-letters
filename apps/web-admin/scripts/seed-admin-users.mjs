import { createClient } from '@supabase/supabase-js';

function readEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function parseSeedUsers() {
  const raw = process.env.ADMIN_SEED_USERS;

  if (!raw) {
    throw new Error('Missing environment variable: ADMIN_SEED_USERS');
  }

  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('ADMIN_SEED_USERS must be valid JSON.');
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('ADMIN_SEED_USERS must be a non-empty JSON array.');
  }

  return parsed.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`Seed entry at index ${index} must be an object.`);
    }

    const email = typeof entry.email === 'string' ? entry.email.trim().toLowerCase() : '';
    const password = typeof entry.password === 'string' ? entry.password.trim() : '';

    if (!email || !password) {
      throw new Error(`Seed entry at index ${index} requires email and password.`);
    }

    return {
      email,
      password,
    };
  });
}

async function main() {
  const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');
  const seedUsers = parseSeedUsers();

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const results = [];

  for (const user of seedUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      app_metadata: {
        role: 'admin',
      },
      user_metadata: {
        source: 'seed-script',
      },
    });

    if (error) {
      results.push({
        email: user.email,
        status: 'error',
        message: error.message,
      });
      continue;
    }

    results.push({
      email: user.email,
      status: 'created',
      message: data.user?.id ?? 'created',
    });
  }

  console.table(results);

  const failures = results.filter((result) => result.status === 'error');

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});