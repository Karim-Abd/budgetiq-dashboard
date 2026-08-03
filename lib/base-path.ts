// The app is served under /dashboard (so it can live at budgetiq.org/dashboard
// behind the marketing site's proxy). next/link + next/navigation are basePath
// aware automatically; raw fetch() and window.location are NOT, so prefix those
// with apiPath().
export const BASE_PATH = "/dashboard";

export function apiPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
