# Agents That Survive Contact With Production.

The source for [ansumanbhujabal.github.io](https://ansumanbhujabal.github.io) — a portfolio built the same way I build everything else: ship it, then attack it until it breaks, then fix it before anyone else finds the crack.

It is also, by a wide margin, the only personal site on the internet with a load-bearing Gawr Gura orange-justice dance in the theme toggle. That's not a joke, scroll down.

---

## What this actually is

A static Astro site. No framework runtime shipping to the browser, no client-side JavaScript beyond a theme toggle — which, as of the `feat/theme-toggle-dance` branch, now uses the View Transitions API to mask the light↔dark swap through a chroma-keyed silhouette of an anime girl dancing. She holds a pose, dances for about a second, then explodes outward and the theme is done. I did not need to build this. I wanted to.

Everything else is text, five shipped projects with real metrics, a career timeline that doesn't hide the stealth-startup gaps, a reading log with 44 books and 65 anime titles (yes, both counts are computed from the data at build time — no, I will not hardcode a number that goes stale the moment I finish a show), and a "log" section that updates whenever I actually read, build, or learn something, not on a schedule.

## Things that are uncomfortably true about this repo

- **117 tests, `vitest run`, all green, no exceptions.** One of them exists solely to assert that two specific books never render again, plus a regex guard against a stray page-number artifact that once snuck into the list. Another asserts the site's own JSON-LD doesn't leak an institution name. I test the copy as hard as I test the code.
- **Zero external scripts.** `page.test.ts` literally regex-matches the built HTML for `<script src=` and fails the build if it finds one. The one time I needed a raster image (the anime stickers), I self-hosted it rather than pull in an embed script — and had to get sign-off from myself, in the commit message, to loosen that rule for `<img>` specifically.
- **Every decorative sticker is a compressed, chroma-keyed, self-hosted GIF**, most under 200KB, none of them loaded via Tenor's embed. Nine times out of ten "I want the actual gif" and "no client-side JS" sound like a contradiction. They're not — you just have to do the work.
- **The reading section's title/anime counts are `.reduce()` calls, not integers typed into a template.** If I add a book, the number changes itself. This should not be a flex. It is one anyway.
- **Fonts are self-hosted `woff2` files, not a Google Fonts `<link>`.** Dark mode isn't `prefers-color-scheme`, it's an explicit toggle with `localStorage`, because I don't trust the OS to know what I want more than I do.

## Stack

Astro 5 (static output) · vanilla CSS with custom properties for theming · Zod-validated content collections for projects/timeline/log/reading data · Vitest for a test suite that builds the actual site and greps the actual HTML, not a component in isolation · deployed to GitHub Pages, auto-built from `main`.

## Running it

```bash
npm install
npm run dev       # localhost:4321, hot reload
npm run build     # static output to dist/
npm run test      # 117 tests, builds the site first — budget ~25s
npm run fetch     # refreshes cached GitHub/AniList/RSS data in data/cache/
```

No API keys required to run it locally. The live data (GitHub stats, AniList library, RSS reads) falls back to the last successful fetch if the network's unavailable — see `src/lib/cache.ts` if you're curious how that's tested (yes, the 429 case is tested too).

## What's shipped

| Project | What it does | The number that matters |
|---|---|---|
| [Polly Harness](https://github.com/Ansumanbhujabal/Polly_Harness) | Nine-layer refund agent built specifically to be attacked | 88.6% pass / 229 adversarial cases, 100% jailbreak resistance |
| [UltraDoc Intelligence](https://github.com/Ansumanbhujabal/ultradoc-intelligence-) | Hybrid retrieval over logistics/TMS documents | 91.9% accuracy at $0.003/query |
| [Mentis](https://github.com/Ansumanbhujabal/Mentis) | Procurement intel briefs for medical substances, every claim source-linked | Taken on by the client's own team post-PoC |
| [Pugmark](https://github.com/Ansumanbhujabal/Pugmarks) | Turns Jim Corbett/Kenneth Anderson hunting memoirs into illustrated bestiaries | 5-stage async pipeline, 3-provider LLM fallback chain |
| [Pulse](https://pulseldr.onrender.com/) | E2E encrypted wearable-first messaging | Security review found the verification phrase grindable at 2^36 — fixed with iterated hashing before it shipped |

Started with Polly Harness by breaking a café's AI reservation agent into refunding a booking it never should have. Everything downstream of that project is, in one way or another, still about the same question: what actually holds up once someone's trying to break it.

## Repo shape

```
src/
  components/     one .astro file per section — Hero, Timeline, WorkList, Reading, LogGrid, Cta...
  content/        projects/, timeline/, log/ — Zod-validated markdown collections
  data/           reading.ts (books + anime shelves), config.ts
  lib/            cache.ts, display.ts, project-art.ts — the boring-but-load-bearing utilities
  styles/         one global.css, no preprocessor, no Tailwind
public/           self-hosted fonts, resume, favicon, and seven (soon eight) anime GIFs
tests/            one file per concern, builds dist/ and asserts against the real HTML
```

## The part where I tell you not to steal this

There's no LICENSE file. That's on purpose, not an oversight — no LICENSE means all rights reserved by default, not "basically MIT." Read the code, borrow a pattern, tell me it's ugly — go ahead. Don't fork the whole thing and ship it as your own portfolio; we'll both know.

## Talk to me

Open to AI Engineer / AI Architect / AI Safety Engineer roles, remote or relocating. The site has a form-free `mailto:` link because contact forms are just another thing that can break, and I'd rather you just email me: **ansumanbhujabal1@gmail.com**. Happy to walk through any of the systems above — including the parts that failed.
