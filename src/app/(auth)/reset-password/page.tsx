import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/auth-forms";
import { getCurrentUser } from "@/features/auth/session";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

// Reached from the password-reset email via /auth/callback, which signs the user in.
async function ResetPassword() {
  const user = await getCurrentUser();

  return (
    <AuthCard active="reset">
      {user ? (
        <ResetPasswordForm />
      ) : (
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-body1 text-black-400">
            This reset link has expired or was already used. Request a new one from the log-in page.
          </p>
          <Link href="/login" className={buttonVariants({ size: "md" })}>
            Back to log in
          </Link>
        </div>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="container-site my-[100px] h-[500px] rounded-[32px]" />}>
      <ResetPassword />
    </Suspense>
  );
}
