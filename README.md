# Cloudflare temporary domain page

A static Cloudflare Workers page for one or more parked domains. The public repository only contains safe template configuration; real domains, contact addresses, and deployment routes live in ignored local files.

## Configuration layout

- `wrangler.example.jsonc`: public template for Cloudflare Workers.
- `wrangler.jsonc`: local deployment config. It is ignored by Git, and Wrangler reads it by default.
- `public/site-config.js`: public safe defaults used by the template page.
- `public/site-config.local.js`: local page override. It is ignored by Git and loaded after `site-config.js` when present.

## First-time setup

```bash
npm install
cp wrangler.example.jsonc wrangler.jsonc
cp public/site-config.js public/site-config.local.js
```

Put real Cloudflare Custom Domains only in `wrangler.jsonc`:

```jsonc
"routes": [
  { "pattern": "example.com", "custom_domain": true },
  { "pattern": "www.example.com", "custom_domain": true }
]
```

Put real page copy, contact email, and domain profiles only in `public/site-config.local.js`.

The committed `wrangler.example.jsonc` intentionally omits `routes` so the template can deploy to a `workers.dev` URL. Add custom domain routes only to your local `wrangler.jsonc`.

## Local preview

```bash
npm run dev
```

Preview a specific configured domain and language:

```text
http://localhost:8787/?domain=example.com&lang=en
http://localhost:8787/?domain=example.com&lang=zh
```

## Deploy

```bash
npm run deploy
```

Because `wrangler.jsonc` keeps its default name, local `npm run dev` and `npm run deploy` continue to use the private local deployment config without extra flags.

## Public repository hygiene

Before pushing to a public remote, verify that only template data is tracked:

```bash
git grep -n "real-domain.example\\|private-email@example.com"
git log --all -p -- . ":(exclude)package-lock.json"
```

The `.gitignore` file excludes local deployment/configuration files and local task state.

References:

- Workers Static Assets: https://developers.cloudflare.com/workers/static-assets/
- Workers Custom Domains: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
