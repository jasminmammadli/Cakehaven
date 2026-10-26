import { getViewerState } from "./viewer";
import { ViewerHydrator } from "./viewer-context";

/** Must be rendered inside <Suspense>: it reads the session and basket cookies. */
export async function ViewerLoader() {
  const state = await getViewerState();
  return <ViewerHydrator state={state} />;
}
