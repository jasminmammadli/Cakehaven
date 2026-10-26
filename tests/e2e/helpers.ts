import { createClient } from "@supabase/supabase-js";

import type { Database } from "../../src/types/database";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Variables may come from the environment (CI).
}

export const admin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export async function deleteUserByEmail(email: string) {
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  const user = data.users.find((u) => u.email === email);
  if (user) await admin.auth.admin.deleteUser(user.id);
}
