import { siteUrl } from "../data/site";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "Agent-SLA",
    url: siteUrl,
    codeRepository: "https://github.com/AGenNext/Agent-SLA",
    programmingLanguage: ["TypeScript", "Python", "Rust"],
    applicationCategory: "DeveloperApplication",
    description:
      "AgentSLA DSL, SDKs, API facade, MCP server, containers, and documentation for service level agreements for AI agents."
  };
}
