"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  ArrowRight,
  Command as CommandIcon,
  Keyboard,
  Languages,
  Mail,
  Moon,
  Printer,
  Sun,
  User,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useI18n } from "@/lib/i18n";
import { useUiStore } from "@/lib/ui-store";
import { copyToClipboard } from "@/lib/clipboard";
import { profile, projects, resolveLocalized, type Project } from "@/lib/portfolio";
import { DiscordIcon, GithubIcon, TelegramIcon } from "./icons";

const SECTIONS = [
  { id: "hero", key: "nav.home" },
  { id: "projects", key: "nav.projects" },
  { id: "bio", key: "nav.bio" },
  { id: "testimonials", key: "nav.testimonials" },
  { id: "contact", key: "nav.contact" },
] as const;

/**
 * ⌘K / Ctrl+K command palette.
 * - jump to sections, open any project dialog, switch theme / language,
 *   copy email or open social profiles
 * - global hotkey is registered here; the header button uses the same store
 */
export function CommandPalette() {
  const { t, locale, toggleLocale } = useI18n();
  const { paletteOpen, setPaletteOpen, openProject, setShortcutsOpen } = useUiStore();
  const { theme, setTheme } = useTheme();

  /* global Ctrl+K / Cmd+K — registered on window so it works everywhere */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!useUiStore.getState().paletteOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPaletteOpen]);

  const go = (id: string) => {
    setPaletteOpen(false);
    /* wait a tick so the dialog unmounts before the smooth scroll starts */
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const openProjectFromPalette = (project: Project) => {
    /* closes the palette and opens the dialog via the shared store */
    openProject(project);
    requestAnimationFrame(() => {
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setPaletteOpen(false);
  };

  const switchLanguage = () => {
    toggleLocale();
    setPaletteOpen(false);
  };

  const copyEmail = async () => {
    const ok = await copyToClipboard(profile.socialLinks.email);
    if (ok) toast.success(t("toast.emailCopied"));
    setPaletteOpen(false);
  };

  const printResume = () => {
    setPaletteOpen(false);
    /* let the dialog unmount before the print preview renders */
    requestAnimationFrame(() => window.print());
  };

  const openShortcuts = () => {
    setPaletteOpen(false);
    /* small delay so the palette animation finishes first */
    requestAnimationFrame(() => setShortcutsOpen(true));
  };

  return (
    <CommandDialog
      open={paletteOpen}
      onOpenChange={setPaletteOpen}
      title={t("nav.openPalette")}
      description={t("palette.hint")}
      className="sm:max-w-lg [&_[cmdk-group-heading]]:text-primary/70"
    >
      <CommandInput placeholder={t("palette.placeholder")} />
      <CommandList className="max-h-[340px]">
        <CommandEmpty>{t("palette.empty")}</CommandEmpty>

        {/* navigation */}
        <CommandGroup heading={t("palette.sectionsGroup")}>
          {SECTIONS.map(({ id, key }, i) => (
            <CommandItem
              key={id}
              onSelect={() => go(id)}
              className="gap-2.5 rounded-lg"
            >
              <ArrowRight className="text-primary/70" aria-hidden="true" />
              {t(key)}
              <CommandShortcut>{`0${i + 1}`}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* projects */}
        <CommandGroup heading={t("palette.projectsGroup")}>
          {projects.map((p) => (
            <CommandItem
              key={p.id}
              value={`${p.title} ${p.tags.join(" ")}`}
              onSelect={() => openProjectFromPalette(p)}
              className="gap-2.5 rounded-lg"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-gradient-to-br from-violet-600 to-purple-700 text-[10px] font-bold text-white">
                {p.title.slice(0, 2).toUpperCase()}
              </span>
              <span className="truncate">{p.title}</span>
              <span className="ml-auto hidden truncate pl-2 text-xs text-muted-foreground sm:inline">
                {resolveLocalized(p.description, locale).slice(0, 42)}…
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* actions */}
        <CommandGroup heading={t("palette.actionsGroup")}>
          <CommandItem onSelect={toggleTheme} className="gap-2.5 rounded-lg">
            {theme === "dark" ? (
              <Sun className="text-amber-500" aria-hidden="true" />
            ) : (
              <Moon className="text-violet-500" aria-hidden="true" />
            )}
            {t("palette.toggleTheme")}
          </CommandItem>
          <CommandItem onSelect={switchLanguage} className="gap-2.5 rounded-lg">
            <Languages className="text-primary/70" aria-hidden="true" />
            {t("palette.switchLanguage")}
          </CommandItem>
          <CommandItem onSelect={copyEmail} className="gap-2.5 rounded-lg">
            <Mail className="text-primary/70" aria-hidden="true" />
            {t("palette.copyEmail")}
          </CommandItem>
          <CommandItem onSelect={printResume} className="gap-2.5 rounded-lg">
            <Printer className="text-primary/70" aria-hidden="true" />
            {t("palette.printResume")}
          </CommandItem>
          <CommandItem onSelect={openShortcuts} className="gap-2.5 rounded-lg">
            <Keyboard className="text-primary/70" aria-hidden="true" />
            {t("palette.shortcutsAction")}
            <CommandShortcut>?</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => window.open(profile.socialLinks.github, "_blank")}
            className="gap-2.5 rounded-lg"
          >
            <GithubIcon className="h-4 w-4 text-primary/70" aria-hidden="true" />
            {t("palette.openGithub")}
          </CommandItem>
          <CommandItem
            onSelect={() => window.open(`https://t.me/${profile.handle}`, "_blank")}
            className="gap-2.5 rounded-lg"
          >
            <TelegramIcon className="h-4 w-4 text-primary/70" aria-hidden="true" />
            {t("palette.openTelegram")}
          </CommandItem>
          <CommandItem
            onSelect={() =>
              window.open(
                `https://discord.com/users/${profile.socialLinks.discord.split("/").pop()}`,
                "_blank"
              )
            }
            className="gap-2.5 rounded-lg"
          >
            <DiscordIcon className="h-4 w-4 text-primary/70" aria-hidden="true" />
            {t("palette.openDiscord")}
          </CommandItem>
        </CommandGroup>

        {/* footer hint */}
        <div className="flex items-center justify-between border-t border-border/60 px-3 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CommandIcon className="h-3 w-3" aria-hidden="true" />
            {t("palette.hint")}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" aria-hidden="true" />
            {profile.name}
          </span>
        </div>
      </CommandList>
    </CommandDialog>
  );
}
