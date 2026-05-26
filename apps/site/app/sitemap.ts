import { MetadataRoute } from "next";
import { siteUrl } from "./data/site";

export const dynamic = "force-static";

const routes = [
  "",
  "/whitepaper",
  "/api-reference",
  "/mcp-reference",
  "/glossary",
  "/knowledge-graph",
  "/faq",
  "/lead",
  "/blog/agent-sla-context-layer",
  "/blog/ai-agent-sla-metrics",
  "/blog/mcp-agent-observability"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}/`,
    lastModified: new Date("2026-05-25")
  }));
}
