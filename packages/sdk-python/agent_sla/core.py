import json
from copy import deepcopy
from typing import Any

METRIC_TYPES = {
    "ACCURACY",
    "ADVERSARIAL_DISTANCE",
    "ADVERSARIAL_FREQUENCY",
    "ADVERSARIAL_SEVERITY",
    "AGEISM",
    "A2A",
    "AUC",
    "BIAS",
    "CARBON_EMISSIONS",
    "CARBON_OFFSET",
    "E2E",
    "E2E_LATENCY",
    "ENERGY_CONSUMPTION",
    "F1_SCORE",
    "LIME",
    "MCP",
    "OUTPUT_SIZE",
    "OVERSIGHT_LEVEL",
    "PMV",
    "POINTWISE_ROBUSTNESS",
    "POLITICAL",
    "PRECISION",
    "RACISM",
    "RECALL",
    "RELIGIOUS",
    "SEXISM",
    "SHAP",
    "TRAINING_TIME",
    "TTFT",
    "WATER_CONSUMPTION",
    "XACCU_DIFF",
    "XENOPHOBIA",
}
OPERATORS = {"LESS", "LESS_OR_EQUAL", "EQUAL", "GREATER_OR_EQUAL", "GREATER"}
AGGREGATIONS = {"AVG", "MEDIAN", "MIN", "MAX", "SUM", "COUNT", "P95", "P99"}
WINDOW_UNITS = {"MESSAGE", "SECOND", "MINUTE", "HOUR", "DAY"}


def _error(code: str, path: str, message: str) -> dict[str, str]:
    return {"code": code, "path": path, "message": message}


def _index_by_name(values: list[dict[str, Any]] | None) -> dict[str, dict[str, Any]]:
    return {value["name"]: value for value in values or [] if isinstance(value.get("name"), str)}


def validate_sla(input_value: Any) -> dict[str, Any]:
    errors: list[dict[str, str]] = []
    if not isinstance(input_value, dict):
        return {"valid": False, "errors": [_error("INVALID_ROOT", "$", "SLA must be a JSON object.")]}

    sla = input_value
    if not isinstance(sla.get("GuaranteeTerm"), list):
        errors.append(_error("MISSING_GUARANTEE_TERM", "GuaranteeTerm", "GuaranteeTerm must be an array."))

    agents = _index_by_name(sla.get("Agent"))
    model_cards = _index_by_name(sla.get("ModelCard"))
    providers = _index_by_name(sla.get("Provider"))
    metrics = {}
    metrics.update(_index_by_name(sla.get("QoSMetric")))
    metrics.update(_index_by_name(sla.get("DerivedQoSMetric")))
    metrics.update(_index_by_name(sla.get("QoSDriftMetric")))

    for index, provider in enumerate(sla.get("Provider") or []):
        confidence = provider.get("confidence")
        if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 1:
            errors.append(_error("INVALID_CONFIDENCE", f"Provider[{index}].confidence", "Provider confidence must be between 0 and 1."))

    _validate_metrics(errors, "QoSMetric", sla.get("QoSMetric"), providers)
    _validate_metrics(errors, "DerivedQoSMetric", sla.get("DerivedQoSMetric"), providers, derived=True)
    _validate_metrics(errors, "QoSDriftMetric", sla.get("QoSDriftMetric"), providers)

    for index, agent in enumerate(sla.get("Agent") or []):
        model_card = agent.get("ModelCard")
        if model_card and model_card not in model_cards:
            errors.append(_error("UNKNOWN_MODEL_CARD", f"Agent[{index}].ModelCard", f"Unknown model card: {model_card}"))

    for term_index, term in enumerate(sla.get("GuaranteeTerm") or []):
        for scope_index, scope in enumerate(term.get("Scope") or []):
            agent = scope.get("Agent")
            if agent not in agents:
                errors.append(_error("UNKNOWN_AGENT", f"GuaranteeTerm[{term_index}].Scope[{scope_index}].Agent", f"Unknown agent: {agent}"))
        for slo_index, slo in enumerate(term.get("SLO") or []):
            _validate_expression(errors, slo.get("BoolExpression"), f"GuaranteeTerm[{term_index}].SLO[{slo_index}].BoolExpression", metrics)
        for condition_index, condition in enumerate(term.get("QualifyingCondition") or []):
            _validate_expression(
                errors,
                condition.get("BoolExpression"),
                f"GuaranteeTerm[{term_index}].QualifyingCondition[{condition_index}].BoolExpression",
                metrics,
            )

    return {"valid": not errors, "errors": errors}


