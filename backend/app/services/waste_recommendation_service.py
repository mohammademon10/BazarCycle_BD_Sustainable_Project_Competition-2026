"""
BazarCycle BD — Waste-to-Resource Recommendation Engine
Deterministic, rule-based, fully explainable engine for local market waste streams.
Strictly NO Machine Learning / AI API calls.
"""
from typing import Dict, Any, Optional
from decimal import Decimal

# Deterministic rule catalog for Bangladesh local market waste categories
RECOMMENDATION_RULES: Dict[str, Dict[str, Any]] = {
    "vegetable waste": {
        "standard_name": "Vegetable Waste",
        "recommended_pathway": "Composting",
        "default_rate_bdt": Decimal("15.00"),
        "explanation": "Vegetable waste is rich in nitrogen and organic moisture; it can be directly redirected into decentralized aerobic composting or municipal compost pits instead of open dumps.",
        "organic": True,
        "recyclable": False,
        "co2_factor_kg_per_kg": Decimal("0.45") # Estimated avoided CO2e per kg diverted from anaerobic dumps
    },
    "fruit waste": {
        "standard_name": "Fruit Waste",
        "recommended_pathway": "Composting",
        "default_rate_bdt": Decimal("12.00"),
        "explanation": "High-sugar organic fruit discards decompose rapidly and accelerate bio-compost maturation and liquid bio-fertilizer production.",
        "organic": True,
        "recyclable": False,
        "co2_factor_kg_per_kg": Decimal("0.40")
    },
    "fish waste": {
        "standard_name": "Fish Waste",
        "recommended_pathway": "Organic/Fertilizer Pathway",
        "default_rate_bdt": Decimal("25.00"),
        "explanation": "High-protein fish market trimmings and offal provide premium raw nitrogen and phosphorus ingredients for specialized fish-meal and organic agricultural fertilizer plants.",
        "organic": True,
        "recyclable": False,
        "co2_factor_kg_per_kg": Decimal("0.60")
    },
    "plastic": {
        "standard_name": "Plastic",
        "recommended_pathway": "Recycling",
        "default_rate_bdt": Decimal("35.00"),
        "explanation": "Rigid packaging, PET bottles, and plastic crates can be cleaned, shredded, and sold to local plastic recycling aggregators for pelletization.",
        "organic": False,
        "recyclable": True,
        "co2_factor_kg_per_kg": Decimal("1.20")
    },
    "paper/cardboard": {
        "standard_name": "Paper/Cardboard",
        "recommended_pathway": "Paper Recycling",
        "default_rate_bdt": Decimal("18.00"),
        "explanation": "Dry corrugated boxes, produce cartons, and wrapping papers are baled and routed to local paper and cardboard pulp reprocessing mills.",
        "organic": False,
        "recyclable": True,
        "co2_factor_kg_per_kg": Decimal("0.90")
    },
    "other": {
        "standard_name": "Other",
        "recommended_pathway": "Responsible Disposal",
        "default_rate_bdt": Decimal("5.00"),
        "explanation": "Mixed or unclassified market waste should undergo secondary manual segregation at a collection point to divert any salvageable recyclables before authorized municipal sanitary disposal.",
        "organic": False,
        "recyclable": False,
        "co2_factor_kg_per_kg": Decimal("0.10")
    }
}

DISCLAIMER_TEXT = (
    "Values are project estimates for demonstration purposes and may vary by location, "
    "quality, and market conditions."
)

class WasteRecommendationEngine:
    """Deterministic Rule Engine for Waste-to-Resource Recommendations."""

    @staticmethod
    def normalize_category_name(category_name: str) -> str:
        """Normalize category name for robust matching."""
        if not category_name:
            return "other"
        cleaned = category_name.strip().lower()
        if "veg" in cleaned:
            return "vegetable waste"
        if "fruit" in cleaned:
            return "fruit waste"
        if "fish" in cleaned:
            return "fish waste"
        if "plastic" in cleaned:
            return "plastic"
        if "paper" in cleaned or "cardboard" in cleaned:
            return "paper/cardboard"
        return "other"

    @classmethod
    def get_recommendation(
        cls,
        category_name: str,
        quantity_kg: float,
        custom_rate_bdt: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Evaluate deterministic rule for category and quantity.
        Validates quantity_kg > 0.
        """
        if quantity_kg is None or float(quantity_kg) <= 0:
            raise ValueError("Waste quantity must be strictly greater than 0 KG.")

        qty_decimal = Decimal(str(quantity_kg))
        lookup_key = cls.normalize_category_name(category_name)
        rule = RECOMMENDATION_RULES.get(lookup_key, RECOMMENDATION_RULES["other"])

        # Determine unit rate in BDT
        rate = Decimal(str(custom_rate_bdt)) if custom_rate_bdt is not None and float(custom_rate_bdt) >= 0 else rule["default_rate_bdt"]
        
        # Calculate Estimated Resource Value
        estimated_value = round(qty_decimal * rate, 2)
        co2_estimate = round(qty_decimal * rule["co2_factor_kg_per_kg"], 2)

        return {
            "category": rule["standard_name"],
            "recommended_pathway": rule["recommended_pathway"],
            "quantity_kg": float(qty_decimal),
            "unit_rate_bdt": float(rate),
            "estimated_value": float(estimated_value),
            "explanation": rule["explanation"],
            "co2_impact_estimate": float(co2_estimate),
            "organic": rule["organic"],
            "recyclable": rule["recyclable"],
            "disclaimer": DISCLAIMER_TEXT
        }

recommendation_engine = WasteRecommendationEngine()
