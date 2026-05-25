use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};

const METRIC_TYPES: &[&str] = &[
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
];
const OPERATORS: &[&str] = &["LESS", "LESS_OR_EQUAL", "EQUAL", "GREATER_OR_EQUAL", "GREATER"];
const AGGREGATIONS: &[&str] = &["AVG", "MEDIAN", "MIN", "MAX", "SUM", "COUNT", "P95", "P99"];
const WINDOW_UNITS: &[&str] = &["MESSAGE", "SECOND", "MINUTE", "HOUR", "DAY"];

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidationError {
    pub code: String,
    pub path: String,
    pub message: String,
}

fn error(code: &str, path: impl Into<String>, message: impl Into<String>) -> ValidationError {
    ValidationError { code: code.to_string(), path: path.into(), message: message.into() }
}

pub fn parse_sla(input: &str) -> Result<Value, Vec<ValidationError>> {
    let value: Value = serde_json::from_str(input)
        .map_err(|err| vec![error("INVALID_JSON", "$", err.to_string())])?;
    let errors = validate_sla(&value);
    if errors.is_empty() { Ok(value) } else { Err(errors) }
}

pub fn validate_sla(sla: &Value) -> Vec<ValidationError> {
    let mut errors = vec![];
    if !sla.is_object() {
        return vec![error("INVALID_ROOT", "$", "SLA must be a JSON object.")];
    }
    if !sla.get("GuaranteeTerm").map(Value::is_array).unwrap_or(false) {
        errors.push(error("MISSING_GUARANTEE_TERM", "GuaranteeTerm", "GuaranteeTerm must be an array."));
    }

    let agents = names(sla.get("Agent"));
    let model_cards = names(sla.get("ModelCard"));
    let providers = names(sla.get("Provider"));
    let mut metrics = names(sla.get("QoSMetric"));
    metrics.extend(names(sla.get("DerivedQoSMetric")));
    metrics.extend(names(sla.get("QoSDriftMetric")));

    for (index, provider) in array(sla.get("Provider")).iter().enumerate() {
        let confidence = provider.get("confidence").and_then(Value::as_f64);
        if confidence.map(|value| !(0.0..=1.0).contains(&value)).unwrap_or(true) {
            errors.push(error("INVALID_CONFIDENCE", format!("Provider[{index}].confidence"), "Provider confidence must be between 0 and 1."));
        }
    }
    validate_metrics(&mut errors, "QoSMetric", sla.get("QoSMetric"), &providers, false);
    validate_metrics(&mut errors, "DerivedQoSMetric", sla.get("DerivedQoSMetric"), &providers, true);
    validate_metrics(&mut errors, "QoSDriftMetric", sla.get("QoSDriftMetric"), &providers, false);

    for (index, agent) in array(sla.get("Agent")).iter().enumerate() {
        if let Some(model_card) = agent.get("ModelCard").and_then(Value::as_str) {
            if !model_cards.contains(model_card) {
                errors.push(error("UNKNOWN_MODEL_CARD", format!("Agent[{index}].ModelCard"), format!("Unknown model card: {model_card}")));
            }
        }
    }

    for (term_index, term) in array(sla.get("GuaranteeTerm")).iter().enumerate() {
        for (scope_index, scope) in array(term.get("Scope")).iter().enumerate() {
            let agent = scope.get("Agent").and_then(Value::as_str).unwrap_or("");
            if !agents.contains(agent) {
                errors.push(error("UNKNOWN_AGENT", format!("GuaranteeTerm[{term_index}].Scope[{scope_index}].Agent"), format!("Unknown agent: {agent}")));
            }
        }
        for (slo_index, slo) in array(term.get("SLO")).iter().enumerate() {
            validate_expression(&mut errors, slo.get("BoolExpression"), &format!("GuaranteeTerm[{term_index}].SLO[{slo_index}].BoolExpression"), &metrics);
        }
    }
    errors
}

pub fn evaluate_sla(sla: &Value, metrics: &HashMap<String, f64>) -> Value {
    let validation = validate_sla(sla);
    if !validation.is_empty() {
        return json!({"passed": false, "terms": [], "errors": validation_to_json(validation)});
    }
    let mut errors = vec![];
    let mut terms = vec![];
    for (index, term) in array(sla.get("GuaranteeTerm")).iter().enumerate() {
        let mut slos = vec![];
        for slo in array(term.get("SLO")) {
            let name = slo.get("name").and_then(Value::as_str).unwrap_or("");
            let value = eval_expression(slo.get("BoolExpression").unwrap_or(&Value::Null), metrics, &mut errors, &format!("GuaranteeTerm[{index}].SLO.{name}"));
            slos.push(json!({"name": name, "passed": value == Some(true), "value": value}));
        }
        let passed = slos.iter().all(|slo| slo.get("passed").and_then(Value::as_bool).unwrap_or(false));
        terms.push(json!({"index": index, "passed": passed, "slos": slos}));
    }
    json!({"passed": errors.is_empty() && terms.iter().all(|term| term.get("passed").and_then(Value::as_bool).unwrap_or(false)), "terms": terms, "errors": validation_to_json(errors)})
}

