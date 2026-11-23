"""Central configuration for HostelFix 360 — Lovely Professional University (LPU)."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("HOSTELFIX_DATA_DIR", str(BASE_DIR / "data")))
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = os.getenv("HOSTELFIX_DB_PATH", str(DATA_DIR / "hostelfix_lpu.db"))
SECRET_KEY = os.getenv("HOSTELFIX_SECRET_KEY", "lpu-hostelfix-360-dev-secret-change-in-prod")
TOKEN_TTL_SECONDS = int(os.getenv("HOSTELFIX_TOKEN_TTL", str(60 * 60 * 12)))  # 12 hours

# SLA targets in hours by priority level (CP4 Idea I25 & I28)
SLA_HOURS = {
    "Urgent": 4,
    "High": 12,
    "Medium": 24,
    "Low": 48,
}

VALID_ROLES = ("student", "warden", "technician", "admin")
VALID_STATUSES = (
    "Submitted",
    "Acknowledged",
    "Assigned",
    "In Progress",
    "Awaiting Parts",
    "Resolved",
    "Reopened",
)
VALID_CATEGORIES = (
    "Electrical/Appliance",
    "Plumbing/Water",
    "Furniture",
    "HVAC/AC",
    "Other",
)
