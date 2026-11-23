#!/usr/bin/env bash
set -euo pipefail

echo "Seeding LPU HostelFix 360 SQLite database..."
python3 -m backend.seed

echo "Running automated API, RBAC, and Database test suite..."
python3 -m unittest discover -s tests -v

echo "Starting HostelFix 360 LPU Full-Stack Server at http://127.0.0.1:8000 ..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
