import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LogInForm } from "@/features/auth/components/auth-forms";
import { safeNextPath } from "@/features/auth/redirect";
import { getCurrentUser } from "@/features/auth/session";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

const CALLBACK_ERRORS: Record<string, string> = {
  link: "That sign-in link is invalid or has expired. Please try again.",
  provider: "Sign-in with that provider was cancelled or failed. Please try again.",
};

async function LogIn({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  if (await getCurrentUser()) redirect(next);

  const errorKey = typeof params.error === "string" ? params.error : undefined;
  return (
    <AuthCard active="login" next={next}>
      <LogInForm next={next} initialError={errorKey ? CALLBACK_ERRORS[errorKey] : undefined} />
    </AuthCard>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <Suspense fallback={<Skeleton className="container-site my-[100px] h-[656px] rounded-[32px]" />}>
      <LogIn {...props} />
    </Suspense>
  );
}
