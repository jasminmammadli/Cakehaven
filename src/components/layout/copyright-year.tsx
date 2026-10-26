import { cacheLife } from "next/cache";

/** Reading the clock during prerender must happen inside a cache scope. */
export async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
