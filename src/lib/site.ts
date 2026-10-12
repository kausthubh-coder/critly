// Forks can point the site, skill and llms.txt links at their own deployment
// and repo without touching code. Unset, they fall back to Critly's.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://critly.vercel.app";
export const SITE_NAME = "Critly";
export const SITE_DESCRIPTION =
  "Design engineering concepts for people building with AI agents.";
export const GITHUB_REPO =
  process.env.NEXT_PUBLIC_GITHUB_REPO ?? "kausthubh-coder/critly";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

export function githubSourceUrl(sourcePath?: string) {
  if (!sourcePath) return GITHUB_URL;
  return `${GITHUB_URL}/blob/main/content/${sourcePath}`;
}
