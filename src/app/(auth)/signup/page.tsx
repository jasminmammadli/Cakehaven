import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { AuthCard } from "@/features/auth/components/auth-card";
import { SignUpForm } from "@/features/auth/components/auth-forms";
import { safeNextPath } from "@/features/auth/redirect";
import { getCurrentUser } from "@/features/auth/session";

export const metadata: Metadata = { title: "Sign up", robots: { index: false } };

async function SignUp({ searchParams }: PageProps<"/signup">) {
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthCard active="signup" next={next}>
      <SignUpForm next={next} />
    </AuthCard>
  );
}

export default function SignUpPage(props: PageProps<"/signup">) {
  return (
    <Suspense fallback={<Skeleton className="container-site my-[60px] h-[725px] rounded-[32px]" />}>
      <SignUp {...props} />
    </Suspense>
  );
}
