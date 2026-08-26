#!/usr/bin/env bash
set -euo pipefail
mkdir -p public/fonts
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"

# Unica One (Google Fonts, SIL OFL)
# Google returns one @font-face block per unicode-range subset (vietnamese,
# latin-ext, latin, ...). Grabbing the first match blindly can pick a
# non-"latin" subset that lacks basic ASCII glyphs, since we self-host a
# single file with no unicode-range restriction. Select the "/* latin */"
# block explicitly so the shipped file covers plain English text.
curl -sL -A "$UA" "https://fonts.googleapis.com/css2?family=Unica+One&display=swap" \
  | grep -A6 '^/\* latin \*/$' | grep -oE 'https://[^)]+\.woff2' | head -1 \
  | xargs -I{} curl -sL -o public/fonts/unica-one-400.woff2 {}

# Supreme (Fontshare, free for personal and commercial use)
# Fontshare now serves protocol-relative URLs (//cdn.fontshare.com/...)
# instead of https://, so the original https://-anchored grep matched
# nothing. Match the protocol-relative form and prepend the scheme.
# Also: don't sort the extracted URLs (sort -u shuffles them
# alphabetically by hash, decoupling them from the 400/500/700 order the
# request was made in) - keep them in document order, which matches the
# `supreme@400,500,700` request order.
curl -sL -A "$UA" "https://api.fontshare.com/v2/css?f%5B%5D=supreme@400,500,700&display=swap" \
  | grep -oE "//[^)']+\.woff2" | head -3 \
  | nl -w1 -s' ' | while read -r i url; do
      case $i in 1) w=400;; 2) w=500;; 3) w=700;; esac
      curl -sL -o "public/fonts/supreme-$w.woff2" "https:$url"
    done

ls -l public/fonts
