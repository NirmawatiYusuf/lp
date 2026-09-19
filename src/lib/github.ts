import "server-only";

export function parseRepo(url: string) {
  try {
    const parsed = new URL(url);
    const [owner, repo, ...rest] = parsed.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/");
    if (parsed.protocol !== "https:" || parsed.hostname !== "github.com" || !owner || !repo || rest.length) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

export async function getRepoActivity(owner: string, repo: string) {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const options = { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(3000) };
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, options);
    if (!repoResponse.ok) return null;
    const repoData = (await repoResponse.json()) as { private?: boolean; pushed_at?: string };
    if (repoData.private || !repoData.pushed_at) return null;
    const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, options);
    if (!commitsResponse.ok) return null;
    const commitsData = (await commitsResponse.json()) as Array<{ commit?: { author?: { date?: string }; message?: string } }>;
    if (!Array.isArray(commitsData)) return null;
    return {
      pushedAt: repoData.pushed_at,
      commits: commitsData.flatMap((item) => {
        const date = item.commit?.author?.date;
        const message = item.commit?.message?.split("\n")[0].slice(0, 100);
        return date && message ? [{ date, message }] : [];
      }),
    };
  } catch {
    return null;
  }
}
