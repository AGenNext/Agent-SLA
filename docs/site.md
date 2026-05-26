# Next.js Site

The public documentation and marketing surface is implemented in `apps/site`
with Next.js App Router and static export.

## Pages

- `/`: product landing page
- `/blog/agent-sla-context-layer/`
- `/blog/ai-agent-sla-metrics/`
- `/blog/mcp-agent-observability/`
- `/whitepaper/`
- `/api-reference/`
- `/mcp-reference/`
- `/glossary/`
- `/knowledge-graph/`
- `/faq/`
- `/lead/`

## SEO

The site includes:

- per-page metadata;
- canonical URLs;
- Open Graph metadata;
- Schema.org JSON-LD for software, blogs, FAQ, and knowledge graph;
- generated `robots.txt`;
- generated `sitemap.xml`.

## Build

```bash
npm run build --workspace @agennext/agent-sla-site
```

For GitHub Pages:

```bash
GITHUB_PAGES=true npm run build --workspace @agennext/agent-sla-site
```

The exported site is written to `apps/site/out`.
