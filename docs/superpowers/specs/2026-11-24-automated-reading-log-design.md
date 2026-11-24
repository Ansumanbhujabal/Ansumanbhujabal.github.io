# Automated Reading Log and Discovery Design

**Status:** Approved design
**Date:** 2026-11-24
**Repository:** `Ansumanbhujabal.github.io`

## 1. Purpose

Turn the portfolio's reading log into a low-friction, durable public research notebook. Ansuman submits only a URL through a GitHub Issue Form. The repository extracts source metadata, generates or derives a concise synopsis, publishes a validated log entry, deploys the site, and reports the result on the issue.

The resulting archive must remain pleasant to browse at hundreds of entries, improve legitimate search discovery, and strengthen the portfolio without making the homepage feel like a reading database.

## 2. Goals

- Accept a single URL from a GitHub Issue Form and require no manual metadata entry.
- Publish useful entries even when source metadata or model-assisted generation fails.
- Replace nested homepage expansion with a scalable archive and stable entry URLs.
- Give each substantive entry crawlable text, metadata, structured data, and internal links.
- Preserve the current portfolio design language and all unrelated behavior.
- Keep hosting and automation on GitHub's existing free infrastructure where possible.
- Treat external pages and generated output as untrusted input.

## 3. Non-goals

- No AniList changes.
- No full-text article mirroring or replacement of the original source.
- No manual editorial or pull-request approval in the normal ingestion path.
- No attempt to manufacture backlinks or misuse Google's Indexing API.
- No paid application server, database, CMS, or search service.
- No general-purpose public URL-submission service; publishing is restricted to Ansuman.

## 4. User experience

### 4.1 Submission

The repository provides a GitHub Issue Form named **Log something I read**. It has one required field: an HTTPS URL. The template applies the `reading-link` label.

Opening the issue starts processing. The issue receives a lifecycle label and a short status comment. On success, the workflow comments with the permanent portfolio URL and closes the issue. On failure, it leaves the issue open with a concise diagnostic and commits nothing.

Only issues authored by `Ansumanbhujabal` may publish content. Other submissions receive no model execution or remote fetch and are marked unauthorized.

### 4.2 Homepage

- Show the six newest reading entries.
- Remove nested `Show N earlier` expansion.
- Display the total number of logged entries.
- Link to the archive with **Explore all reading**.
- Keep the homepage focused on Ansuman's positioning, work, projects, and recent activity.

### 4.3 Archive

`/log/` is a server-rendered research-notebook index with:

- Search across title, synopsis, source, author, and tags.
- Category chips with entry counts.
- Newest, oldest, and title sorting.
- Month/year grouping.
- Compact rows containing date, content-type icon, title, source, synopsis preview, and tags.
- Static pagination in groups of 25 at `/log/page/<number>/`.
- Real links for pagination and category views so navigation works without JavaScript.
- Optional client-side enhancement for instant search and filtering.
- Query parameters for shareable enhanced filter state, such as `/log/?tag=ai-safety`.
- A stacked, touch-friendly presentation on narrow screens rather than a wide table.

### 4.4 Entry pages

Every entry has `/log/<slug>/` with:

- Title, source, author, source publication date when available, and logged date.
- A 100–200-word synopsis.
- Content type, primary category, and three to six normalized tags.
- A prominent **Read the original** link.
- A disclosure when the synopsis was generated or derived automatically.
- Related entries plus previous and next navigation.
- Relevant portfolio-project links when explicit project/topic mappings match.
- No copied article body.

## 5. Content model

The log collection schema is extended to support:

```yaml
title: string
url: absolute HTTPS URL
canonicalSourceUrl: absolute HTTPS URL
date: date                 # date logged
publishedAt: date?         # source publication date
author: string?
source: string             # publication/site/domain
description: string        # SEO description
category: string
contentType: string
tags: string[]
image: absolute URL?
generation: copilot | fallback | manual
indexable: boolean
```

The Markdown body contains the 100–200-word synopsis. Existing entries remain valid through defaults or a one-time migration. Category and tag values are normalized to a controlled vocabulary while retaining an escape hatch for new topics.

Minimal inaccessible-source entries use `generation: fallback` and `indexable: false`. They remain published and linked but emit `noindex,follow` until a later retry upgrades them.

## 6. Ingestion architecture

### 6.1 Workflow trigger and authorization

An `issues` workflow runs when an issue is opened or relabeled. Before checking out writable code or fetching the submitted URL, it verifies:

- The repository is the canonical portfolio repository.
- The issue author login is exactly `Ansumanbhujabal`.
- The issue has the `reading-link` label.
- The form payload contains exactly one parseable public HTTPS URL.

