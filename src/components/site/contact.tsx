"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Check, Copy, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { copyToClipboard } from "@/lib/clipboard";
import { downloadVCard } from "@/lib/vcard";
import { profile } from "@/lib/portfolio";
import { SectionHeading } from "./section-heading";
import { DiscordIcon, GithubIcon, TelegramIcon } from "./icons";

const card: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

/** Contact section — social link cards (GitHub / Discord / Telegram) + email. */
export function ContactSection() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const links = [
    {
      href: profile.socialLinks.github,
      label: t("contact.github"),
      desc: t("contact.githubDesc"),
      icon: GithubIcon,
      handle: `DRAVBER`,
    },
    {
      href: profile.socialLinks.discord,
      label: t("contact.discord"),
      desc: t("contact.discordDesc"),
      icon: DiscordIcon,
      handle: `addsme`,
    },
    {
      href: profile.socialLinks.telegram,
      label: t("contact.telegram"),
      desc: t("contact.telegramDesc"),
      icon: TelegramIcon,
      handle: `t.me/@xDRAVBER`,
    },
  ];

  const copyEmail = async () => {
    const ok = await copyToClipboard(profile.socialLinks.email);
    if (ok) {
      setCopied(true);
      toast.success(t("toast.emailCopied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveContact = () => {
    try {
      downloadVCard();
      toast.success(t("toast.vcardSaved"));
    } catch {
      toast.error(t("toast.vcardFailed"));
    }
  };

  return (
    <section
      id="contact"
      aria-label={t("contact.title")}
      className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      {/* glow */}
      <div
        aria-hidden="true"
        className="animate-aurora pointer-events-none absolute bottom-0 left-1/2 h-[380px] w-[640px] -translate-x-1/2 rounded-full bg-violet-600/12 blur-[130px] print:hidden dark:bg-violet-700/20"
      />

      <div className="relative mx-auto max-w-5xl">
        <SectionHeading
          id="contact"
          number="06"
          title={t("contact.title")}
          subtitle={t("contact.subtitle")}
        />

        {/* social cards */}
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {links.map(({ href, label, desc, icon: Icon, handle }, i) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_20px_50px_-16px_rgba(139,92,246,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* hover gradient wash */}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.7)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Icon className="h-6 w-6" />
              </span>
              <span className="relative text-lg font-semibold tracking-tight">
                {label}
              </span>
              <span className="relative text-sm leading-snug text-muted-foreground">
                {desc}
              </span>
              <span className="relative font-mono text-xs text-primary/80">
                {handle}
              </span>
            </motion.a>
          ))}
        </div>

        {/* email card */}
        <motion.button
          type="button"
          onClick={copyEmail}
          variants={card}
          custom={3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="group mt-4 flex w-full flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center transition-all duration-300 hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mt-5 sm:flex-row sm:text-left"
        >
          <span className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-110">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold">{t("contact.email")}</span>
              <span className="block text-sm text-muted-foreground">
                {profile.socialLinks.email} · {t("contact.emailDesc")}
              </span>
            </span>
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
              copied
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border bg-background text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {t("contact.copied")}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                {t("contact.copyEmail")}
              </>
            )}
          </span>
          <span className="sr-only" role="status">
            {copied ? t("contact.copied") : ""}
          </span>
        </motion.button>

        {/* vCard — save the owner to the address book in one click */}
        <motion.button
          type="button"
          onClick={saveContact}
          variants={card}
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="group mt-4 flex w-full flex-col items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_16px_40px_-18px_rgba(139,92,246,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:text-left print:hidden"
        >
          <span className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.7)] transition-transform duration-300 group-hover:scale-110">
              <UserPlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold">{t("contact.saveContact")}</span>
              <span className="block text-sm text-muted-foreground">
                {t("contact.vcardDesc")}
              </span>
            </span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 font-mono text-xs font-semibold text-muted-foreground transition-all group-hover:border-primary/50 group-hover:text-primary">
            {profile.handle}.vcf
          </span>
        </motion.button>
      </div>
    </section>
  );
}
