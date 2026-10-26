import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/features/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase redirects here after OAuth sign-in, email confirmation and
 * password-reset links with a one-time `code` that we exchange for a session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
    console.error("exchangeCodeForSession failed", error.message);
  }

  const providerError = searchParams.get("error_description");
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set(
    "error",
    providerError ? "provider" : "link",
  );
  return NextResponse.redirect(loginUrl);
}
