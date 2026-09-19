import { formatDate } from "@/lib/utils";
import { getRepoActivity, parseRepo } from "@/lib/github";

export async function RepoActivity({ url }: { url: string }) {
  const repo = parseRepo(url);
  if (!repo) return null;
  const activity = await getRepoActivity(repo.owner, repo.repo);
  if (!activity) return null;
  return <section className="project-section">
    <p>Terakhir dikerjakan {formatDate(activity.pushedAt)}</p>
    {activity.commits.map((commit) => <div className="meta" key={`${commit.date}-${commit.message}`}>
      <time dateTime={commit.date}>{new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(commit.date))}</time>{"  "}{commit.message}
    </div>)}
  </section>;
}
