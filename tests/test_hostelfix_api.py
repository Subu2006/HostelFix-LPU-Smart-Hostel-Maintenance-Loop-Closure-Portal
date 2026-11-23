"""Comprehensive automated integration, RBAC, database, and AI triage tests for HostelFix 360 LPU."""

import os
import tempfile
import unittest

from fastapi.testclient import TestClient

from backend.main import create_app


class HostelFixEnterpriseTestSuite(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.db_file = os.path.join(self.tmp_dir.name, "test_hostelfix.db")
        self.app = create_app(db_path=self.db_file)
        self.client = TestClient(self.app)

    def tearDown(self):
        self.tmp_dir.cleanup()

    def _login(self, email: str, password: str) -> str:
        res = self.client.post("/api/v1/auth/login", json={"email": email, "password": password})
        self.assertEqual(res.status_code, 200, res.text)
        return res.json()["access_token"]

    def test_01_health_and_seeded_blocks(self):
        h = self.client.get("/api/v1/health")
        self.assertEqual(h.status_code, 200)
        self.assertEqual(h.json()["status"], "ok")

        b = self.client.get("/api/v1/blocks")
        self.assertEqual(b.status_code, 200)
        codes = {x["block_code"] for x in b.json()["blocks"]}
        self.assertEqual(codes, {"BH-1", "GH-2", "BH-4"})

    def test_02_auth_register_login_and_invalid_password(self):
        bad = self.client.post("/api/v1/auth/login", json={"email": "student@lpu.in", "password": "wrong"})
        self.assertEqual(bad.status_code, 401)

        reg = self.client.post(
            "/api/v1/auth/register",
            json={
                "reg_no": "LPU2026999",
                "full_name": "Aarav Sharma",
                "email": "aarav.sharma@lpu.in",
                "password": "Password@123",
                "hostel_block": "GH-2",
                "room_no": "210",
            },
        )
        self.assertEqual(reg.status_code, 201)
        token = reg.json()["access_token"]
        me = self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["user"]["role"], "student")

    def test_03_rbac_enforcement_blocks_student_from_warden_actions(self):
        student_tok = self._login("student@lpu.in", "Student@123")
        # Student cannot perform warden staff-update or inventory restock
        r1 = self.client.patch(
            "/api/v1/complaints/HF-1089/staff-update",
            json={"status": "Assigned"},
            headers={"Authorization": f"Bearer {student_tok}"},
        )
        self.assertEqual(r1.status_code, 403)

        r2 = self.client.post(
            "/api/v1/inventory/SP-02/restock",
            json={"quantity": 10},
            headers={"Authorization": f"Bearer {student_tok}"},
        )
        self.assertEqual(r2.status_code, 403)

    def test_04_end_to_end_complaint_lifecycle_and_ai_triage(self):
        student_tok = self._login("student@lpu.in", "Student@123")
        warden_tok = self._login("warden@lpu.in", "Warden@123")

        # 1. Student submits urgent hazard complaint -> AI triage elevates to Urgent (SLA 4h)
        create_res = self.client.post(
            "/api/v1/complaints",
            json={
                "block_code": "BH-1",
                "room_no": "304",
                "category": "Electrical/Appliance",
                "description": "Switchboard is emitting sparks and short circuit smell near the study desk.",
                "visit_slot": "Anytime (Urgent)",
                "has_photo": True,
            },
            headers={"Authorization": f"Bearer {student_tok}"},
        )
        self.assertEqual(create_res.status_code, 201)
        body = create_res.json()
        cid = body["complaint"]["id"]
        self.assertTrue(cid.startswith("HF-"))
        self.assertEqual(body["triage"]["priority"], "Urgent")
        self.assertEqual(body["triage"]["sla_hours"], 4)

        # 2. Warden assigns technician and marks Resolved
        upd = self.client.patch(
            f"/api/v1/complaints/{cid}/staff-update",
            json={
                "technician_name": "Rajesh Kumar (Electrician)",
                "status": "Resolved",
                "staff_note": "Replaced burnt 16A socket module and verified earthing.",
            },
            headers={"Authorization": f"Bearer {warden_tok}"},
        )
        self.assertEqual(upd.status_code, 200)
        self.assertEqual(upd.json()["complaint"]["status"], "Resolved")

        # 3. Student reopens because issue persists -> status becomes Reopened + Urgent
        reopen = self.client.post(
            f"/api/v1/complaints/{cid}/close-loop",
            json={"action": "reopen", "reopen_reason": "Socket still trips MCB when laptop charger is plugged in."},
            headers={"Authorization": f"Bearer {student_tok}"},
        )
        self.assertEqual(reopen.status_code, 200)
        self.assertEqual(reopen.json()["complaint"]["status"], "Reopened")
        self.assertEqual(reopen.json()["complaint"]["priority"], "Urgent")

        # 4. Warden resolves again & Student confirms with 5-star rating
        self.client.patch(
            f"/api/v1/complaints/{cid}/staff-update",
            json={"status": "Resolved", "staff_note": "Replaced faulty MCB breaker in corridor DB."},
            headers={"Authorization": f"Bearer {warden_tok}"},
        )
        confirm = self.client.post(
            f"/api/v1/complaints/{cid}/close-loop",
            json={"action": "resolve", "rating": 5, "feedback_comment": "Fixed properly now!"},
            headers={"Authorization": f"Bearer {student_tok}"},
        )
        self.assertEqual(confirm.status_code, 200)
        self.assertEqual(confirm.json()["complaint"]["student_confirmed"], 1)
        self.assertEqual(confirm.json()["complaint"]["rating"], 5)

    def test_05_inventory_preventive_analytics_and_cp5_observations(self):
        warden_tok = self._login("warden@lpu.in", "Warden@123")

        inv_before = self.client.get("/api/v1/inventory").json()["items"]
        sp02_before = next(x["stock"] for x in inv_before if x["id"] == "SP-02")
        restock = self.client.post(
            "/api/v1/inventory/SP-02/restock",
            json={"quantity": 10},
            headers={"Authorization": f"Bearer {warden_tok}"},
        )
        self.assertEqual(restock.status_code, 200)
        self.assertEqual(restock.json()["item"]["stock"], sp02_before + 10)

        tog = self.client.post("/api/v1/preventive/PM-3/toggle", headers={"Authorization": f"Bearer {warden_tok}"})
        self.assertEqual(tog.status_code, 200)
        self.assertEqual(tog.json()["check"]["done"], 1)

        ana = self.client.get("/api/v1/analytics/overview")
        self.assertEqual(ana.status_code, 200)
        self.assertIn("predictive_insights", ana.json())

        obs = self.client.post(
            "/api/v1/cp5/observations",
            json={
                "participant_code": "S1",
                "task_code": "T1",
                "outcome": "Completed independently",
                "duration": "00:42",
                "notes": "Located New Complaint immediately and noted HF-1092 ID.",
            },
        )
        self.assertEqual(obs.status_code, 201)
        all_obs = self.client.get("/api/v1/cp5/observations").json()["observations"]
        self.assertEqual(len(all_obs), 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
