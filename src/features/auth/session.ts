import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string;
  fullName: string;
};

/**
 * Data Access Layer entry point for the signed-in user. Uses getUser(), which
 * verifies the token with Supabase Auth instead of trusting the cookie.
 * Reads cookies, so callers must be dynamic (Suspense, actions, handlers).
 */
export const getCurrentUser = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const metadata = data.user.user_metadata as { full_name?: string; name?: string };
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    fullName: metadata.full_name ?? metadata.name ?? "",
  };
});

export class AuthRequiredError extends Error {
  constructor() {
    super("Please log in to continue.");
    this.name = "AuthRequiredError";
  }
}

export async function requireUser(): Promise<Viewer> {
  const user = await getCurrentUser();
  if (!user) throw new AuthRequiredError();
  return user;
}
