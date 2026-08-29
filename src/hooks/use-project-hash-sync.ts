"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/portfolio";
import { useUiStore } from "@/lib/ui-store";

/**
 * Two-way sync between the project dialog state and the URL hash:
 *
 *   `#p=<projectId>`  →  opens that project's dialog (deep-link / shareable)
 *
 * - on mount: parses the hash and, if it references a real project, opens
 *   the dialog (without pushing a new history entry — replaceState only)
 * - when the dialog opens/closes: the hash is written/cleared via
 *   replaceState (so back-button keeps working as a single logical page)
 * - external `hashchange` events (back/forward, manual edits) sync the
 *   dialog to match — handy for power users
 *
 * Stale hashes pointing at unknown project ids are silently cleared.
 */
export function useProjectHashSync(projects: Project[]) {
  const openProject = useUiStore((s) => s.openProject);
  const closeDialog = useUiStore((s) => s.closeDialog);
  const dialogOpen = useUiStore((s) => s.dialogOpen);
  const selected = useUiStore((s) => s.selectedProject);

  /** skip the first run of the write effect so the mount parse wins */
  const firstRun = useRef(true);

  /** parse hash → open the referenced project on first mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const match = /^#p=([\w-]+)$/.exec(window.location.hash);
    if (!match) return;
    const target = projects.find((p) => p.id === match[1]);
    if (target && !useUiStore.getState().dialogOpen) {
      openProject(target);
    } else if (!target) {
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
  }, [projects]);

  /** write hash to match the open dialog (skip the very first render) */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    if (dialogOpen && selected) {
      const desired = `#p=${selected.id}`;
      if (window.location.hash !== desired) {
        window.history.replaceState(null, "", desired);
      }
    } else if (window.location.hash.startsWith("#p=")) {
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
  }, [dialogOpen, selected]);

  /** react to external hash changes (back/forward, manual edits) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashChange = () => {
      const match = /^#p=([\w-]+)$/.exec(window.location.hash);
      const state = useUiStore.getState();
      if (match) {
        const target = projects.find((p) => p.id === match[1]);
        if (target && !state.dialogOpen) openProject(target);
        else if (!target && state.dialogOpen) closeDialog();
      } else if (state.dialogOpen) {
        closeDialog();
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [projects, openProject, closeDialog]);
}
