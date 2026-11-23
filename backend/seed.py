"""Idempotent LPU HostelFix 360 demonstration data seeder."""

from .auth import hash_password
from .database import db_session, init_db


def seed_database(db_path: str | None = None) -> None:
    init_db(db_path)
    with db_session(db_path) as conn:
        existing = conn.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
        if existing > 0:
            return

        # 1. Seed Hostel Blocks
        blocks = [
            ("BH-1", "BH-1 Boys Hostel", 4, 120, "Mr. R. K. Sharma", "#F97316"),
            ("GH-2", "GH-2 Girls Hostel", 4, 136, "Ms. Meenakshi Devi", "#8B5CF6"),
            ("BH-4", "BH-4 International Hostel", 5, 150, "Mr. Vikramjit Singh", "#0EA5E9"),
        ]
        conn.executemany(
            "INSERT INTO hostel_blocks (block_code, name, floors, total_rooms, warden_name, accent_color) VALUES (?, ?, ?, ?, ?, ?)",
            blocks,
        )

        # 2. Seed Role-Based Demo Users (Student, Warden, Technician, Admin)
        users = [
            ("LPU2026001", "Gayatri Panigrahi", "student@lpu.in", "student", "BH-1", "304", None, hash_password("Student@123")),
            ("LPU-W-01", "Mr. R. K. Sharma", "warden@lpu.in", "warden", "BH-1", None, "Hostel Operations", hash_password("Warden@123")),
            ("LPU-T-01", "Rajesh Kumar", "tech@lpu.in", "technician", "BH-1", None, "Electrical/Appliance", hash_password("Tech@123")),
            ("LPU-A-01", "Dr. Campus Operations", "admin@lpu.in", "admin", "ALL", None, "Enterprise Admin", hash_password("Admin@123")),
        ]
        conn.executemany(
            "INSERT INTO users (reg_no, full_name, email, role, hostel_block, room_no, specialty, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            users,
        )
        student_id = conn.execute("SELECT id FROM users WHERE email = 'student@lpu.in'").fetchone()["id"]

        # 3. Seed Realistic CP5 Complaints (HF-1087 through HF-1091)
        complaints = [
            (
                "HF-1087", student_id, "BH-1", 3, "304", "Electrical/Appliance",
                "Ceiling fan not working",
                "The ceiling fan in Room 304 stopped spinning suddenly and makes a faint humming sound.",
                "High", 12, 72, "Core utility disruption detected; Daily living & electrical comfort impact",
                "Resolved", "Rajesh Kumar (Electrician)", "10:00 AM – 12:00 PM", "",
                "Replaced faulty 2.5uF fan capacitor and tested all 5 speed levels. Fan is now working.",
                1, 0, None, "", ""
            ),
            (
                "HF-1088", student_id, "GH-2", 2, "208", "Plumbing/Water",
                "Washbasin tap continuous water leakage",
                "Hot/cold mixer tap in GH-2 Room 208 washroom is leaking continuously even when shut tight.",
                "Urgent", 4, 92, "Safety/hazard keyword detected; Water leakage carries conservation risk",
                "Awaiting Parts", "Suresh Verma (Plumber)", "02:00 PM – 04:00 PM",
                "Required 15mm ceramic spindle cartridge is out of stock; procurement ETA tomorrow 11:00 AM.",
                "Temporary isolation valve tightened to stop water waste until cartridge arrives.",
                1, 0, None, "", ""
            ),
            (
                "HF-1089", student_id, "BH-1", 1, "112", "Plumbing/Water",
                "Corridor ceiling water seepage near washroom",
                "Water dripping from corridor ceiling outside Room 112 creating a slippery floor hazard.",
                "Urgent", 4, 96, "Safety/hazard keyword detected; Water leakage carries structural risk",
                "Submitted", "Unassigned", "Anytime (Urgent)", "",
                "Awaiting warden review and plumber dispatch.",
                1, 0, None, "", ""
            ),
            (
                "HF-1090", student_id, "BH-4", 4, "412", "HVAC/AC",
                "Split AC not cooling & blinking error code",
                "AC indoor unit runs for 10 minutes then blows warm air with an E4 indicator.",
                "Medium", 24, 58, "Core utility disruption detected; Thermal comfort impact",
                "In Progress", "Deepak Singh (HVAC Tech)", "05:00 PM – 07:00 PM", "",
                "Technician on-site cleaning condenser coils and checking refrigerant pressure.",
                0, 0, None, "", ""
            ),
            (
                "HF-1091", student_id, "GH-2", 3, "315", "Furniture",
                "Study table drawer rail broken & door latch loose",
                "Study table drawer slides off track and main room bolt does not align properly.",
                "Low", 48, 40, "Standard hostel maintenance triage",
                "Assigned", "Amit Sharma (Carpenter)", "02:00 PM – 04:00 PM", "",
                "Assigned to carpentry shift; visit scheduled for 2:00 PM – 4:00 PM.",
                0, 0, None, "", ""
            ),
        ]
        conn.executemany(
            """INSERT INTO complaints (
                id, student_id, block_code, floor, room_no, category, title, description,
                priority, sla_hours, triage_score, triage_reason, status, technician_name,
                visit_slot, delay_reason, staff_note, has_photo, student_confirmed,
                rating, feedback_comment, reopen_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            complaints,
        )

        # 4. Seed Notifications
        notifs = [
            (student_id, "HF-1087", "resolved", "Your complaint HF-1087 has been marked Resolved. Please confirm if the fan is working."),
            (student_id, "HF-1088", "delay", "Delay Notice for HF-1088: Awaiting 15mm ceramic spindle cartridge (ETA tomorrow 11 AM)."),
            (student_id, "HF-1087", "assigned", "Complaint HF-1087 assigned to Rajesh Kumar (Electrician). Visit window: 10 AM – 12 PM."),
        ]
        conn.executemany(
            "INSERT INTO notifications (user_id, complaint_id, notif_type, message) VALUES (?, ?, ?, ?)",
            notifs,
        )

        # 5. Seed Spare Parts Inventory (CP4 I27)
        parts = [
            ("SP-01", "Ceiling Fan Capacitor (2.5uF)", "Electrical", 18, 10, "pcs"),
            ("SP-02", "15mm Ceramic Tap Cartridge", "Plumbing", 2, 8, "pcs"),
            ("SP-03", "20W LED Tube Light", "Electrical", 24, 12, "pcs"),
            ("SP-04", "16A Modular MCB Switch", "Electrical", 6, 10, "pcs"),
            ("SP-05", "Heavy-Duty Door Aldrop & Hinges", "Furniture", 14, 6, "sets"),
            ("SP-06", "R32 AC Refrigerant Canister", "HVAC", 5, 4, "cyls"),
        ]
        conn.executemany(
            "INSERT INTO spare_parts (id, name, category, stock, min_threshold, unit) VALUES (?, ?, ?, ?, ?, ?)",
            parts,
        )

        # 6. Seed Preventive Inspection Checklist (CP4 I02 & I26)
        checks = [
            ("PM-1", "BH-1", "Inspect overhead water tank float valves & corridor risers", 1),
            ("PM-2", "BH-1", "Test floor distribution board ELCB / earth leakage trips", 1),
            ("PM-3", "GH-2", "Check 2nd & 3rd floor washroom mixers for micro-leaks", 0),
            ("PM-4", "GH-2", "Clean drinking water cooler filters & UV lamps", 1),
            ("PM-5", "BH-4", "Clean split AC indoor filters & drain lines (Floors 1–4)", 0),
            ("PM-6", "All", "Verify corridor QR complaint tags are intact & scannable", 1),
        ]
        conn.executemany(
            "INSERT INTO preventive_checks (id, block_code, task, done) VALUES (?, ?, ?, ?)",
            checks,
        )


if __name__ == "__main__":
    seed_database()
    print("HostelFix 360 LPU database seeded successfully.")
