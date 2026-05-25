import { AgentSLA, BoolExpression, Explanation, JunctionExpression } from "./types.js";

export function explainSLA(sla: AgentSLA): Explanation {
  const guaranteeTerms = sla.GuaranteeTerm.map((term, index) => ({
    index,
    scopes: term.Scope.map((scope) => scope.Agent),
    slos: term.SLO.map((slo) => ({
      name: slo.name,
      metrics: collectMetrics(slo.BoolExpression)
    }))
  }));
  const sloCount = guaranteeTerms.reduce((total, term) => total + term.slos.length, 0);
  return {
    summary: `AgentSLA has ${guaranteeTerms.length} guarantee term(s) and ${sloCount} SLO(s).`,
    guaranteeTerms
  };
}

function collectMetrics(expression: BoolExpression): string[] {
  if (expression.type === "Comparison" || expression.type === "COMPARISON") return [expression.QoSMetric];
  const junction = expression as JunctionExpression;
  return [...new Set(junction.BoolExpression.flatMap(collectMetrics))];
}
