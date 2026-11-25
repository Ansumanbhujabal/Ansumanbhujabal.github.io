# Reading log operations

The URL-only issue form publishes a reading note after extraction, tests, and deployment. Copilot is optional; deterministic fallback works without a model token. Copilot requests use the account's plan and allowance.

1. Create a fine-grained personal token for this repository with account-level **Copilot Requests** permission.
2. Store it in Actions secrets as `COPILOT_GITHUB_TOKEN`.
3. Create repository labels `reading-link`, `processing`, `published`, `published-with-fallback`, `duplicate`, and `failed` before enabling the issue form.
4. Allow repository content writes in Actions settings.
5. Submit a controlled test URL; inspect the issue, Actions run, new Markdown file, and deployed page. Repeat with the secret temporarily removed to test fallback.
6. Submit `https://ansumanbhujabal.github.io/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
7. Inspect an entry URL, archive page, and a `noindex` fallback page in Search Console.
8. Remove test content through a normal reviewed commit after validation.

The nightly workflow retries up to ten fallback entries per run, at most three times per entry. A failed fetch leaves the existing note in place. Do not publish employer material or confidential links.
