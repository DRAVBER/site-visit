import { NextRequest, NextResponse } from "next/server";
import { projects } from "@/lib/portfolio";

/**
 * GET /api/github?ids=nebula-analytics,lumen-kit
 *
 * Enriches projects with live GitHub metadata (stars, last commit, language,
 * description). Responses from api.github.com are cached for an hour
 * (Next.js fetch revalidate) to stay well below rate limits. If a repo (or
 * the whole API) is unreachable, the route simply omits that entry and the
 * client keeps the fallback values from data/projects.json.
 *
 * Optional: set GITHUB_TOKEN in .env to raise the rate limit to 5000/h.
 */
export const revalidate = 3600;

interface RepoMeta {
  stars?: number;
  lastCommit?: string;
  language?: string;
  description?: string;
}

function parseOwnerRepo(githubUrl: string): { owner: string; repo: string } | null {
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/);
  return match ? { owner: match[1], repo: match[2].replace(/\.git$/, "") } : null;
}

async function fetchRepo(owner: string, repo: string): Promise<RepoMeta | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // hard timeout so a blocked network can't stall the request
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      stargazers_count?: number;
      pushed_at?: string;
      language?: string;
      description?: string;
    };
    return {
      stars: data.stargazers_count,
      lastCommit: data.pushed_at,
      language: data.language ?? undefined,
      description: data.description ?? undefined,
    };
  } catch {
    return null; // offline / rate-limited / timeout → fallback
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean);
  const targets = ids ? projects.filter((p) => ids.includes(p.id)) : projects;

  const results = await Promise.allSettled(
    targets.map(async (project) => {
      const parsed = parseOwnerRepo(project.githubUrl);
      const meta = parsed ? await fetchRepo(parsed.owner, parsed.repo) : null;
      return [project.id, meta] as const;
    })
  );

  const payload: Record<string, RepoMeta> = {};
  for (const result of results) {
    if (result.status === "fulfilled" && result.value[1]) {
      payload[result.value[0]] = result.value[1];
    }
  }

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
