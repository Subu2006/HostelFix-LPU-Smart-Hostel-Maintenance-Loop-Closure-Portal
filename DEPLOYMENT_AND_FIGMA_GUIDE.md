# 🚀 HostelFix & LPU NEXUS 360™ — Deployment, Figma & Response Collection Guide

This guide gives you everything you need to:
1. **Deploy the live project for free in 30 seconds** so anyone on campus (students, wardens, mentors) can open it on their mobile phone or PC.
2. **Collect real testing feedback, task completion times, and responses** directly into Excel / Google Sheets via the built-in CSV exporter.
3. **Convert or import the entire project into 100% editable Figma frames** in under 2 minutes.

---

## 🌐 PART 1: 30-Second Instant Free Deployment

Because the core frontend (`index.html`, `styles.css`, `app.js`, `campus-map.js`, `three-hostel.js`, `wireframes.js`, `testing-harness.js`, and data) is bundled with local offline libraries, it requires **zero server installation** to run online.

### Option A: Netlify Drop (Easiest — 30 Seconds, No Code Needed)
1. Open your browser and go to: **[https://app.netlify.com/drop](https://app.netlify.com/drop)** (Sign in or create a free account).
2. Open your desktop file explorer and simply **drag and drop** the entire folder:  
   `HostelFix — LPU Smart Hostel Maintenance & Loop-Closure Portal` into the browser box.
3. Netlify will upload and give you an instant live URL (e.g., `https://hostelfix-lpu.netlify.app`).
4. **Done!** You can now copy this link and share it on WhatsApp, Telegram, or email. Anyone opening it gets the full 3D digital twin, 2D campus map, and mobile prototype.

---

### Option B: GitHub Pages (Free Academic Hosting Forever)
If you want the repository hosted under your GitHub account:
1. Open PowerShell in this folder:
   ```powershell
   cd "c:\Users\subra\OneDrive\Desktop\HostelFix — LPU Smart Hostel Maintenance & Loop-Closure Portal"
   git init
   git add .
   git commit -m "HostelFix & LPU NEXUS 360 v1.0 Production Release"
   git branch -M main
   ```
2. Create a new public repository on [GitHub](https://github.com/new) named `hostelfix-lpu`.
3. Link and push:
   ```powershell
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/hostelfix-lpu.git
   git push -u origin main
   ```
4. On GitHub, go to **Settings &rarr; Pages &rarr; Source:** select `Deploy from a branch`, choose `main` / `root`, and click **Save**.
5. Your live link will be active at:  
   **`https://<YOUR_GITHUB_USERNAME>.github.io/hostelfix-lpu/`**

---

### Option C: Vercel (1-Click Deployment)
We have already included a `vercel.json` file in this folder:
1. Install Vercel CLI (or connect your GitHub repo at [vercel.com](https://vercel.com)):
   ```powershell
   npx vercel
   ```
2. Accept the defaults. Vercel will build and give you an instant production URL with worldwide CDN caching.

---

### Option D: Full-Stack FastAPI + SQLite (Render.com / Railway)
If you want the live Python FastAPI backend with SQLite persistence running in the cloud:
1. Push the folder to GitHub (as in Option B).
2. Go to **[Render.com](https://render.com)** &rarr; **New Web Service** &rarr; Select your GitHub repository.
3. Environment: `Python 3`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6. Click **Deploy**. Render will provide a live API URL like `https://hostelfix-api.onrender.com`.

---

## 📊 PART 2: How to Collect Responses for Your Project

### 1. Built-in Testing Harness & CSV Export (Instant Excel / Google Sheets)
1. Share your live deployed link with participants (students, wardens, friends).
2. Tell them to switch to the **User Testing Suite** tab (View 5).
3. As they perform Tasks **T1 through T7** (Reporting fan, checking status, reopening unresolved issue), the live stopwatch and hesitation counter record their actions.
4. When testing is complete, click the **"Download CSV"** button located at the top right of the *Observation & Evaluation Sheet*.
5. A file named `hostelfix_user_testing_responses.csv` will download immediately containing:
   - Participant ID & Name
   - Task ID & Title
   - Completion Status (*Independent / Assisted*)
   - Duration in Seconds
   - Verbatim Participant Feedback & Quotes
   - Suggested Improvements
6. Double-click to open directly in **Microsoft Excel** or import into **Google Sheets** for your CP5/CP6 report!

### 2. Pairing with a Google Form for Broader Survey Feedback
If you want to gather general feedback from 50+ students across campus:
1. Create a quick Google Form:
   - *Question 1:* What is your Hostel Block & Room Number?
   - *Question 2:* Did the Two-Way Handshake PIN give you confidence that fake/ghost closures are prevented? (1–5 scale)
   - *Question 3:* How intuitive was the 3D room inspector and 2D campus wayfinding? (1–5 scale)
   - *Question 4:* Any features you want added?
2. Put your live prototype link inside the Google Form description.
3. Students open the link, test the app, and submit their ratings into your Google Form!

---

## 🎨 PART 3: How to Import the Complete Project Exactly into Figma (Under 2 Minutes)

You do **not** have to redraw the screens from scratch in Figma. You can convert the live codebase directly into native Figma frames with vectors, typography, and auto-layouts!

### Using the Free "html.to.design" Figma Plugin:
1. Open **Figma** (Desktop app or web at [figma.com](https://figma.com)).
2. Create a new file named `HostelFix — LPU Smart Hostel Maintenance`.
3. In the top toolbar, click **Plugins &rarr; Find more plugins...** and search for **"html.to.design"** (or **"HTML to Figma"** by Builder.io).
4. Run the plugin.
5. In the URL input:
   - Paste your live deployed URL (e.g. `https://hostelfix-lpu.netlify.app`), OR
   - Select the **"Upload HTML file"** tab and choose `index.html` from this project folder.
6. Select Viewport: **Mobile (390 x 844 px)** for the phone mockup and **Desktop (1440 x 900 px)** for the campus navigator.
7. Click **Import**.
8. **Result:** Figma automatically builds editable vector layers, auto-layouts, font styles, icons, and components matching the live code with 100% pixel precision!

---

## 📐 PART 4: Exact Figma Design Specifications & Tokens

If you or your teammates want to manually edit or assemble components in Figma, here are the exact design tokens used:

### 1. Canvas Dimensions
- **Mobile Screens (Screens 1 to 10):** `390 x 844 px` (Corner Radius: `40px` for phone frame mockup).
- **Desktop Spatial Navigator & 3D Twin:** `1440 x 900 px`.

### 2. Color Palette (LPU Design System)
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `primary` | `#6366f1` (Indigo 500) | Primary buttons, active tabs, main badges |
| `primary-hover` | `#4f46e5` (Indigo 600) | Button hover states |
| `accent-lpu` | `#f97316` (Warm Orange) | LPU Highway Zone, key landmarks |
| `success` | `#10b981` (Emerald 500) | Resolved status, verified handshake checkmarks |
| `warning` | `#f59e0b` (Amber 500) | Delayed status, awaiting parts, fan fault highlight |
| `danger` | `#ef4444` (Rose 500) | Critical priority, socket spark fault |
| `bg-dark-base` | `#090e17` | Overall application canvas background |
| `bg-card` | `#1e293b` (Slate 800) | Card surface background (Border: `1px solid rgba(255,255,255,0.08)`) |
| `text-primary` | `#f8fafc` (Slate 50) | Main headings, titles |
| `text-muted` | `#94a3b8` (Slate 400) | Secondary descriptions, timestamps |

### 3. The 10 Prototype Screens (CP5 Layout Hierarchy)
1. **Screen 1 (Splash / Login):** Centered `#6366f1` logo icon with wrench & house, college email input, password input, *"Login"* primary button, *"Sign Up"* outline button.
2. **Screen 2 (Sign Up):** Back arrow, Full Name, College Email (`@lpu.in`), Password, Confirm Password, *"Create Account"* button.
3. **Screen 3 (Student Home):** Hamburger menu, notification bell, 4-quadrant grid:
   - Top-Left: `Report Complaint` (Purple gradient button)
   - Top-Right: `My Complaints`
   - Bottom-Left: `Maintenance Schedule`
   - Bottom-Right: `Notices`
4. **Screen 4 (Report Complaint):** Block/Hostel dropdown, Floor & Room inputs, Category dropdown, Subcategory dropdown, Problem Description textarea, Visit Slot Window selector, Photo attachment mock, *"Submit"* button.
5. **Screen 5 (Submission Acknowledgement):** Green checkmark circle with radiating rays, *"Complaint Submitted!"*, bold Reference Token badge `HF1087`, *"Track Status"* button.
6. **Screen 6 (My Complaints / Tracking):** Ticket `#HF1087` card, 4-stage vertical timeline (*Submitted &rarr; Assigned to Ramesh Kumar &rarr; In Progress &rarr; Ready for Verification*), delay notice banner with *"Awaiting Parts"* explanation.
7. **Screen 7 (Notifications):** List of notification cards (*Assigned to team, Visit window tomorrow 10 AM–12 PM, Work completed*).
8. **Screen 8 (Staff / Warden Dashboard):** Quick metric pills (*New: 5, In Progress: 8, Resolved: 20*), triage feed, quick technician assignment dropdown.
9. **Screen 9 (Update Complaint - Staff):** Complaint ID display, Status dropdown (*In Progress / Awaiting Parts / Resolved*), visit window update, technician remarks textarea, *"Update"* button.
10. **Screen 10 (Feedback & Loop Closure):** *"Was your issue resolved?"* (*Yes / No* toggle), 5-star rating row, comments textarea, *"Submit Verification & Close Loop"* button. If *"No"* is selected, shows *"1-Click Reopen & Escalate to Chief Warden"*.

---

## 💡 Summary of Next Steps
1. **To deploy right now:** Go to **[app.netlify.com/drop](https://app.netlify.com/drop)** and drag this project folder into the window. You will have a live public link in 15 seconds.
2. **To import into Figma:** Open Figma, run the **"html.to.design"** plugin, paste your live link, and let it generate the full Figma file automatically.
3. **To collect feedback:** Send the live link to 5–10 students/friends; after they test the tasks, click **"Download CSV"** in the testing tab to save their responses directly into an Excel sheet!