pub fn explain_sla(sla: &Value) -> Value {
    let terms: Vec<Value> = array(sla.get("GuaranteeTerm")).iter().enumerate().map(|(index, term)| {
        let scopes: Vec<Value> = array(term.get("Scope")).iter().filter_map(|scope| scope.get("Agent").cloned()).collect();
        let slos: Vec<Value> = array(term.get("SLO")).iter().map(|slo| {
            json!({"name": slo.get("name").and_then(Value::as_str).unwrap_or(""), "metrics": collect_metrics(slo.get("BoolExpression").unwrap_or(&Value::Null))})
        }).collect();
        json!({"index": index, "scopes": scopes, "slos": slos})
    }).collect();
    let slo_count: usize = terms.iter().map(|term| term.get("slos").and_then(Value::as_array).map(Vec::len).unwrap_or(0)).sum();
    json!({"summary": format!("AgentSLA has {} guarantee term(s) and {} SLO(s).", terms.len(), slo_count), "guaranteeTerms": terms})
}

fn array(value: Option<&Value>) -> Vec<Value> {
    value.and_then(Value::as_array).cloned().unwrap_or_default()
}

fn names(value: Option<&Value>) -> HashSet<String> {
    array(value).iter().filter_map(|item| item.get("name").and_then(Value::as_str).map(str::to_string)).collect()
}

fn validate_metrics(errors: &mut Vec<ValidationError>, collection: &str, values: Option<&Value>, providers: &HashSet<String>, derived: bool) {
    for (index, metric) in array(values).iter().enumerate() {
        let path = format!("{collection}[{index}]");
        if metric.get("unit").and_then(Value::as_str).unwrap_or("").is_empty() {
            errors.push(error("MISSING_UNIT", format!("{path}.unit"), "Metric unit is required."));
        }
        let metric_type = metric.get("metric_type").and_then(Value::as_str).unwrap_or("");
        if !METRIC_TYPES.contains(&metric_type) {
            errors.push(error("UNKNOWN_METRIC_TYPE", format!("{path}.metric_type"), format!("Unknown metric type: {metric_type}")));
        }
        if let Some(provider) = metric.get("Provider").and_then(Value::as_str) {
            if !providers.contains(provider) {
                errors.push(error("UNKNOWN_PROVIDER", format!("{path}.Provider"), format!("Unknown provider: {provider}")));
            }
        }
        if derived {
            let window_unit = metric.get("window_unit").and_then(Value::as_str).unwrap_or("");
            if !WINDOW_UNITS.contains(&window_unit) {
                errors.push(error("UNKNOWN_WINDOW_UNIT", format!("{path}.window_unit"), format!("Unknown window unit: {window_unit}")));
            }
            let aggregation = metric.get("aggregation").and_then(Value::as_str).unwrap_or("");
            if !AGGREGATIONS.contains(&aggregation) {
                errors.push(error("UNKNOWN_AGGREGATION", format!("{path}.aggregation"), format!("Unknown aggregation: {aggregation}")));
            }
        }
    }
}

fn validate_expression(errors: &mut Vec<ValidationError>, expression: Option<&Value>, path: &str, metrics: &HashSet<String>) {
    let Some(expression) = expression else {
        errors.push(error("INVALID_EXPRESSION", path, "BoolExpression must be an object."));
        return;
    };
    let expression_type = expression.get("type").and_then(Value::as_str).unwrap_or("");
    match expression_type {
        "Comparison" | "COMPARISON" => {
            let metric = expression.get("QoSMetric").and_then(Value::as_str).unwrap_or("");
            if !metrics.contains(metric) {
                errors.push(error("UNKNOWN_METRIC_REFERENCE", format!("{path}.QoSMetric"), format!("Unknown metric: {metric}")));
            }
            let operator = expression.get("operator").and_then(Value::as_str).unwrap_or("");
            if !OPERATORS.contains(&operator) {
                errors.push(error("UNKNOWN_OPERATOR", format!("{path}.operator"), format!("Unknown operator: {operator}")));
            }
            if !expression.get("value").map(Value::is_number).unwrap_or(false) {
                errors.push(error("INVALID_THRESHOLD", format!("{path}.value"), "Comparison value must be a number."));
            }
        }
        "And" | "AND" | "Or" | "OR" => {
            for (index, child) in array(expression.get("BoolExpression")).iter().enumerate() {
                validate_expression(errors, Some(child), &format!("{path}.BoolExpression[{index}]"), metrics);
            }
        }
        _ => errors.push(error("UNKNOWN_EXPRESSION_TYPE", format!("{path}.type"), format!("Unknown expression type: {expression_type}"))),
    }
}

