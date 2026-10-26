import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Figma "Profile" frames: 580px photo + 580px card with a 2px lilac border. */
export function AuthCard({
  active,
  next,
  children,
}: {
  active: "signup" | "login" | "reset";
  next?: string;
  children: ReactNode;
}) {
  const query = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="container-site grid flex-1 items-start gap-5 py-10 md:grid-cols-2 md:py-[60px] lg:py-[100px]">
      <div className="relative hidden h-full min-h-[656px] overflow-hidden rounded-[32px] md:block">
        <Image
          src="/images/auth.png"
          alt="Strawberry cupcakes on a pink tray"
          fill
          priority
          sizes="580px"
          className="object-cover object-[50%_60%]"
        />
      </div>
      <div className="rounded-[32px] border-2 border-lilac-700 px-5 py-10 md:px-[60px] md:py-[58px]">
        {active === "reset" ? (
          <h1 className="text-center text-body1 font-extrabold">Reset password</h1>
        ) : (
          <nav aria-label="Account" className="flex justify-center gap-14">
            {(
              [
                { key: "signup", label: "Sign up", href: `/signup${query}` },
                { key: "login", label: "Log in", href: `/login${query}` },
              ] as const
            ).map((tab) => {
              const selected = tab.key === active;
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "relative rounded-sm px-1 pb-1 text-body1 outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
                    selected
                      ? "font-extrabold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-lilac-700"
                      : "hover:text-lilac-900",
                  )}
                >
                  {selected ? <h1>{tab.label}</h1> : tab.label}
                </Link>
              );
            })}
          </nav>
        )}
        <div className="mx-auto mt-10 max-w-[460px]">{children}</div>
      </div>
    </div>
  );
}
