"use client";

import { useActionState, useState, useTransition } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/features/checkout/components/field";
import type { ActionResult } from "@/lib/action-result";

import { logIn, requestPasswordReset, signUp, updatePassword } from "../actions";
import { PASSWORD_MIN } from "../schemas";
import { OAuthButtons } from "./oauth-buttons";

type FormState = ActionResult<{ message: string }> | null;

function fieldError(state: FormState, name: string): string | undefined {
  return state && !state.ok ? state.fieldErrors?.[name]?.[0] : undefined;
}

function FormError({ state }: { state: FormState }) {
  if (!state || state.ok || state.fieldErrors) return null;
  return (
    <p role="alert" className="rounded-[24px] bg-destructive/10 px-5 py-3 text-body2 text-destructive">
      {state.error}
    </p>
  );
}

/** "Forgot password?" caption (Figma helper text) that emails a reset link. */
function ForgotPassword({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await requestPasswordReset(email);
          if (result.ok) toast.success(result.data.message);
          else toast.error(result.error);
        })
      }
      className="cursor-pointer self-start rounded-sm px-0.5 text-caption text-grey-700 outline-none hover:text-lilac-900 hover:underline focus-visible:ring-3 focus-visible:ring-ring/60 disabled:cursor-progress"
    >
      {pending ? "Sending reset link…" : "Forgot password?"}
    </button>
  );
}

export function SignUpForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(signUp, null);
  const [email, setEmail] = useState("");

  if (state?.ok) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-10 text-center">
        <MailCheck aria-hidden className="size-12 text-lilac-800" strokeWidth={1.5} />
        <p className="text-body1">{state.data.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <form action={formAction} noValidate className="flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />
        <Field id="fullName" name="fullName" label="Full name" autoComplete="name" required error={fieldError(state, "fullName")} className="[&_input]:border-black-500" />
        <Field
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldError(state, "email")}
          className="[&_input]:border-black-500"
        />
        <div className="flex flex-col gap-[5px]">
          <Field
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN}
            required
            error={fieldError(state, "password")}
            className="[&_input]:border-black-500"
          />
          <ForgotPassword email={email} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex cursor-pointer items-center gap-1 text-body1">
            <Checkbox name="acceptPrivacy" aria-invalid={fieldError(state, "acceptPrivacy") ? true : undefined} />
            I accept the privacy policy
          </label>
          {fieldError(state, "acceptPrivacy") && (
            <p className="text-body2 text-destructive">{fieldError(state, "acceptPrivacy")}</p>
          )}
        </div>
        <FormError state={state} />
        <Button type="submit" className="mt-3 w-full" disabled={pending} aria-busy={pending || undefined}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <OAuthButtons next={next} />
    </div>
  );
}

export function LogInForm({ next, initialError }: { next: string; initialError?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(logIn, null);
  const [email, setEmail] = useState("");
  const shownState: FormState = state ?? (initialError ? { ok: false, error: initialError } : null);

  return (
    <div className="flex flex-col gap-8">
      <form action={formAction} noValidate className="flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />
        <Field
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldError(shownState, "email")}
          className="[&_input]:border-black-500"
        />
        <div className="flex flex-col gap-[5px]">
          <Field
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
            error={fieldError(shownState, "password")}
            className="[&_input]:border-black-500"
          />
          <ForgotPassword email={email} />
        </div>
        <FormError state={shownState} />
        <Button type="submit" className="mt-3 w-full" disabled={pending} aria-busy={pending || undefined}>
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <OAuthButtons next={next} />
    </div>
  );
}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updatePassword, null);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <Field
        id="password"
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN}
        required
        error={fieldError(state, "password")}
        className="[&_input]:border-black-500"
      />
      <Field
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Repeat new password"
        autoComplete="new-password"
        required
        error={fieldError(state, "confirmPassword")}
        className="[&_input]:border-black-500"
      />
      <FormError state={state} />
      <Button type="submit" className="mt-3 w-full" disabled={pending} aria-busy={pending || undefined}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
