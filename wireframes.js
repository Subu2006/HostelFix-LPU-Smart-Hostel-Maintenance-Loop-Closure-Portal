/**
 * HostelFix — 2D Wireframe & Paper Prototype Engine (CP5 Specification)
 * 
 * Recreates and interactive-animates the 10 core screens from:
 * - CP5 Hand-Drawn Prototype Sketches (uploaded by user)
 * - CP5 Document Table Section 5 (Rough Prototype Screen Descriptions)
 * 
 * Includes:
 * - Hand-Drawn Blueprint Rendering Engine
 * - Interactive Clickable Low-Fidelity Testing Simulator
 * - Design Thinking Annotation Layer (CP3 Pain Points -> CP4 Ideas -> CP5 Wireframes)
 */

const WIREFRAME_SCREENS = [
  {
    id: 1,
    title: "1. Splash / Login",
    subtitle: "Unified LPU Identity & Onboarding",
    dtRationale: "Addresses CP3 Need for immediate, low-barrier access. Clean branding establishes institutional trust.",
    cp4Ideas: ["I08 (Digital form)", "I13 (Private student page)"],
    elements: {
      header: "HostelFix",
      tagline: "Hostel Maintenance Complaint App",
      icon: "fa-wrench-simple",
      buttons: ["Login", "Sign Up"],
      secondary: "Lovely Professional University • Campus Facilities"
    }
  },
  {
    id: 2,
    title: "2. Sign Up",
    subtitle: "Registration & Room Allocation Mapping",
    dtRationale: "Prevents anonymous spam while tying complaints directly to hostel block & room number for automatic routing.",
    cp4Ideas: ["I11 (Unique tracking)", "I20 (Floor-wise coordination)"],
    elements: {
      title: "Sign Up",
      fields: ["Full Name", "College Email (@lpu.in)", "Password", "Confirm Password"],
      actions: ["Create Account", "Already have an account? Login"]
    }
  },
  {
    id: 3,
    title: "3. Home (Student)",
    subtitle: "High-Priority Action Hub (4-Quadrant Grid)",
    dtRationale: "Direct response to student confusion: large prominent 'Report Complaint' card ensures zero friction (Task T1).",
    cp4Ideas: ["I08 (Online form)", "I13 (Private page)", "I16 (Daily updates)"],
    elements: {
      header: "HostelFix",
      cards: [
        { label: "Report Complaint", icon: "fa-plus-circle", color: "purple", action: "report" },
        { label: "My Complaints", icon: "fa-list-check", color: "blue", action: "tracking" },
        { label: "Maintenance Schedule", icon: "fa-calendar-days", color: "amber", action: "schedule" },
        { label: "Notices & Alerts", icon: "fa-bullhorn", color: "rose", action: "notifications" }
      ]
    }
  },
  {
    id: 4,
    title: "4. Report Complaint",
    subtitle: "Structured Issue Triage & Photo Attachment",
    dtRationale: "Fixes the 'incomplete complaint' problem identified in student interviews. Dropdowns standardize technician trade dispatch.",
    cp4Ideas: ["I07 (QR form)", "I08 (Mobile form)", "I25 (Priority rule)"],
    elements: {
      title: "Report Complaint",
      fields: [
        { label: "Issue Category *", type: "select", options: ["Electrical (Fan/Light)", "Plumbing & Water", "Carpentry & Furniture", "Network & LAN"] },
        { label: "Problem Description *", type: "textarea", placeholder: "Describe the problem..." },
        { label: "Add Photo (Optional)", type: "button", icon: "fa-camera" }
      ],
      actions: ["Submit"]
    }
  },
  {
    id: 5,
    title: "5. Submission Acknowledgement",
    subtitle: "Immediate Reassurance & Reference Token",
    dtRationale: "Cures the 'Black Hole' fear. Student receives instantaneous proof with reference ID #HF1087 (Task T2).",
    cp4Ideas: ["I11 (Unique tracking number)", "I14 (SMS acknowledgement)", "I15 (WhatsApp confirmation)"],
    elements: {
      badge: "Complaint Submitted!",
      message: "Your complaint has been registered successfully.",
      referenceId: "Complaint ID : HF1087",
      actions: ["Track Status"]
    }
  },
  {
    id: 6,
    title: "6. My Complaints / Tracking",
    subtitle: "Live Multi-Stage Progress Timeline",
    dtRationale: "CP3 core finding: 'Students do not receive updates'. The 4-step vertical timeline eliminates repeated warden follow-ups (Task T3 & T4).",
    cp4Ideas: ["I12 (Status display)", "I13 (Private status page)", "I18 (Delay notice)"],
    elements: {
      title: "My Complaints",
      ticketCard: {
        id: "HF1087",
        status: "In Progress",
        summary: "Electrical – Fan not working",
        timeline: [
          { label: "Complaint Submitted", date: "12 Jan, 10:15 AM", done: true },
          { label: "Assigned to Maintenance", date: "12 Jan, 2:00 PM", done: true },
          { label: "In Repair", date: "13 Jan, 10:00 AM", done: false, active: true },
          { label: "Resolved", date: "Pending Verification", done: false }
        ]
      }
    }
  },
  {
    id: 7,
    title: "7. Notifications Hub",
    subtitle: "Omni-Channel Alert Stream & Timestamps",
    dtRationale: "Keeps students informed of technician visit windows so rooms are not found locked when technicians arrive.",
    cp4Ideas: ["I14 (SMS)", "I15 (WhatsApp)", "I17 (Visit slot booking)", "I18 (Delay transparency)"],
    elements: {
      title: "Notifications",
      items: [
        { text: "Your complaint HF1087 has been assigned to the maintenance team.", time: "12 Jan, 2:00 PM", icon: "fa-user-check" },
        { text: "Maintenance will visit your room tomorrow (13 Jan) between 10 AM - 12 PM.", time: "12 Jan, 6:30 PM", icon: "fa-clock" },
        { text: "Your complaint HF1087 has been resolved.", time: "13 Jan, 11:30 AM", icon: "fa-circle-check" }
      ]
    }
  },
  {
    id: 8,
    title: "8. Staff / Warden Dashboard",
    subtitle: "Triaging & Capacity Overview",
    dtRationale: "Empowers wardens to track campus loads, assign tasks in <30 seconds, and eliminate messy physical registers (Task T6).",
    cp4Ideas: ["I22 (Warden tracker)", "I23 (Task board)", "I24 (Work-order system)", "I35 (Digital dashboard)"],
    elements: {
      title: "Staff Dashboard",
      kpiCards: [
        { label: "New Complaints", count: 5, color: "purple" },
        { label: "In Progress", count: 8, color: "blue" },
        { label: "Resolved", count: 20, color: "emerald" },
        { label: "Reports", count: "Analytics", color: "slate", icon: "fa-chart-pie" }
      ]
    }
  },
  {
    id: 9,
    title: "9. Update Complaint (Staff)",
    subtitle: "Work Order Status, Parts & Remarks",
    dtRationale: "Technician documents diagnosis (e.g. blown capacitor) and status, feeding real-time updates directly to student (Task T7).",
    cp4Ideas: ["I18 (Delay notice)", "I21 (Task sheet)", "I27 (Parts register)"],
    elements: {
      title: "Update Status",
      ticketId: "Complaint ID : HF1087",
      fields: [
        { label: "Update Status *", type: "select", options: ["In Progress", "Awaiting Parts", "Resolved"] },
        { label: "Add Remarks", type: "textarea", value: "Issue fixed. Fan is now working." }
      ],
      actions: ["Update"]
    }
  },
  {
    id: 10,
    title: "10. Feedback (Student)",
    subtitle: "Two-Way Loop Closure & 1-Click Reopen",
    dtRationale: "The cornerstone of CP5: The complaint CANNOT close until the student confirms it is truly fixed. Stops ghost closures (Task T5).",
    cp4Ideas: ["I29 (Student confirmation)", "I30 (Reopen option)", "I31 (Feedback form)"],
    elements: {
      title: "Give Feedback",
      ticketId: "Complaint ID : HF1087",
      question: "Was your issue resolved?",
      options: ["Yes", "No"],
      ratingLabel: "Rate the service",
      fields: [
        { label: "Additional Comments (Optional)", type: "textarea" }
      ],
      actions: ["Submit Feedback"]
    }
  }
];

class WireframeEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentScreenIdx = 0;
    this.viewMode = 'grid'; // 'grid' (all 10 screens) or 'carousel' (interactive test)
  }

  render() {
    if (!this.container) return;

    if (this.viewMode === 'grid') {
      this.renderGridView();
    } else {
      this.renderInteractiveFlow();
    }
  }

  renderGridView() {
    let html = `
      <div class="wireframe-toolbar">
        <div class="wireframe-toolbar-left">
          <span class="badge badge-blueprint"><i class="fa-solid fa-compass-drafting"></i> CP5 2D Low-Fi Blueprint Specification</span>
          <span class="text-sm text-slate-400">10 Verified Design Thinking Screens</span>
        </div>
        <div class="wireframe-toolbar-right">
          <button class="btn btn-sm btn-outline active" onclick="window.wireframeEngine.setViewMode('grid')"><i class="fa-solid fa-table-cells"></i> All 10 Screens Grid</button>
          <button class="btn btn-sm btn-outline" onclick="window.wireframeEngine.setViewMode('carousel')"><i class="fa-solid fa-play"></i> Interactive Paper Flow</button>
        </div>
      </div>

      <div class="wireframe-grid">
    `;

    WIREFRAME_SCREENS.forEach((screen, idx) => {
      html += `
        <div class="wireframe-card" id="wf-card-${screen.id}">
          <div class="wireframe-card-header">
            <span class="wf-screen-tag">Screen ${screen.id}</span>
            <span class="wf-screen-name">${screen.title.split('. ')[1] || screen.title}</span>
          </div>

          <div class="wireframe-phone-mockup blueprint-style">
            <div class="wireframe-speaker"></div>
            <div class="wireframe-screen-content">
              ${this.generateScreenHTML(screen)}
            </div>
            <div class="wireframe-home-bar"></div>
          </div>

          <div class="wireframe-annotations">
            <div class="wf-annotation-badge"><i class="fa-solid fa-lightbulb"></i> DT Rationale</div>
            <p class="wf-annotation-text">${screen.dtRationale}</p>
            <div class="wf-ideas-tags">
              ${screen.cp4Ideas.map(id => `<span class="wf-idea-tag">${id}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    this.container.innerHTML = html;
  }

  renderInteractiveFlow() {
    const screen = WIREFRAME_SCREENS[this.currentScreenIdx];
    let html = `
      <div class="wireframe-toolbar">
        <div class="wireframe-toolbar-left">
          <button class="btn btn-sm btn-outline" onclick="window.wireframeEngine.setViewMode('grid')"><i class="fa-solid fa-arrow-left"></i> Back to 10-Screen Grid</button>
          <span class="badge badge-blueprint">Interactive Paper Test Mode</span>
          <span class="text-sm font-semibold text-slate-300">Screen ${this.currentScreenIdx + 1} of 10: ${screen.title}</span>
        </div>
        <div class="wireframe-toolbar-right">
          <button class="btn btn-sm btn-outline" ${this.currentScreenIdx === 0 ? 'disabled' : ''} onclick="window.wireframeEngine.prevScreen()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
          <button class="btn btn-sm btn-primary" ${this.currentScreenIdx === WIREFRAME_SCREENS.length - 1 ? 'disabled' : ''} onclick="window.wireframeEngine.nextScreen()">Next <i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>

      <div class="interactive-flow-container">
        <div class="flow-phone-wrapper">
          <div class="wireframe-phone-mockup blueprint-style flow-focus">
            <div class="wireframe-speaker"></div>
            <div class="wireframe-screen-content">
              ${this.generateScreenHTML(screen, true)}
            </div>
            <div class="wireframe-home-bar"></div>
          </div>
        </div>

        <div class="flow-inspector-panel">
          <div class="panel-header">
            <h3><i class="fa-solid fa-circle-info text-blue-400"></i> ${screen.title}</h3>
            <span class="subtitle">${screen.subtitle}</span>
          </div>

          <div class="panel-body">
            <div class="section-title">Design Thinking Justification (CP3 -> CP4 -> CP5)</div>
            <p class="panel-description">${screen.dtRationale}</p>

            <div class="section-title">Mapped CP4 Ideation Concepts</div>
            <ul class="panel-ideas-list">
              ${screen.cp4Ideas.map(id => `<li><i class="fa-solid fa-check text-emerald-400"></i> <strong>${id}</strong></li>`).join('')}
            </ul>

            <div class="section-title">Neutral User Testing Task Alignment</div>
            <div class="panel-task-box">
              ${this.getTaskForScreen(screen.id)}
            </div>

            <div class="panel-actions">
              <button class="btn btn-primary w-full" onclick="window.hostelApp.switchView('hifi'); window.hostelApp.openScreen('${this.getHiFiScreenName(screen.id)}')">
                <i class="fa-solid fa-wand-magic-sparkles"></i> View Corresponding Hi-Fi Screen
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    this.container.innerHTML = html;
  }

  generateScreenHTML(screen, isInteractive = false) {
    switch (screen.id) {
      case 1: // Splash / Login
        return `
          <div class="wf-inner wf-splash">
            <div class="wf-logo-box">
              <div class="wf-house-wrench"><i class="fa-solid fa-screwdriver-wrench"></i></div>
              <h2 class="wf-brand-title">HostelFix</h2>
              <p class="wf-brand-sub">Hostel Maintenance<br>Complaint App</p>
            </div>
            <div class="wf-button-stack">
              <button class="wf-btn wf-btn-primary" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(3)"' : ''}>Login</button>
              <button class="wf-btn wf-btn-outline" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(2)"' : ''}>Sign Up</button>
            </div>
          </div>
        `;

      case 2: // Sign Up
        return `
          <div class="wf-inner wf-signup">
            <div class="wf-top-nav">
              <span class="wf-back-icon" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(1)"' : ''}><i class="fa-solid fa-arrow-left"></i></span>
              <span class="wf-nav-title">Sign Up</span>
            </div>
            <div class="wf-form">
              <div class="wf-input-box"><i class="fa-regular fa-user"></i> <span>Full Name</span></div>
              <div class="wf-input-box"><i class="fa-regular fa-envelope"></i> <span>College Email</span></div>
              <div class="wf-input-box"><i class="fa-solid fa-lock"></i> <span>Password</span></div>
              <div class="wf-input-box"><i class="fa-solid fa-lock"></i> <span>Confirm Password</span></div>
              <button class="wf-btn wf-btn-primary" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(3)"' : ''}>Create Account</button>
              <div class="wf-link-sub">Already have an account? <span class="wf-link" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(1)"' : ''}>Login</span></div>
            </div>
          </div>
        `;

      case 3: // Home (Student)
        return `
          <div class="wf-inner wf-home">
            <div class="wf-top-bar">
              <i class="fa-solid fa-bars"></i>
              <span class="wf-app-title">HostelFix</span>
              <i class="fa-regular fa-bell" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(7)"' : ''}></i>
            </div>
            <div class="wf-grid-cards">
              <div class="wf-quad-card card-purple" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(4)"' : ''}>
                <i class="fa-solid fa-circle-plus wf-icon-lg"></i>
                <span>Report Complaint</span>
              </div>
              <div class="wf-quad-card" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(6)"' : ''}>
                <i class="fa-solid fa-list-ul wf-icon-lg"></i>
                <span>My Complaints</span>
              </div>
              <div class="wf-quad-card">
                <i class="fa-regular fa-calendar-days wf-icon-lg"></i>
                <span>Maintenance Schedule</span>
              </div>
              <div class="wf-quad-card" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(7)"' : ''}>
                <i class="fa-solid fa-bullhorn wf-icon-lg"></i>
                <span>Notices</span>
              </div>
            </div>
          </div>
        `;

      case 4: // Report Complaint
        return `
          <div class="wf-inner wf-report">
            <div class="wf-top-nav">
              <span class="wf-back-icon" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(3)"' : ''}><i class="fa-solid fa-arrow-left"></i></span>
              <span class="wf-nav-title">Report Complaint</span>
            </div>
            <div class="wf-form">
              <label class="wf-label">Issue Category *</label>
              <div class="wf-dropdown-mock">
                <span>Electrical (Fan/Light)</span>
                <i class="fa-solid fa-chevron-down"></i>
              </div>
              <label class="wf-label">Problem Description *</label>
              <div class="wf-textarea-mock">
                <span>Describe the problem...</span>
              </div>
              <div class="wf-photo-btn">
                <i class="fa-solid fa-camera"></i>
                <span>Add Photo (Optional)</span>
              </div>
              <button class="wf-btn wf-btn-primary" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(5)"' : ''}>Submit</button>
            </div>
          </div>
        `;

      case 5: // Submission Acknowledgement
        return `
          <div class="wf-inner wf-ack">
            <div class="wf-sunburst-check">
              <div class="sunburst-ring">
                <i class="fa-solid fa-check"></i>
              </div>
            </div>
            <h3 class="wf-ack-title">Complaint Submitted!</h3>
            <p class="wf-ack-msg">Your complaint has been registered successfully.</p>
            <div class="wf-id-badge">
              Complaint ID : HF1087
            </div>
            <button class="wf-btn wf-btn-primary" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(6)"' : ''}>Track Status</button>
          </div>
        `;

      case 6: // My Complaints / Tracking
        return `
          <div class="wf-inner wf-tracking">
            <div class="wf-top-nav">
              <span class="wf-back-icon" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(3)"' : ''}><i class="fa-solid fa-arrow-left"></i></span>
              <span class="wf-nav-title">My Complaints</span>
            </div>
            <div class="wf-ticket-card">
              <div class="wf-tcard-header">
                <strong>HF1087</strong>
                <span class="wf-pill-status">In Progress</span>
              </div>
              <div class="wf-tcard-sub">Electrical – Fan not working</div>
              <div class="wf-timeline">
                <div class="wf-tl-step step-done">
                  <div class="wf-dot"><i class="fa-solid fa-check"></i></div>
                  <div class="wf-tl-info">
                    <div class="wf-step-title">Complaint Submitted</div>
                    <div class="wf-step-date">12 Jan, 10:15 AM</div>
                  </div>
                </div>
                <div class="wf-tl-step step-done">
                  <div class="wf-dot"><i class="fa-solid fa-check"></i></div>
                  <div class="wf-tl-info">
                    <div class="wf-step-title">Assigned to Maintenance</div>
                    <div class="wf-step-date">12 Jan, 2:00 PM</div>
                  </div>
                </div>
                <div class="wf-tl-step step-active">
                  <div class="wf-dot"></div>
                  <div class="wf-tl-info">
                    <div class="wf-step-title">In Repair</div>
                  </div>
                </div>
                <div class="wf-tl-step">
                  <div class="wf-dot"></div>
                  <div class="wf-tl-info">
                    <div class="wf-step-title">Resolved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 7: // Notifications
        return `
          <div class="wf-inner wf-notifs">
            <div class="wf-top-nav">
              <span class="wf-back-icon" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(3)"' : ''}><i class="fa-solid fa-arrow-left"></i></span>
              <span class="wf-nav-title">Notifications</span>
            </div>
            <div class="wf-notifs-list">
              <div class="wf-notif-item">
                <div class="wf-n-icon"><i class="fa-regular fa-bell"></i></div>
                <div class="wf-n-text">Your complaint HF1087 has been assigned to the maintenance team.<br><small>(12 Jan, 2:00 PM)</small></div>
              </div>
              <div class="wf-notif-item">
                <div class="wf-n-icon"><i class="fa-regular fa-bell"></i></div>
                <div class="wf-n-text">Maintenance will visit your room tomorrow (13 Jan) between 10 AM - 12 PM.</div>
              </div>
              <div class="wf-notif-item">
                <div class="wf-n-icon"><i class="fa-regular fa-bell"></i></div>
                <div class="wf-n-text">Your complaint HF1087 has been resolved.<br><small>(13 Jan, 11:30 AM)</small></div>
              </div>
            </div>
          </div>
        `;

      case 8: // Staff / Warden Dashboard
        return `
          <div class="wf-inner wf-warden">
            <div class="wf-top-bar">
              <i class="fa-solid fa-bars"></i>
              <span class="wf-app-title">Staff Dashboard</span>
              <i class="fa-solid fa-user-gear"></i>
            </div>
            <div class="wf-grid-cards">
              <div class="wf-quad-card card-purple" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(9)"' : ''}>
                <i class="fa-solid fa-clipboard-list wf-icon-lg"></i>
                <span class="wf-bold">New Complaints<br>(5)</span>
              </div>
              <div class="wf-quad-card" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(9)"' : ''}>
                <i class="fa-solid fa-wrench wf-icon-lg"></i>
                <span class="wf-bold">In Progress<br>(8)</span>
              </div>
              <div class="wf-quad-card">
                <i class="fa-regular fa-circle-check wf-icon-lg"></i>
                <span class="wf-bold">Resolved<br>(20)</span>
              </div>
              <div class="wf-quad-card">
                <i class="fa-solid fa-chart-column wf-icon-lg"></i>
                <span class="wf-bold">Reports</span>
              </div>
            </div>
          </div>
        `;

      case 9: // Update Complaint (Staff)
        return `
          <div class="wf-inner wf-update">
            <div class="wf-top-nav">
              <span class="wf-back-icon" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(8)"' : ''}><i class="fa-solid fa-arrow-left"></i></span>
              <span class="wf-nav-title">Update Status</span>
            </div>
            <div class="wf-form">
              <div class="wf-badge-inline">Complaint ID : HF1087</div>
              <label class="wf-label">Update Status *</label>
              <div class="wf-dropdown-mock">
                <span>Resolved</span>
                <i class="fa-solid fa-chevron-down"></i>
              </div>
              <label class="wf-label">Add Remarks</label>
              <div class="wf-textarea-mock text-filled">
                <span>Issue fixed. Fan is now working.</span>
              </div>
              <button class="wf-btn wf-btn-primary" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(10)"' : ''}>Update</button>
            </div>
          </div>
        `;

      case 10: // Feedback (Student)
        return `
          <div class="wf-inner wf-feedback">
            <div class="wf-top-nav">
              <span class="wf-back-icon" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(3)"' : ''}><i class="fa-solid fa-arrow-left"></i></span>
              <span class="wf-nav-title">Give Feedback</span>
            </div>
            <div class="wf-form">
              <div class="wf-badge-inline">Complaint ID : HF1087</div>
              <div class="wf-sub-q">Was your issue resolved?</div>
              <div class="wf-radio-row">
                <label><input type="radio" checked name="wf-res"> Yes</label>
                <label><input type="radio" name="wf-res"> No</label>
              </div>
              <div class="wf-sub-q">Rate the service</div>
              <div class="wf-stars-row">
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-regular fa-star"></i>
              </div>
              <label class="wf-label">Additional Comments (Optional)</label>
              <div class="wf-textarea-mock"></div>
              <button class="wf-btn wf-btn-primary" ${isInteractive ? 'onclick="window.wireframeEngine.goToScreen(3)"' : ''}>Submit Feedback</button>
            </div>
          </div>
        `;

      default:
        return `<div>Screen not found</div>`;
    }
  }

  getTaskForScreen(id) {
    const map = {
      1: "T1 Prep: Onboarding & authentication with @lpu.in credentials.",
      2: "T1 Prep: Room & Block mapping.",
      3: "T1: Student navigates to 'Report Complaint' without guidance.",
      4: "T1: Completes category, description, and photo submission.",
      5: "T2: Identifies reference token #HF1087 on acknowledgement screen.",
      6: "T3 & T4: Interprets multi-stage progress timeline and delay notices.",
      7: "T3: Receives proactive visit window notices.",
      8: "T6: Warden reviews pending queue and selects technician.",
      9: "T7: Staff records resolution notes and changes state to Resolved.",
      10: "T5: Student confirms repair or reopens loop if fan still wobbly."
    };
    return map[id] || "Standard testing verification.";
  }

  getHiFiScreenName(id) {
    const map = {
      1: "login",
      2: "signup",
      3: "student-home",
      4: "report",
      5: "acknowledgement",
      6: "tracking",
      7: "notifications",
      8: "staff-dashboard",
      9: "staff-update",
      10: "feedback"
    };
    return map[id] || "student-home";
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.render();
  }

  goToScreen(screenNum) {
    this.currentScreenIdx = screenNum - 1;
    this.viewMode = 'carousel';
    this.render();
  }

  nextScreen() {
    if (this.currentScreenIdx < WIREFRAME_SCREENS.length - 1) {
      this.currentScreenIdx++;
      this.render();
    }
  }

  prevScreen() {
    if (this.currentScreenIdx > 0) {
      this.currentScreenIdx--;
      this.render();
    }
  }
}

// Export to window
if (typeof window !== 'undefined') {
  window.WireframeEngine = WireframeEngine;
  window.WIREFRAME_SCREENS = WIREFRAME_SCREENS;
}
