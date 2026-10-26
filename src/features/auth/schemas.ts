import { z } from "zod";

export const PASSWORD_MIN = 8;

const email = z.email("Enter a valid email address").trim().max(254);
const password = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters`)
  .max(72, "Use at most 72 characters");

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email,
  password,
  acceptPrivacy: z.literal(true, { error: "Please accept the privacy policy" }),
});

export const logInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const resetRequestSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const OAUTH_PROVIDERS = ["google", "facebook"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
