"""HostelFix 360 — Lovely Professional University (LPU) FastAPI Full-Stack Backend."""

from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse

from .auth import create_access_token, get_current_user, hash_password, require_roles, verify_password
from .config import BASE_DIR, VALID_STATUSES
from .database import db_session
from .schemas import (
    ComplaintClosureRequest,
    ComplaintCreate,
    ComplaintStaffUpdate,
    LoginRequest,
    ObservationCreate,
    RegisterRequest,
    RestockRequest,
)
from .seed import seed_database
from .triage import analyze_complaint, compute_predictive_insights


def create_app(db_path: str | None = None) -> FastAPI:
    app = FastAPI(
        title="HostelFix 360 — LPU Smart Hostel Maintenance API",
        version="2.0.0",
        description="Production-oriented full-stack API powering HostelFix 360 for Lovely Professional University (INT335 Design Thinking P02).",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    seed_database(db_path)

    # ------------------------------------------------------------------
    # Frontend & Health Endpoints
    # ------------------------------------------------------------------
    @app.get("/", response_class=HTMLResponse, include_in_schema=False)
    def serve_frontend():
        index_file = BASE_DIR / "index.html"
        if not index_file.exists():
            index_file = BASE_DIR / "frontend" / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return HTMLResponse("<h1>HostelFix & LPU NEXUS 360 API Running</h1><p>Visit <a href='/docs'>/docs</a> for OpenAPI reference.</p>")

    @app.get("/{filename:path}.js", include_in_schema=False)
    def serve_js(filename: str):
        p = BASE_DIR / f"{filename}.js"
        if p.exists():
            return FileResponse(p, media_type="application/javascript")
        raise HTTPException(status_code=404, detail="File not found")

    @app.get("/{filename:path}.css", include_in_schema=False)
    def serve_css(filename: str):
        p = BASE_DIR / f"{filename}.css"
        if p.exists():
            return FileResponse(p, media_type="text/css")
        raise HTTPException(status_code=404, detail="File not found")

    @app.get("/{filename:path}.jpg", include_in_schema=False)
    def serve_jpg(filename: str):
        p = BASE_DIR / f"{filename}.jpg"
        if p.exists():
            return FileResponse(p, media_type="image/jpeg")
        raise HTTPException(status_code=404, detail="File not found")

    @app.get("/api/v1/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok", "service": "HostelFix & LPU NEXUS 360", "version": "2.1.0"}

    # ------------------------------------------------------------------
    # Authentication & RBAC
    # ------------------------------------------------------------------
    @app.post("/api/v1/auth/login")
    def login(payload: LoginRequest) -> dict[str, Any]:
        with db_session(db_path) as conn:
            row = conn.execute("SELECT * FROM users WHERE lower(email) = lower(?)", (payload.email,)).fetchone()
            if not row or not verify_password(payload.password, row["password_hash"]):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
            user_data = {
                "id": row["id"],
                "reg_no": row["reg_no"],
                "full_name": row["full_name"],
                "email": row["email"],
                "role": row["role"],
                "hostel_block": row["hostel_block"],
                "room_no": row["room_no"],
            }
            token = create_access_token(user_data)
            return {"access_token": token, "token_type": "bearer", "user": user_data}

    @app.post("/api/v1/auth/register", status_code=status.HTTP_201_CREATED)
    def register_student(payload: RegisterRequest) -> dict[str, Any]:
        with db_session(db_path) as conn:
            exists = conn.execute(
                "SELECT id FROM users WHERE lower(email) = lower(?) OR reg_no = ?",
                (payload.email, payload.reg_no),
            ).fetchone()
            if exists:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or registration number already registered")
            cur = conn.execute(
                """INSERT INTO users (reg_no, full_name, email, role, hostel_block, room_no, password_hash)
                   VALUES (?, ?, ?, 'student', ?, ?, ?)""",
                (payload.reg_no, payload.full_name, payload.email, payload.hostel_block, payload.room_no, hash_password(payload.password)),
            )
            user_data = {
                "id": cur.lastrowid,
                "reg_no": payload.reg_no,
                "full_name": payload.full_name,
                "email": payload.email,
                "role": "student",
                "hostel_block": payload.hostel_block,
                "room_no": payload.room_no,
            }
            return {"access_token": create_access_token(user_data), "token_type": "bearer", "user": user_data}

    @app.get("/api/v1/auth/me")
    def me(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        return {"user": user}

    # ------------------------------------------------------------------
    # Complaints Lifecycle (Student + Warden + Technician + Admin)
    # ------------------------------------------------------------------
    @app.get("/api/v1/blocks")
    def list_blocks() -> dict[str, Any]:
        with db_session(db_path) as conn:
            rows = conn.execute("SELECT * FROM hostel_blocks ORDER BY block_code").fetchall()
            return {"blocks": [dict(r) for r in rows]}

    @app.get("/api/v1/complaints")
    def list_complaints(
        block_code: str | None = Query(default=None),
        status_filter: str | None = Query(default=None, alias="status"),
        category: str | None = Query(default=None),
    ) -> dict[str, Any]:
        clauses, params = [], []
        if block_code and block_code != "ALL":
            clauses.append("block_code = ?")
            params.append(block_code)
        if status_filter and status_filter != "ALL":
            clauses.append("status = ?")
            params.append(status_filter)
        if category and category != "ALL":
            clauses.append("category = ?")
            params.append(category)
        where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        with db_session(db_path) as conn:
            rows = conn.execute(f"SELECT * FROM complaints {where_sql} ORDER BY rowid DESC", params).fetchall()
            items = [dict(r) for r in rows]
            return {"count": len(items), "complaints": items}

    @app.post("/api/v1/complaints", status_code=status.HTTP_201_CREATED)
    def create_complaint(
        payload: ComplaintCreate,
        user: dict[str, Any] = Depends(require_roles("student", "warden", "admin")),
    ) -> dict[str, Any]:
        with db_session(db_path) as conn:
            blk = conn.execute("SELECT block_code FROM hostel_blocks WHERE block_code = ?", (payload.block_code,)).fetchone()
            if not blk:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown hostel block: {payload.block_code}")

            prior_count = conn.execute(
                "SELECT COUNT(*) AS c FROM complaints WHERE block_code = ? AND room_no = ?",
                (payload.block_code, payload.room_no),
            ).fetchone()["c"]
            triage = analyze_complaint(payload.category, payload.description, recurring_in_room=prior_count)

            # Generate next sequential HF-XXXX reference ID
            last_row = conn.execute("SELECT id FROM complaints ORDER BY rowid DESC LIMIT 1").fetchone()
            next_num = 1087
            if last_row and str(last_row["id"]).startswith("HF-"):
                try:
                    next_num = int(str(last_row["id"]).split("-")[1]) + 1
                except ValueError:
                    next_num = 1092
            ticket_id = f"HF-{next_num}"

            floor = int(payload.room_no[0]) if payload.room_no and payload.room_no[0].isdigit() else 2
            floor = max(1, min(5, floor))
            title = payload.description[:52] + ("…" if len(payload.description) > 52 else "")

            conn.execute(
                """INSERT INTO complaints (
                    id, student_id, block_code, floor, room_no, category, title, description,
                    priority, sla_hours, triage_score, triage_reason, status, technician_name,
                    visit_slot, staff_note, has_photo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', 'Unassigned', ?, ?, ?)""",
                (
                    ticket_id, user["id"], payload.block_code, floor, payload.room_no,
                    payload.category, title, payload.description, triage["priority"],
                    triage["sla_hours"], triage["triage_score"], triage["triage_reason"],
                    payload.visit_slot, "Complaint registered and queued for Hostel Warden review.",
                    1 if payload.has_photo else 0,
                ),
            )
            conn.execute(
                "INSERT INTO complaint_events (complaint_id, actor_name, actor_role, event_type, note) VALUES (?, ?, ?, 'Submitted', ?)",
                (ticket_id, user["full_name"], user["role"], f"Triaged as {triage['priority']} (SLA {triage['sla_hours']}h)."),
            )
            conn.execute(
                "INSERT INTO notifications (user_id, complaint_id, notif_type, message) VALUES (?, ?, 'assigned', ?)",
                (user["id"], ticket_id, f"Complaint {ticket_id} received for {payload.block_code} Rm {payload.room_no} ({triage['priority']} priority)."),
            )
            created = dict(conn.execute("SELECT * FROM complaints WHERE id = ?", (ticket_id,)).fetchone())
            return {"complaint": created, "triage": triage}

    @app.patch("/api/v1/complaints/{complaint_id}/staff-update")
    def staff_update_complaint(
        complaint_id: str,
        payload: ComplaintStaffUpdate,
        user: dict[str, Any] = Depends(require_roles("warden", "technician", "admin")),
    ) -> dict[str, Any]:
        if payload.status and payload.status not in VALID_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status value")
        with db_session(db_path) as conn:
            tk = conn.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,)).fetchone()
            if not tk:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

            new_tech = payload.technician_name if payload.technician_name is not None else tk["technician_name"]
            new_status = payload.status if payload.status is not None else tk["status"]
            new_slot = payload.visit_slot if payload.visit_slot is not None else tk["visit_slot"]
            new_note = payload.staff_note if payload.staff_note is not None else tk["staff_note"]
            new_delay = payload.delay_reason if payload.delay_reason is not None else tk["delay_reason"]
            confirmed = 0 if new_status != "Resolved" else tk["student_confirmed"]

            conn.execute(
                """UPDATE complaints
                   SET technician_name=?, status=?, visit_slot=?, staff_note=?, delay_reason=?,
                       student_confirmed=?, updated_at=datetime('now')
                   WHERE id=?""",
                (new_tech, new_status, new_slot, new_note, new_delay, confirmed, complaint_id),
            )
            conn.execute(
                "INSERT INTO complaint_events (complaint_id, actor_name, actor_role, event_type, note) VALUES (?, ?, ?, ?, ?)",
                (complaint_id, user["full_name"], user["role"], new_status, new_delay or new_note),
            )
            notif_type = "resolved" if new_status == "Resolved" else ("delay" if new_status == "Awaiting Parts" else "assigned")
            conn.execute(
                "INSERT INTO notifications (user_id, complaint_id, notif_type, message) VALUES (?, ?, ?, ?)",
                (tk["student_id"], complaint_id, notif_type, f"{complaint_id} updated to {new_status} ({new_tech}). {new_delay or new_note}"),
            )
            updated = dict(conn.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,)).fetchone())
            return {"complaint": updated}

    @app.post("/api/v1/complaints/{complaint_id}/close-loop")
    def close_or_reopen_complaint(
        complaint_id: str,
        payload: ComplaintClosureRequest,
        user: dict[str, Any] = Depends(require_roles("student", "admin")),
    ) -> dict[str, Any]:
        with db_session(db_path) as conn:
            tk = conn.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,)).fetchone()
            if not tk:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
            if payload.action == "resolve":
                conn.execute(
                    """UPDATE complaints
                       SET student_confirmed=1, rating=?, feedback_comment=?, updated_at=datetime('now')
                       WHERE id=?""",
                    (payload.rating or 5, payload.feedback_comment, complaint_id),
                )
                conn.execute(
                    "INSERT INTO complaint_events (complaint_id, actor_name, actor_role, event_type, note) VALUES (?, ?, ?, 'Confirmed Resolved', ?)",
                    (complaint_id, user["full_name"], user["role"], f"Rated {payload.rating or 5}/5"),
                )
            else:
                if not payload.reopen_reason.strip():
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="reopen_reason is required when reopening")
                conn.execute(
                    """UPDATE complaints
                       SET status='Reopened', priority='Urgent', student_confirmed=0,
                           reopen_reason=?, updated_at=datetime('now')
                       WHERE id=?""",
                    (payload.reopen_reason.strip(), complaint_id),
                )
                conn.execute(
                    "INSERT INTO complaint_events (complaint_id, actor_name, actor_role, event_type, note) VALUES (?, ?, ?, 'Reopened', ?)",
                    (complaint_id, user["full_name"], user["role"], payload.reopen_reason.strip()),
                )
            updated = dict(conn.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,)).fetchone())
            return {"complaint": updated}

    # ------------------------------------------------------------------
    # Spare Parts Inventory (CP4 I27) & Preventive Checks (CP4 I02/I26)
    # ------------------------------------------------------------------
    @app.get("/api/v1/inventory")
    def list_inventory() -> dict[str, Any]:
        with db_session(db_path) as conn:
            rows = conn.execute("SELECT * FROM spare_parts ORDER BY id").fetchall()
            return {"items": [dict(r) for r in rows]}

    @app.post("/api/v1/inventory/{part_id}/restock")
    def restock_part(
        part_id: str,
        payload: RestockRequest,
        user: dict[str, Any] = Depends(require_roles("warden", "admin")),
    ) -> dict[str, Any]:
        with db_session(db_path) as conn:
            row = conn.execute("SELECT * FROM spare_parts WHERE id = ?", (part_id,)).fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Part not found")
            conn.execute(
                "UPDATE spare_parts SET stock = stock + ?, updated_at=datetime('now') WHERE id = ?",
                (payload.quantity, part_id),
            )
            updated = dict(conn.execute("SELECT * FROM spare_parts WHERE id = ?", (part_id,)).fetchone())
            return {"item": updated}

    @app.get("/api/v1/preventive")
    def list_preventive() -> dict[str, Any]:
        with db_session(db_path) as conn:
            rows = conn.execute("SELECT * FROM preventive_checks ORDER BY id").fetchall()
            return {"checks": [dict(r) for r in rows]}

    @app.post("/api/v1/preventive/{check_id}/toggle")
    def toggle_preventive(
        check_id: str,
        user: dict[str, Any] = Depends(require_roles("warden", "technician", "admin")),
    ) -> dict[str, Any]:
        with db_session(db_path) as conn:
            row = conn.execute("SELECT * FROM preventive_checks WHERE id = ?", (check_id,)).fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist item not found")
            new_val = 0 if row["done"] else 1
            conn.execute("UPDATE preventive_checks SET done=?, updated_at=datetime('now') WHERE id=?", (new_val, check_id))
            updated = dict(conn.execute("SELECT * FROM preventive_checks WHERE id = ?", (check_id,)).fetchone())
            return {"check": updated}

    # ------------------------------------------------------------------
    # Analytics, Predictive Insights & CP5 Neutral Testing Lab
    # ------------------------------------------------------------------
    @app.get("/api/v1/analytics/overview")
    def analytics_overview() -> dict[str, Any]:
        with db_session(db_path) as conn:
            complaints = [dict(r) for r in conn.execute("SELECT * FROM complaints").fetchall()]
            insights = compute_predictive_insights(complaints)
            return {
                "total_complaints": len(complaints),
                "open_complaints": sum(1 for c in complaints if c["status"] != "Resolved"),
                "resolved_complaints": sum(1 for c in complaints if c["status"] == "Resolved"),
                "predictive_insights": insights,
            }

    @app.get("/api/v1/notifications")
    def list_notifications() -> dict[str, Any]:
        with db_session(db_path) as conn:
            rows = conn.execute("SELECT * FROM notifications ORDER BY id DESC LIMIT 30").fetchall()
            return {"notifications": [dict(r) for r in rows]}

    @app.get("/api/v1/cp5/observations")
    def list_observations() -> dict[str, Any]:
        with db_session(db_path) as conn:
            rows = conn.execute("SELECT * FROM cp5_observations ORDER BY id DESC").fetchall()
            return {"observations": [dict(r) for r in rows]}

    @app.post("/api/v1/cp5/observations", status_code=status.HTTP_201_CREATED)
    def create_observation(payload: ObservationCreate) -> dict[str, Any]:
        with db_session(db_path) as conn:
            cur = conn.execute(
                "INSERT INTO cp5_observations (participant_code, task_code, outcome, duration, notes) VALUES (?, ?, ?, ?, ?)",
                (payload.participant_code, payload.task_code, payload.outcome, payload.duration, payload.notes),
            )
            row = dict(conn.execute("SELECT * FROM cp5_observations WHERE id = ?", (cur.lastrowid,)).fetchone())
            return {"observation": row}

    return app


app = create_app()
