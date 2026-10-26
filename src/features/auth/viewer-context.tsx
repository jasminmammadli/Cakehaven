"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import type { ViewerState } from "./viewer";

type ViewerContextValue = {
  /** null while the per-visitor state is still streaming in. */
  viewer: ViewerState | null;
  hydrate: (state: ViewerState) => void;
  setBasketCount: (count: number) => void;
  setFavorite: (productId: string, favorited: boolean) => void;
};

const ViewerContext = createContext<ViewerContextValue | null>(null);

/**
 * Holds per-visitor state (user, basket count, favourites) on the client so
 * cached, prerendered pages can show personalised bits without becoming dynamic.
 */
export function ViewerProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  const hydrate = useCallback((state: ViewerState) => setViewer(state), []);
  const setBasketCount = useCallback(
    (count: number) => setViewer((prev) => (prev ? { ...prev, basketCount: count } : prev)),
    [],
  );
  const setFavorite = useCallback((productId: string, favorited: boolean) => {
    setViewer((prev) => {
      if (!prev) return prev;
      const ids = new Set(prev.favoriteIds);
      if (favorited) ids.add(productId);
      else ids.delete(productId);
      return { ...prev, favoriteIds: [...ids] };
    });
  }, []);

  const value = useMemo(
    () => ({ viewer, hydrate, setBasketCount, setFavorite }),
    [viewer, hydrate, setBasketCount, setFavorite],
  );

  return <ViewerContext value={value}>{children}</ViewerContext>;
}

/** Rendered by the server inside <Suspense>; pushes fresh state into the provider. */
export function ViewerHydrator({ state }: { state: ViewerState }) {
  const { hydrate } = useViewerContext();
  useEffect(() => hydrate(state), [hydrate, state]);
  return null;
}

export function useViewerContext(): ViewerContextValue {
  const context = use(ViewerContext);
  if (!context) throw new Error("useViewerContext must be used inside <ViewerProvider>");
  return context;
}