fn eval_expression(expression: &Value, metrics: &HashMap<String, f64>, errors: &mut Vec<ValidationError>, path: &str) -> Option<bool> {
    match expression.get("type").and_then(Value::as_str).unwrap_or("") {
        "Comparison" | "COMPARISON" => {
            let metric = expression.get("QoSMetric").and_then(Value::as_str).unwrap_or("");
            let Some(actual) = metrics.get(metric) else {
                errors.push(error("METRIC_VALUE_MISSING", path, format!("Missing metric value: {metric}")));
                return None;
            };
            let expected = expression.get("value").and_then(Value::as_f64).unwrap_or(0.0);
            Some(match expression.get("operator").and_then(Value::as_str).unwrap_or("") {
                "LESS" => *actual < expected,
                "LESS_OR_EQUAL" => *actual <= expected,
                "EQUAL" => *actual == expected,
                "GREATER_OR_EQUAL" => *actual >= expected,
                "GREATER" => *actual > expected,
                _ => false,
            })
        }
        "And" | "AND" => Some(array(expression.get("BoolExpression")).iter().all(|child| eval_expression(child, metrics, errors, path) == Some(true))),
        "Or" | "OR" => Some(array(expression.get("BoolExpression")).iter().any(|child| eval_expression(child, metrics, errors, path) == Some(true))),
        _ => None,
    }
}

fn collect_metrics(expression: &Value) -> Vec<String> {
    if matches!(expression.get("type").and_then(Value::as_str), Some("Comparison" | "COMPARISON")) {
        return expression.get("QoSMetric").and_then(Value::as_str).map(|value| vec![value.to_string()]).unwrap_or_default();
    }
    let mut metrics = vec![];
    for child in array(expression.get("BoolExpression")) {
        for metric in collect_metrics(&child) {
            if !metrics.contains(&metric) {
                metrics.push(metric);
            }
        }
    }
    metrics
}

fn validation_to_json(errors: Vec<ValidationError>) -> Vec<Value> {
    errors.into_iter().map(|error| json!({"code": error.code, "path": error.path, "message": error.message})).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn golden() -> Value {
        serde_json::from_str(include_str!("../../../examples/listing1.json")).unwrap()
    }

    #[test]
    fn validates_golden_example() {
        assert!(validate_sla(&golden()).is_empty());
    }

    #[test]
    fn rejects_unknown_operator() {
        let mut invalid = golden();
        invalid["GuaranteeTerm"][0]["SLO"][0]["BoolExpression"]["operator"] = json!("BELOW");
        assert!(validate_sla(&invalid).iter().any(|error| error.code == "UNKNOWN_OPERATOR"));
    }

    #[test]
    fn evaluates_metric_snapshot() {
        let mut metrics = HashMap::new();
        metrics.insert("AVG TTFT".to_string(), 0.5);
        assert_eq!(evaluate_sla(&golden(), &metrics)["passed"], json!(true));
    }

    #[test]
    fn covers_table_2_metric_types() {
        let table_2_metrics = [
            "PRECISION",
            "RECALL",
            "ACCURACY",
            "AUC",
            "F1_SCORE",
            "XACCU_DIFF",
            "PMV",
            "TRAINING_TIME",
            "POINTWISE_ROBUSTNESS",
            "ADVERSARIAL_FREQUENCY",
            "ADVERSARIAL_SEVERITY",
            "ADVERSARIAL_DISTANCE",
            "TTFT",
            "E2E",
            "BIAS",
            "RACISM",
            "SEXISM",
            "AGEISM",
            "RELIGIOUS",
            "POLITICAL",
            "XENOPHOBIA",
            "SHAP",
            "LIME",
            "ENERGY_CONSUMPTION",
            "WATER_CONSUMPTION",
            "CARBON_EMISSIONS",
            "CARBON_OFFSET",
            "OUTPUT_SIZE",
            "A2A",
            "MCP",
            "OVERSIGHT_LEVEL",
        ];
        assert!(table_2_metrics.iter().all(|metric| METRIC_TYPES.contains(metric)));
    }
}
