"use client";

/**
 * Tiny UI store (zustand) shared by the command palette, header and the
 * projects section:
 *   - palette open/close (header button, Ctrl+K hotkey)
 *   - project dialog state (which project is open) — the palette can request
 *     a project from anywhere without prop-drilling or effect gymnastics
 *
 * Ephemeral UI state only — nothing is persisted.
 */
import { create } from "zustand";
import type { Project } from "./portfolio";

interface UiState {
  /** command palette open/closed */
  paletteOpen: boolean;
  /** project shown in the details dialog (null = closed) */
  selectedProject: Project | null;
  dialogOpen: boolean;

  setPaletteOpen: (open: boolean) => void;
  togglePalette: () => void;
  /** open a project dialog (used by cards and by the palette) */
  openProject: (project: Project) => void;
  closeDialog: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  paletteOpen: false,
  selectedProject: null,
  dialogOpen: false,

  setPaletteOpen: (open) => set({ paletteOpen: open }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),

  openProject: (project) =>
    set({ selectedProject: project, dialogOpen: true, paletteOpen: false }),

  closeDialog: () => set({ dialogOpen: false }),
}));
