"use client";

/**
 * Tiny UI store (zustand) shared by the command palette, header and the
 * projects section:
 *   - palette open/close (header button, Ctrl+K hotkey)
 *   - project dialog state (which project is open) — the palette can request
 *     a project from anywhere without prop-drilling or effect gymnastics
 *   - projects view mode (grid / list) persisted to localStorage
 */
import { create } from "zustand";
import type { Project } from "./portfolio";

export type ViewMode = "grid" | "list";
const VIEW_STORAGE_KEY = "portfolio-view";

interface UiState {
  /** command palette open/closed */
  paletteOpen: boolean;
  /** keyboard shortcuts help dialog open/closed */
  shortcutsOpen: boolean;
  /** project shown in the details dialog (null = closed) */
  selectedProject: Project | null;
  dialogOpen: boolean;
  /** projects layout — "grid" until hydrated from localStorage */
  viewMode: ViewMode;

  setPaletteOpen: (open: boolean) => void;
  togglePalette: () => void;
  setShortcutsOpen: (open: boolean) => void;
  /** open a project dialog (used by cards and by the palette) */
  openProject: (project: Project) => void;
  closeDialog: () => void;
  /** switch grid/list and persist the choice */
  setViewMode: (mode: ViewMode) => void;
  /** read the persisted choice once after mount (hydration-safe) */
  hydrateViewMode: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  paletteOpen: false,
  shortcutsOpen: false,
  selectedProject: null,
  dialogOpen: false,
  viewMode: "grid",

  setPaletteOpen: (open) => set({ paletteOpen: open }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
  setShortcutsOpen: (open) => set({ shortcutsOpen: open }),

  openProject: (project) =>
    set({ selectedProject: project, dialogOpen: true, paletteOpen: false }),

  closeDialog: () => set({ dialogOpen: false }),

  setViewMode: (mode) => {
    set({ viewMode: mode });
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      /* private mode */
    }
  },

  hydrateViewMode: () => {
    try {
      const saved = localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === "grid" || saved === "list") set({ viewMode: saved });
    } catch {
      /* private mode */
    }
  },
}));
