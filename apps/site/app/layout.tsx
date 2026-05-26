import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { nav, siteUrl } from "./data/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Agent-SLA | Service Level Agreements for AI Agents",
    template: "%s | Agent-SLA"
  },
  description:
    "Agent-SLA is a JSON DSL, SDK, API, MCP server, and Codex skill for service level agreements for AI agents.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Agent-SLA",
    description: "Define, validate, evaluate, and govern service level agreements for AI agents.",
    url: siteUrl,
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <div className="shell">
            <nav aria-label="Main navigation">
              <Link href="/" className="brand">
                Agent-SLA
              </Link>
              <div className="nav-links">
                {nav.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
                <a href="https://github.com/AGenNext/Agent-SLA">GitHub</a>
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <div className="shell">
            Agent-SLA is maintained in <a href="https://github.com/AGenNext/Agent-SLA">AGenNext/Agent-SLA</a>.
          </div>
        </footer>
      </body>
    </html>
  );
}
