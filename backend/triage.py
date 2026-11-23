"""Intelligent NLP Triage, Technician Matching, Predictive Hotspots & ESG Impact Engine."""

import re
from typing import Any

from .config import SLA_HOURS

URGENT_PATTERNS = re.compile(
    r"\b(spark|shock|fire|smoke|short[\s-]?circuit|flood|burst|seepage|overflow|continuous\s+leak|slippery|broken\s+lock)\b",
    re.IGNORECASE,
)
HIGH_PATTERNS = re.compile(
    r"\b(leak|leaking|dripping|fan\s+not|no\s+water|no\s+power|blackout|not\s+cooling|stopped\s+working|mcb\s+trip)\b",
    re.IGNORECASE,
)

CATEGORY_TECHNICIAN_MAP = {
    "Electrical/Appliance": "Rajesh Kumar (Electrician)",
    "Plumbing/Water": "Suresh Verma (Plumber)",
    "Furniture": "Amit Sharma (Carpenter)",
    "HVAC/AC": "Deepak Singh (HVAC Tech)",
    "Other": "Unassigned",
}


def analyze_complaint(category: str, description: str, recurring_in_room: int = 0) -> dict[str, Any]:
    """Deterministically scores priority, SLA window, recommended technician, and rationale."""
    reasons: list[str] = []
    score = 40

    if URGENT_PATTERNS.search(description):
        score += 50
        reasons.append("Safety/hazard keyword detected in description")
    elif HIGH_PATTERNS.search(description):
        score += 30
        reasons.append("Core utility disruption detected")

    if category == "Plumbing/Water":
        score += 18
        reasons.append("Water leakage carries structural & conservation risk")
    elif category == "Electrical/Appliance":
        score += 12
        reasons.append("Daily living & electrical comfort impact")
    elif category == "HVAC/AC":
        score += 10
        reasons.append("Thermal comfort impact")

    if recurring_in_room >= 1:
        score += 15
        reasons.append(f"Recurring room fault ({recurring_in_room} prior ticket(s))")

    score = min(100, score)
    if score >= 80:
        priority = "Urgent"
    elif score >= 62:
        priority = "High"
    elif score >= 45:
        priority = "Medium"
    else:
        priority = "Low"

    return {
        "priority": priority,
        "sla_hours": SLA_HOURS[priority],
        "triage_score": score,
        "recommended_technician": CATEGORY_TECHNICIAN_MAP.get(category, "Unassigned"),
        "triage_reason": "; ".join(reasons) if reasons else "Standard hostel maintenance triage",
    }


def compute_predictive_insights(complaints: list[dict[str, Any]]) -> dict[str, Any]:
    """Identifies recurring block hotspots and estimates ESG water/energy conservation impact."""
    block_counts: dict[str, int] = {}
    cat_counts: dict[str, int] = {}
    plumbing_resolved = 0
    electrical_resolved = 0

    for c in complaints:
        blk = c["block_code"]
        block_counts[blk] = block_counts.get(blk, 0) + 1
        cat = c["category"]
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        if c["status"] == "Resolved":
            if cat == "Plumbing/Water":
                plumbing_resolved += 1
            elif cat in ("Electrical/Appliance", "HVAC/AC"):
                electrical_resolved += 1

    hotspot_block = max(block_counts, key=block_counts.get) if block_counts else "None"
    hotspot_cat = max(cat_counts, key=cat_counts.get) if cat_counts else "None"

    # Conservative sustainability estimates based on rapid leak isolation & motor/capacitor fixes
    water_saved_liters = 1200 + plumbing_resolved * 380
    kwh_saved = 42 + electrical_resolved * 14

    recommendations = []
    if block_counts.get(hotspot_block, 0) >= 2:
        recommendations.append(
            f"Schedule preventive walk-through for {hotspot_block} (highest concentration: {block_counts[hotspot_block]} tickets)."
        )
    if cat_counts.get("Plumbing/Water", 0) >= 2:
        recommendations.append(
            "Pre-stock 15mm ceramic tap cartridges & washbasin gaskets to eliminate plumbing Awaiting Parts delays."
        )
    if not recommendations:
        recommendations.append("All blocks within normal baseline; continue weekly preventive inspections.")

    return {
        "hotspot_block": hotspot_block,
        "hotspot_category": hotspot_cat,
        "estimated_water_saved_liters": water_saved_liters,
        "estimated_energy_saved_kwh": kwh_saved,
        "recommendations": recommendations,
    }