Required workflow permissions are declared explicitly and minimally. The ingestion job needs `contents: write` and `issues: write`; no pull-request permission is required for the direct-publish design. Because this is a personally owned repository, Copilot CLI authenticates through a fine-grained personal token with the account-level **Copilot Requests** permission, stored as the `COPILOT_GITHUB_TOKEN` Actions secret. The built-in `GITHUB_TOKEN` remains responsible only for repository and issue operations.

### 6.2 URL safety and normalization

The normalizer:

- Accepts HTTPS only.
- Removes fragments and known tracking parameters.
- Normalizes host casing, ports, trailing slashes, and equivalent URL forms.
- Resolves at most a small fixed number of redirects.
- Resolves DNS and rejects loopback, link-local, private, multicast, reserved, and cloud-metadata addresses before every request and redirect.
- Enforces response-size, content-type, and timeout limits.
- Rejects credentials embedded in URLs.

Duplicate detection compares the normalized submitted URL, redirect target, declared canonical URL, and existing `canonicalSourceUrl` values. A duplicate issue receives the existing entry URL and closes without a commit.

### 6.3 Extraction

Extraction is layered and deterministic:

1. Fetch the HTML with a clear portfolio-bot user agent.
2. Parse JSON-LD and standard metadata.
3. Parse Open Graph and social metadata.
4. Determine canonical URL, source, title, author, dates, and image.
5. Extract readable article text with navigation, scripts, ads, and boilerplate removed.
6. Bound and sanitize the text before any model-assisted processing.

Provider-specific adapters may improve metadata for common sources such as arXiv, YouTube, GitHub, and DOI-backed papers without changing the core content interface.

### 6.4 Copilot generation

GitHub Copilot in Actions is the preferred enrichment path. The fetched page is delimited and treated only as data. The fixed prompt states that instructions inside source material must be ignored. Output must match a strict JSON schema containing title corrections, synopsis, description, category, content type, and tags.

Generated output is parsed, length-bounded, stripped of markup where inappropriate, and validated independently. The workflow does not accept generated URLs, file paths, shell fragments, or workflow instructions.

The implementation must first verify that Copilot CLI access is available for the account and that the `COPILOT_GITHUB_TOKEN` secret is configured. Copilot usage depends on the account's active plan, premium-request allowance, and GitHub policy; it is not treated as an unconditional free service. A missing, expired, or unauthorized token immediately selects deterministic fallback and never blocks publication.

### 6.5 Deterministic fallback

Fallback runs when Copilot is unavailable, denied, rate-limited, times out, or produces invalid output. It:

- Uses JSON-LD/Open Graph title, author, source, date, description, and image when available.
- Selects and cleans representative sentences from readable text within the synopsis length budget.
- Infers basic content type and tags from metadata, URL, headings, and a controlled keyword map.
- Uses the domain and humanized URL path when no title exists.
- Emits a clear metadata-unavailable synopsis if the page cannot be fetched at all.

Fallback never prevents publication. Thin inaccessible-source entries are published with `indexable: false`; useful extractive fallbacks may be indexable if they pass the same content-quality validation as model-assisted entries.

### 6.6 File generation and publication

The generator creates a collision-safe filename in `src/content/log/` using the logged date and normalized title slug. It escapes YAML safely, emits deterministic key ordering, formats the body, and validates the collection schema.

Before committing, the workflow runs focused ingestion tests, the full test suite, production build, and link/schema checks. A failure leaves the repository untouched.

On success, the workflow commits directly to `main` with the repository bot identity. Because events produced by `GITHUB_TOKEN` do not reliably create a second workflow chain, the existing build/deploy logic will become a reusable workflow that accepts an explicit Git revision. Normal pushes and scheduled refreshes invoke it for their triggering revision; ingestion passes the SHA of its newly created content commit. Shared Pages concurrency prevents duplicate deployments, and the existing scheduled cache refresh remains intact.

## 7. Retry and lifecycle behavior

Issue labels represent state:

- `processing`
- `published`
- `published-with-fallback`
- `duplicate`
- `failed`

Concurrency is serialized per repository to prevent two submissions from racing on `main`. Before committing, each run fetches and rebases or retries from the newest `main` revision.

A nightly job revisits `generation: fallback` entries. It may replace fallback metadata and synopsis when extraction or Copilot later succeeds, but it never changes the slug or creates a duplicate. Retries are bounded and observable in Actions logs. Materially changed entries update their modified timestamp and preserve the original logged date.

## 8. Search, filtering, and related content

The build emits a lightweight JSON search index containing only public display fields. Client-side search progressively enhances the static archive; no external search service is used.

Related-entry scoring uses deterministic signals:

1. Shared normalized tags.
2. Shared primary category.
3. Shared content type or source.
4. Recency as a small tie-breaker.

