import { notes, profile, resolveLocalized } from "@/lib/portfolio";

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
 * RSS 2.0 feed with the micro-blog notes — lets visitors subscribe to new
 * thoughts, releases, links and milestones in any reader. Fully data-driven:
 * every note from data/notes.json becomes an entry, so publishing a note is
 * just adding an entry to the JSON file.
 */
export async function GET() {
  const now = new Date().toUTCString();

  const items = notes
    .map((note) => {
      const link = note.url ?? `${siteUrl}/#notes`;
      const text = resolveLocalized(note.text, "en");
      const title = `${note.type}: ${text.slice(0, 80)}${text.length > 80 ? "…" : ""}`;
      return `    <item>
      <title>${esc(title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">${esc(`note-${note.id}`)}</guid>
      <description>${esc(text)}</description>
      <pubDate>${new Date(note.date).toUTCString()}</pubDate>
      <category>${esc(note.type)}</category>
${(note.tags ?? [])
  .map((tag) => `      <category>${esc(tag)}</category>`)
  .join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(profile.name)} — Notes</title>
    <link>${esc(siteUrl)}/#notes</link>
    <description>Micro-blog: thoughts, releases, reading links and milestones from an independent developer.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${esc(siteUrl)}/notes.xml" rel="self" type="application/rss+xml"/>
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
