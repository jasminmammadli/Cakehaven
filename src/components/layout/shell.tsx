import { Suspense, type ReactNode } from "react";

import { ViewerProvider } from "@/features/auth/viewer-context";
import { ViewerLoader } from "@/features/auth/viewer-loader";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Page chrome shared by the shop and auth route groups. */
export function Shell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return (
    <ViewerProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-pill bg-white px-5 py-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:ring-3 focus:ring-ring"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      {footer && <SiteFooter />}
      <Suspense fallback={null}>
        <ViewerLoader />
      </Suspense>
    </ViewerProvider>
  );
}
