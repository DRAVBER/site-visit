import { projects, profile, resolveLocalized } from "@/lib/portfolio";

// TODO(owner): keep in sync with your production domain
const siteUrl = "https://alexvolkov.dev";

export const dynamic = "force-static";

/** XML-escape a string for safe embedding into the feed. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS 2.0 feed with the project list — lets visitors subscribe to new work
 * in any reader. Items are stable and content-driven: every project from
 * data/projects.json becomes an entry, so adding a project publishes it.
 */
export async function GET() {
  const now = new Date().toUTCString();

  const items = projects
    .map((p) => {
      const link = `${siteUrl}/#p=${p.id}`;
      const description = resolveLocalized(p.description, "en");
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <description>${esc(description)}</description>
      <pubDate>${new Date(p.lastCommit).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
${p.tags.map((tag) => `      <category>${esc(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(profile.name)} — Projects</title>
    <link>${esc(siteUrl)}</link>
    <description>Independent developer: web platforms, desktop software, CLI tools and open source.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${esc(siteUrl)}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
