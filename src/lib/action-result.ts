import type { z } from "zod";

export type ActionError = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Lets the UI offer a "Log in" action instead of a generic error. */
  code?: "auth_required";
};

export type ActionResult<T = undefined> = ({ ok: true } & (T extends undefined ? object : { data: T })) | ActionError;

export function invalidInput(error: z.ZodError, message = "Please check the highlighted fields."): ActionError {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { ok: false, error: message, fieldErrors };
}

export function authRequired(): ActionError {
  return { ok: false, error: "Please log in to continue.", code: "auth_required" };
}
