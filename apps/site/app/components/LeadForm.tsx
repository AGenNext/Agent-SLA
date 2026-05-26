export function LeadForm() {
  return (
    <form className="lead-form" action="https://github.com/AGenNext/Agent-SLA/issues/new" method="get">
      <label>
        Work email
        <input name="title" type="email" placeholder="you@company.com" required />
      </label>
      <label>
        Use case
        <select name="body" defaultValue="Agent SLA evaluation">
          <option>Agent SLA evaluation</option>
          <option>MCP governance</option>
          <option>AI observability</option>
          <option>Runtime integration with Agent-Backend</option>
        </select>
      </label>
      <button type="submit">Request implementation review</button>
      <p>Static GitHub Pages form. Submissions open a prefilled GitHub issue until a CRM or Agent-Backend endpoint is connected.</p>
    </form>
  );
}
