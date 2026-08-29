import { PortfolioApp } from "@/components/site/portfolio-app";
import { profile } from "@/lib/portfolio";

// TODO(owner): keep in sync with your production domain
const siteUrl = "https://alexvolkov.dev";

/**
 * JSON-LD Person schema — helps search engines show a rich result
 * (knowledge panel style) for the portfolio owner.
 */
function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.handle,
    url: siteUrl,
    image: `${siteUrl}${profile.avatarUrl}`,
    email: `mailto:${profile.socialLinks.email}`,
    jobTitle: "Independent Developer",
    description:
      "Independent developer: web platforms, desktop software, CLI tools and open source.",
    sameAs: [
      profile.socialLinks.github,
      profile.socialLinks.discord,
      profile.socialLinks.telegram,
    ].filter(Boolean),
    knowsAbout: profile.skills.flatMap((group) => group.items),
    address: { "@type": "PostalAddress", addressRegion: "Europe" },
  };
}

/**
 * Single-page portfolio. All content is driven by /data/*.json —
 * see README.md for how to add projects, categories or translations.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
      />
      <PortfolioApp />
    </>
  );
}
