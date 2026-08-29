"use client";

/**
 * vCard 4.0 generator + download trigger.
 * Builds a standard .vcf file from profile.json data so visitors can save
 * the owner as a contact with one click — works in every address book app
 * (iOS/Android/macOS/Windows/Gmail).
 */
import { profile } from "./portfolio";

/** Escapes vCard special characters per RFC 6350 (§3.4). */
function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Builds a vCard 4.0 string from the shared profile data. */
export function buildVCard(): string {
  const name = profile.name;
  const [first = "", ...rest] = name.split(" ");
  const last = rest.join(" ");
  const role = profile.experience[0]?.role;
  const title =
    typeof role === "string" ? role : role ? `${role.en}` : "Independent Developer";
  const note =
    "Independent developer — web platforms, desktop software, CLI tools and open source.";
  const urls = [
    profile.socialLinks.github,
    profile.socialLinks.telegram,
    profile.socialLinks.discord,
  ];

  const lines = [
    "BEGIN:VCARD",
    "VERSION:4.0",
    `FN:${escapeVCard(name)}`,
    `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
    `TITLE:${escapeVCard(title)}`,
    `EMAIL;TYPE=WORK:${escapeVCard(profile.socialLinks.email)}`,
    `TZ:${escapeVCard(profile.timezone)}`,
    `NOTE:${escapeVCard(note)}`,
    ...urls.map((url) => `URL:${escapeVCard(url)}`),
    "END:VCARD",
  ];

  /* CRLF line endings per the vCard spec */
  return lines.join("\r\n") + "\r\n";
}

/** Generates the vCard and triggers a .vcf file download. */
export function downloadVCard(): void {
  const vcard = buildVCard();
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${profile.handle || "contact"}.vcf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  /* release the blob URL on the next tick */
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