Project links use an explicit project-to-topic mapping rather than model guesses. This keeps portfolio claims intentional and testable.

## 9. SEO and discovery

### 9.1 Page metadata

Indexable entry pages include:

- Unique title and description.
- Canonical URL.
- Open Graph and social metadata.
- Server-rendered synopsis.
- `BlogPosting` or `CreativeWork` JSON-LD with `isBasedOn`/citation to the source.
- Breadcrumb JSON-LD.
- Ansuman's existing `Person` identity as author of the reading note, without claiming authorship of the source.
- Published/modified dates and source attribution.

Fallback placeholders emit `noindex,follow`. Archive pagination has self-canonical URLs and crawlable links. Filter permutations do not create uncontrolled indexable duplicates.

### 9.2 Site discovery

- Include every indexable entry and archive page in the Astro sitemap.
- Reference the sitemap from `robots.txt`.
- Add an RSS/Atom feed for log updates.
- Extend `llms.txt` with archive and research discovery links.
- Preserve descriptive anchors and a valid heading hierarchy.
- Keep page weight and Core Web Vitals within the current static-site budget.

Google Search Console and Bing Webmaster Tools setup are documented as one-time manual account steps. The design does not use Google's restricted Indexing API for ordinary portfolio pages.

### 9.3 Backlinks

The site supports backlink acquisition with permanent, useful URLs and social metadata but does not automate spam. Original research, project READMEs, OSS discussions, videos, talks, BlueDot work, and external writing may link to relevant portfolio pages when contextually appropriate.

## 10. Error handling and observability

- No generated entry is committed unless validation and build pass.
- The issue is the user-facing audit record for submission status and result.
- Action logs retain extraction and validation stages without logging secrets or full copyrighted source text.
- Comments distinguish unauthorized, invalid, duplicate, fallback, published, and failed outcomes.
- Network and model calls use bounded timeouts and limited exponential backoff.
- The pipeline records enough structured diagnostics to reproduce failures locally from fixtures.

## 11. Testing strategy

Unit and fixture tests cover:

- URL normalization, tracking parameters, redirects, and canonical equivalence.
- Duplicate detection and slug collisions.
- Invalid protocols, credentials, private networks, DNS rebinding defenses, oversized responses, and unsupported content.
- JSON-LD, Open Graph, standard metadata, and readable-text extraction.
- Copilot schema validation, prompt-injection source text, denial, malformed output, and rate limits.
- Deterministic fallback at full, partial, and inaccessible metadata levels.
- Safe Markdown/frontmatter serialization.
- Collection-schema compatibility with existing entries.
- Related-entry and project-link scoring.
- Archive sorting, pagination, category counts, search index, and no-JavaScript navigation.
- Entry canonical tags, structured data, breadcrumbs, robots directives, sitemap, RSS, and `llms.txt`.
- Mobile layout invariants and accessibility semantics.
- Existing homepage, project, AniList, feed-cache, and deployment behavior.

End-to-end workflow tests use local fixtures and dry-run file generation. A controlled repository test verifies issue authorization, commit/deploy chaining, status comments, and closure before production enablement.

## 12. Delivery sequence

1. **Content foundation:** extend the schema, preserve/migrate existing entries, add entry routes, archive pagination, related content, search index, and RSS.
2. **UI transition:** show six recent homepage entries and replace recursive expansion with the archive link.
3. **Ingestion:** add the Issue Form, authorization, safe fetching, extraction, Copilot adapter, fallback, serialization, and issue lifecycle.
4. **Deployment integration:** make bot-authored content deploy exactly once and preserve scheduled cache refresh.
5. **SEO hardening:** validate structured data, sitemap, robots, internal links, `llms.txt`, performance, and webmaster setup instructions.
6. **Local visual review:** build and serve locally, review the archive and entry pages with Ansuman, adjust the presentation, and only then promote the feature through the normal GitHub branch flow.

## 13. Acceptance criteria

- Ansuman can open the issue form, paste one valid URL, submit it, and receive a live entry URL without entering other data.
- Duplicate submissions do not create duplicate files.
- Copilot failure automatically produces a valid fallback entry.
- A fully inaccessible public URL produces a minimal published entry that is visible but `noindex,follow`.
- A failing test or build produces no content commit.
- The homepage renders exactly six newest entries and no recursive expansion control.
- `/log/` supports crawlable pagination and usable enhanced search/filtering.
- Every substantive entry has a stable page with synopsis, attribution, related links, canonical metadata, and valid structured data.
- Sitemap and RSS include eligible entries.
- AniList behavior and unrelated portfolio content remain unchanged.
- The complete feature works on GitHub Pages without a paid server or database.