def _validate_metrics(errors: list[dict[str, str]], collection: str, values: list[dict[str, Any]] | None, providers: dict[str, Any], derived: bool = False) -> None:
    for index, metric in enumerate(values or []):
        path = f"{collection}[{index}]"
        if not metric.get("unit"):
            errors.append(_error("MISSING_UNIT", f"{path}.unit", "Metric unit is required."))
        if metric.get("metric_type") not in METRIC_TYPES:
            errors.append(_error("UNKNOWN_METRIC_TYPE", f"{path}.metric_type", f"Unknown metric type: {metric.get('metric_type')}"))
        provider = metric.get("Provider")
        if provider and provider not in providers:
            errors.append(_error("UNKNOWN_PROVIDER", f"{path}.Provider", f"Unknown provider: {provider}"))
        if derived:
            if metric.get("window_unit") not in WINDOW_UNITS:
                errors.append(_error("UNKNOWN_WINDOW_UNIT", f"{path}.window_unit", f"Unknown window unit: {metric.get('window_unit')}"))
            if metric.get("aggregation") not in AGGREGATIONS:
                errors.append(_error("UNKNOWN_AGGREGATION", f"{path}.aggregation", f"Unknown aggregation: {metric.get('aggregation')}"))


def _validate_expression(errors: list[dict[str, str]], expression: Any, path: str, metrics: dict[str, Any]) -> None:
    if not isinstance(expression, dict):
        errors.append(_error("INVALID_EXPRESSION", path, "BoolExpression must be an object."))
        return
    expression_type = expression.get("type")
    if expression_type in {"Comparison", "COMPARISON"}:
        if expression.get("QoSMetric") not in metrics:
            errors.append(_error("UNKNOWN_METRIC_REFERENCE", f"{path}.QoSMetric", f"Unknown metric: {expression.get('QoSMetric')}"))
        if expression.get("operator") not in OPERATORS:
            errors.append(_error("UNKNOWN_OPERATOR", f"{path}.operator", f"Unknown operator: {expression.get('operator')}"))
        if not isinstance(expression.get("value"), (int, float)):
            errors.append(_error("INVALID_THRESHOLD", f"{path}.value", "Comparison value must be a number."))
        return
    if expression_type in {"And", "AND", "Or", "OR"}:
        children = expression.get("BoolExpression")
        if not isinstance(children, list) or not children:
            errors.append(_error("EMPTY_JUNCTION", f"{path}.BoolExpression", "Junction expressions require at least one child expression."))
            return
        for index, child in enumerate(children):
            _validate_expression(errors, child, f"{path}.BoolExpression[{index}]", metrics)
        return
    errors.append(_error("UNKNOWN_EXPRESSION_TYPE", f"{path}.type", f"Unknown expression type: {expression_type}"))


def parse_sla(input_value: str | dict[str, Any]) -> dict[str, Any]:
    parsed = json.loads(input_value) if isinstance(input_value, str) else deepcopy(input_value)
    result = validate_sla(parsed)
    if not result["valid"]:
        raise ValueError(result["errors"])
    return parsed


def evaluate_sla(sla: dict[str, Any], metrics: dict[str, float]) -> dict[str, Any]:
    validation = validate_sla(sla)
    if not validation["valid"]:
        return {"passed": False, "terms": [], "errors": validation["errors"]}
    errors: list[dict[str, str]] = []
    terms = []
    for index, term in enumerate(sla["GuaranteeTerm"]):
        slos = []
        for slo in term.get("SLO", []):
            value = _eval_expression(slo["BoolExpression"], metrics, errors, f"GuaranteeTerm[{index}].SLO.{slo['name']}")
            slos.append({"name": slo["name"], "passed": value is True, "value": value})
        terms.append({"index": index, "passed": all(slo["passed"] for slo in slos), "slos": slos})
    return {"passed": not errors and all(term["passed"] for term in terms), "terms": terms, "errors": errors}


def _eval_expression(expression: dict[str, Any], metrics: dict[str, float], errors: list[dict[str, str]], path: str) -> bool | None:
    if expression["type"] in {"Comparison", "COMPARISON"}:
        name = expression["QoSMetric"]
        actual = metrics.get(name)
        if actual is None:
            errors.append(_error("METRIC_VALUE_MISSING", path, f"Missing metric value: {name}"))
            return None
        expected = expression["value"]
        return {
            "LESS": actual < expected,
            "LESS_OR_EQUAL": actual <= expected,
            "EQUAL": actual == expected,
            "GREATER_OR_EQUAL": actual >= expected,
            "GREATER": actual > expected,
        }[expression["operator"]]
    values = [_eval_expression(child, metrics, errors, path) for child in expression["BoolExpression"]]
    return all(values) if expression["type"] in {"And", "AND"} else any(values)


def explain_sla(sla: dict[str, Any]) -> dict[str, Any]:
    terms = []
    for index, term in enumerate(sla["GuaranteeTerm"]):
        terms.append(
            {
                "index": index,
                "scopes": [scope["Agent"] for scope in term.get("Scope", [])],
                "slos": [{"name": slo["name"], "metrics": _collect_metrics(slo["BoolExpression"])} for slo in term.get("SLO", [])],
            }
        )
    slo_count = sum(len(term["slos"]) for term in terms)
    return {"summary": f"AgentSLA has {len(terms)} guarantee term(s) and {slo_count} SLO(s).", "guaranteeTerms": terms}


def _collect_metrics(expression: dict[str, Any]) -> list[str]:
    if expression["type"] in {"Comparison", "COMPARISON"}:
        return [expression["QoSMetric"]]
    seen = []
    for child in expression["BoolExpression"]:
        for metric in _collect_metrics(child):
            if metric not in seen:
                seen.append(metric)
    return seen
