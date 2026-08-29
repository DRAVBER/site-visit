#!/bin/bash
# Generates all portfolio images: avatar + project screenshots
set -u
cd /home/z/my-project

gen() {
  local prompt="$1"; local out="$2"; local size="${3:-1344x768}"
  if [ -s "$out" ]; then echo "SKIP $out (exists)"; return 0; fi
  for i in 1 2 3; do
    z-ai image -p "$prompt" -o "$out" -s "$size" && [ -s "$out" ] && { echo "OK $out"; return 0; }
    echo "retry $i for $out"; sleep 3
  done
  echo "FAIL $out"
}

gen "Digital avatar portrait of a young male software developer, stylized flat vector illustration, purple violet gradient background, minimal geometric style, short dark hair, friendly confident look, modern tech aesthetic, centered composition, high quality" \
  "public/images/profile/avatar.png" "1024x1024"

gen "Dark mode web analytics dashboard UI screenshot, violet purple accent line charts, live visitor counter cards, world map with traffic, clean modern SaaS interface, very dark navy background, professional UI design, high quality, crisp details" \
  "public/images/projects/nebula-analytics-1.png"

gen "Dark mode analytics web app settings page screenshot, custom report builder interface, violet purple accent buttons and toggles, data table, very dark background, modern clean SaaS UI design" \
  "public/images/projects/nebula-analytics-2.png"

gen "Modern SaaS landing page hero section screenshot, big bold typography with purple violet gradient text on dark background, glowing CTA button, subtle grid pattern, sleek professional web design, minimal, high quality" \
  "public/images/projects/lumen-kit-1.png"

gen "Modern SaaS landing page pricing section screenshot, three elegant pricing cards middle one highlighted with purple violet glow, dark theme, feature checkmarks, clean minimal web design, professional" \
  "public/images/projects/lumen-kit-2.png"

gen "Minimalist markdown note taking desktop app UI screenshot, dark mode, left sidebar with notes list, note editor with markdown preview pane, violet purple accents, clean typography, professional app design" \
  "public/images/projects/prism-notes-1.png"

gen "Encrypted file transfer desktop app UI screenshot, drag and drop zone with shield icon, file transfer progress list, dark theme with violet purple accents, modern minimal security app design, high quality" \
  "public/images/projects/vaultdrop-1.png"

gen "Terminal window screenshot of CLI deployment tool, colorful output with green success checkmarks and purple highlights, git push and release steps, monospace font on dark terminal background, developer aesthetic, high quality" \
  "public/images/projects/ship-it-1.png"

gen "Terminal window screenshot of Python CLI tool showing GitHub repository health report, markdown tables rendered in terminal, colorful status indicators, dark terminal theme, developer tools aesthetic" \
  "public/images/projects/repo-sweep-1.png"

gen "Neovim and tmux terminal setup screenshot, split panes with syntax highlighted TypeScript code, purple violet status bars, file tree, dark theme, beautiful Linux terminal rice aesthetic, high quality" \
  "public/images/projects/dotfiles-plus-1.png"

gen "Icon pack showcase grid of minimal geometric line icons in purple violet on dark background, design asset presentation, uniform grid of 240 small icons, gradient accents, professional design portfolio piece" \
  "public/images/projects/pixel-forge-1.png"

echo "ALL DONE"
