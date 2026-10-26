"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { invalidInput, type ActionResult } from "@/lib/action-result";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

import { safeNextPath } from "./redirect";
import {
  logInSchema,
  newPasswordSchema,
  OAUTH_PROVIDERS,
  resetRequestSchema,
  signUpSchema,
} from "./schemas";

type FormState = ActionResult<{ message: string }> | null;

/** Base URL for auth email links and OAuth callbacks (works on preview deployments). */
async function siteOrigin(): Promise<string> {
  const origin = (await headers()).get("origin");
  return origin && /^https?:\/\//.test(origin) ? origin : getPublicEnv().NEXT_PUBLIC_SITE_URL;
}

function callbackUrl(origin: string, next: string) {
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    acceptPrivacy: formData.get("acceptPrivacy") === "on",
  });
  if (!parsed.success) return invalidInput(parsed.error);

  const next = safeNextPath(formData.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: callbackUrl(await siteOrigin(), next),
    },
  });

  if (error) {
    const message =
      error.code === "user_already_exists"
        ? "An account with this email already exists. Try logging in."
        : error.code === "weak_password"
          ? "Please choose a stronger password."
          : "We couldn't create your account. Please try again.";
    return { ok: false, error: message };
  }

  // With email confirmation enabled there is no session until the link is clicked.
  if (!data.session) {
    return {
      ok: true,
      data: { message: "Almost there! Check your email and click the link to confirm your account." },
    };
  }

  redirect(next);
}

export async function logIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = logInSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const message =
      error.code === "email_not_confirmed"
        ? "Please confirm your email address first. Check your inbox for the link."
        : "Incorrect email or password.";
    return { ok: false, error: message };
  }

  redirect(safeNextPath(formData.get("next")));
}

export async function requestPasswordReset(email: string): Promise<ActionResult<{ message: string }>> {
  const parsed = resetRequestSchema.safeParse({ email });
  if (!parsed.success) return invalidInput(parsed.error, "Enter your email address first.");

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: callbackUrl(await siteOrigin(), "/reset-password"),
  });

  // Rate limiting is the only error worth surfacing; never reveal whether an account exists.
  if (error?.status === 429) {
    return { ok: false, error: "Too many requests. Please wait a minute and try again." };
  }
  if (error) console.error("resetPasswordForEmail failed", error.message);

  return {
    ok: true,
    data: { message: "If an account exists for this email, we've sent a link to reset the password." },
  };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });
  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, error: "Your reset link has expired. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const message =
      error.code === "same_password"
        ? "Choose a password different from your current one."
        : "We couldn't update your password. Please try again.";
    return { ok: false, error: message };
  }

  redirect("/");
}

export async function signInWithOAuth(
  provider: string,
  next: string,
): Promise<ActionResult> {
  const parsedProvider = z.enum(OAUTH_PROVIDERS).safeParse(provider);
  if (!parsedProvider.success) return { ok: false, error: "Unsupported sign-in provider." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: parsedProvider.data,
    options: { redirectTo: callbackUrl(await siteOrigin(), safeNextPath(next)) },
  });

  if (error || !data.url) {
    // Typically "provider is not enabled" until OAuth credentials are configured.
    return {
      ok: false,
      error: `Sign-in with ${parsedProvider.data === "google" ? "Google" : "Facebook"} isn't available right now.`,
    };
  }

  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
