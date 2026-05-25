import json
import unittest
from pathlib import Path

from agent_sla import METRIC_TYPES, evaluate_sla, explain_sla, parse_sla, validate_sla


ROOT = Path(__file__).resolve().parents[3]
GOLDEN = json.loads((ROOT / "examples" / "listing1.json").read_text())


class AgentSLATest(unittest.TestCase):
    def test_validates_golden_example(self):
        self.assertEqual(validate_sla(GOLDEN), {"valid": True, "errors": []})

    def test_parses_golden_example(self):
        self.assertEqual(len(parse_sla(GOLDEN)["GuaranteeTerm"]), 1)

    def test_rejects_invalid_operator(self):
        invalid = json.loads(json.dumps(GOLDEN))
        invalid["GuaranteeTerm"][0]["SLO"][0]["BoolExpression"]["operator"] = "BELOW"
        result = validate_sla(invalid)
        self.assertFalse(result["valid"])
        self.assertIn("UNKNOWN_OPERATOR", {error["code"] for error in result["errors"]})

    def test_evaluates_metric_snapshot(self):
        self.assertTrue(evaluate_sla(GOLDEN, {"AVG TTFT": 0.5})["passed"])

    def test_explains_metrics(self):
        explanation = explain_sla(GOLDEN)
        self.assertEqual(explanation["guaranteeTerms"][0]["slos"][0]["metrics"], ["AVG TTFT"])

    def test_covers_table_2_metric_types(self):
        table_2_metrics = {
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
        }
        self.assertEqual(table_2_metrics - METRIC_TYPES, set())


if __name__ == "__main__":
    unittest.main()
