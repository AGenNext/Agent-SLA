import type { Metadata } from "next";
import { LeadForm } from "../components/LeadForm";

export const metadata: Metadata = {
  title: "Request an Agent-SLA Implementation Review",
  description: "Request help implementing AI agent SLAs, MCP governance, API integration, or Agent-Backend runtime mapping.",
  alternates: { canonical: "/lead/" }
};

export default function LeadPage() {
  return (
    <div className="shell prose">
      <h1>Request an Agent-SLA Implementation Review</h1>
      <p>
        Use this form to start a structured implementation review for AI agent quality contracts, MCP tooling, API
        integration, runtime evidence, or Agent-Backend mapping.
      </p>
      <LeadForm />
    </div>
  );
}
