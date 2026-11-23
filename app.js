/**
 * HostelFix & LPU NEXUS 360™ — Unified Master Application Controller
 * Handles State, Navigation, Role Switching (Student, Faculty, Warden, Technician, Admin),
 * 2D Campus Spatial Navigator, 3D Digital Twin, 2D Wireframes, Testing Suite,
 * Two-Way Loop-Closure Handshake, and Client-Server API Sync.
 */

class LpuNexusApp {
  constructor() {
    this.currentView = 'campus-map'; // 'campus-map', '3d', 'hifi', 'wireframes', 'testing', 'portfolio'
    this.currentRole = 'student'; // 'student', 'faculty', 'warden', 'technician', 'admin'
    this.currentScreen = 'student-home'; // Screen within HiFi view
    this.activeTicketId = 'HF1087';
    this.tickets = [];
    this.notifications = [];
    this.categoryFilter = 'all';
    this.apiBaseUrl = 'http://localhost:8000/api/v1';
    this.isBackendConnected = false;

    // Sub-Engines
    this.campusMapNav = null;
    this.explorer3D = null;
    this.wireframeEngine = null;
    this.testingHarness = null;
    this.chartInstances = {};

    this.init();
  }

  init() {
    // 1. Load data from data.js
    if (window.LPU_CAMPUS_DATA) {
      this.tickets = JSON.parse(JSON.stringify(window.LPU_CAMPUS_DATA.initialTickets));
    }

    // 2. Setup initial notifications
    this.notifications = [
      { id: 'N1', ticketId: 'HF1087', title: 'Work Order Dispatched', text: 'Senior Electrician Ramesh Kumar assigned to Fan repair in BH-4 Room 312.', time: '12 Jan, 2:00 PM', read: false, icon: 'fa-user-check', type: 'info' },
      { id: 'N2', ticketId: 'HF1087', title: 'Technician Visit Window', text: 'Maintenance will visit your room today between 10:00 AM – 12:00 PM.', time: '12 Jan, 6:30 PM', read: false, icon: 'fa-calendar-check', type: 'visit' },
      { id: 'N3', ticketId: 'AC3401', title: 'Academic Priority Alert', text: 'Faculty Ticket #AC3401: Smartboard touch sensor repair in Block 34 Lab 204 in progress.', time: '12 Jan, 9:15 AM', read: true, icon: 'fa-chalkboard-user', type: 'info' },
      { id: 'N4', ticketId: 'HF1082', title: 'Delay Transparency Notice', text: 'Ticket #HF1082 (BH-4 Water Cooler) delayed: Awaiting compressor relay from Central Store.', time: '12 Jan, 9:30 AM', read: true, icon: 'fa-triangle-exclamation', type: 'delay' }
    ];

    // 3. Setup sub-engines
    this.setupEngines();

    // 4. Check backend connectivity
    this.checkBackendHealth();

    // 5. Initial Render
    this.render();
    this.initCharts();
  }

  setupEngines() {
    // 2D Campus Navigator
    setTimeout(() => {
      if (window.CampusMapNavigator) {
        this.campusMapNav = new window.CampusMapNavigator('campus-map-container');
        window.campusMapNav = this.campusMapNav;
      }
    }, 50);

    // Three.js 3D Campus & Room Explorer
    setTimeout(() => {
      const c3d = document.getElementById('three-viewport');
      if (c3d && window.Campus3DExplorer) {
        this.explorer3D = new window.Campus3DExplorer('three-viewport');
        this.explorer3D.onComponentClickCallback = (data) => this.handle3DSelection(data);
        window.campus3DExplorer = this.explorer3D;
      }
    }, 100);

    // Wireframes Engine (CP5)
    if (window.WireframeEngine) {
      this.wireframeEngine = new window.WireframeEngine('wireframes-container');
      window.wireframeEngine = this.wireframeEngine;
    }

    // Testing Harness (CP5 Tasks T1-T7)
    if (window.TestingHarness) {
      this.testingHarness = new window.TestingHarness('testing-container');
      window.testingHarness = this.testingHarness;
    }
  }

  async checkBackendHealth() {
    try {
      const res = await fetch(`${this.apiBaseUrl}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        this.isBackendConnected = true;
        this.showToast(`Connected to Live LPU FastAPI Backend (v${data.version})!`, 'success');
        this.updateBackendStatusBadge(true);
      }
    } catch (e) {
      this.isBackendConnected = false;
      this.updateBackendStatusBadge(false);
    }
  }

  updateBackendStatusBadge(isConnected) {
    const el = document.getElementById('api-status-indicator');
    if (el) {
      el.className = isConnected ? 'api-badge online' : 'api-badge local';
      el.innerHTML = isConnected 
        ? `<i class="fa-solid fa-server text-emerald-400"></i> <span>Live FastAPI Backend</span>`
        : `<i class="fa-solid fa-laptop-code text-blue-400"></i> <span>Standalone Client Mode</span>`;
    }
  }

  /* =========================================================================
   * NAVIGATION & VIEW SWITCHING
   * ========================================================================= */
  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    const views = ['campus-map', '3d', 'hifi', 'wireframes', 'testing', 'portfolio'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.classList.toggle('active-view', v === viewName);
    });

    if (viewName === 'campus-map' && this.campusMapNav) {
      this.campusMapNav.render();
    } else if (viewName === '3d' && this.explorer3D) {
      setTimeout(() => this.explorer3D.onWindowResize(), 60);
    } else if (viewName === 'wireframes' && this.wireframeEngine) {
      this.wireframeEngine.render();
    } else if (viewName === 'testing' && this.testingHarness) {
      this.testingHarness.render();
    } else if (viewName === 'hifi') {
      this.renderHiFiScreen();
    }
  }

  switchRole(roleName) {
    this.currentRole = roleName;
    document.querySelectorAll('.role-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === roleName);
    });

    if (roleName === 'student') this.currentScreen = 'student-home';
    else if (roleName === 'faculty') this.currentScreen = 'faculty-portal';
    else if (roleName === 'warden') this.currentScreen = 'staff-dashboard';
    else if (roleName === 'technician') this.currentScreen = 'technician-portal';
    else if (roleName === 'admin') this.currentScreen = 'admin-telemetry';

    this.showToast(`Switched view to: ${this.getRoleDisplayName(roleName)}`, 'info');
    this.render();
  }

  getRoleDisplayName(role) {
    const map = {
      student: 'Hostel Student (Aarav Sharma - BH-4)',
      faculty: 'Faculty Member (Dr. Ananya Sen - Block 14/34)',
      warden: 'Hostel Warden (Mr. Harpreet Singh - BH-3/4)',
      technician: 'Senior Electrician (Ramesh Kumar)',
      admin: 'Campus Facilities Director (Dr. Baldev Singh)'
    };
    return map[role] || role;
  }

  openScreen(screenName, ticketId = null) {
    this.currentScreen = screenName;
    if (ticketId) this.activeTicketId = ticketId;
    this.renderHiFiScreen();
    const phoneBody = document.querySelector('.phone-screen-body');
    if (phoneBody) phoneBody.scrollTop = 0;
  }

  /* =========================================================================
   * HIFI APPLICATION RENDERING
   * ========================================================================= */
  render() {
    this.renderRoleBar();
    this.renderHiFiScreen();
  }

  renderRoleBar() {
    const roleEl = document.getElementById('active-role-label');
    if (roleEl) roleEl.innerText = this.getRoleDisplayName(this.currentRole);
  }

  renderHiFiScreen() {
    const container = document.getElementById('hifi-screen-mount');
    if (!container) return;

    let html = '';
    switch (this.currentScreen) {
      case 'student-home': html = this.renderStudentHomeScreen(); break;
      case 'faculty-portal': html = this.renderFacultyHomeScreen(); break;
      case 'report': html = this.renderReportScreen(); break;
      case 'acknowledgement': html = this.renderAcknowledgementScreen(); break;
      case 'tracking': html = this.renderTrackingScreen(); break;
      case 'notifications': html = this.renderNotificationsScreen(); break;
      case 'staff-dashboard': html = this.renderStaffDashboardScreen(); break;
      case 'staff-update': html = this.renderStaffUpdateScreen(); break;
      case 'technician-portal': html = this.renderTechnicianScreen(); break;
      case 'feedback': html = this.renderFeedbackScreen(); break;
      case 'admin-telemetry': html = this.renderAdminTelemetryScreen(); break;
      default: html = this.renderStudentHomeScreen();
    }
    container.innerHTML = html;
  }

  // --- SCREEN 3: STUDENT HOME ---
  renderStudentHomeScreen() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    const activeTickets = this.tickets.filter(t => t.studentName === 'Aarav Sharma' && t.status !== 'Closed');

    return `
      <div class="screen-view student-home-view">
        <div class="app-topbar">
          <div class="brand-left">
            <div class="brand-logo-icon"><i class="fa-solid fa-wrench"></i></div>
            <div>
              <div class="brand-title">HostelFix & NEXUS</div>
              <div class="brand-sub">BH-4 Nilgiri • Room 312 • LPU</div>
            </div>
          </div>
          <div class="brand-right">
            <button class="icon-btn" onclick="window.hostelApp.openScreen('notifications')">
              <i class="fa-regular fa-bell"></i>
              ${unreadCount > 0 ? `<span class="badge-dot">${unreadCount}</span>` : ''}
            </button>
            <div class="user-avatar" onclick="window.hostelApp.switchRole('faculty')" title="Switch Perspective">AS</div>
          </div>
        </div>

        <!-- 2D/3D Campus Spatial Teaser Banner -->
        <div class="digital-twin-banner" onclick="window.hostelApp.switchView('campus-map')">
          <div class="dt-banner-content">
            <span class="badge badge-pulse"><i class="fa-solid fa-map-location-dot"></i> 600-Acre Master Map</span>
            <h4>Navigate LPU 58 Blocks</h4>
            <p>Interactive spatial map, block dossiers, and walking time estimates.</p>
          </div>
          <div class="dt-banner-action">
            <button class="btn btn-sm btn-white">Open Map <i class="fa-solid fa-arrow-right"></i></button>
          </div>
        </div>

        <!-- 4-Quadrant Action Grid (CP5 Sketch Screen 3) -->
        <div class="quad-actions-grid">
          <div class="quad-card card-primary" onclick="window.hostelApp.openScreen('report')">
            <div class="quad-icon-box"><i class="fa-solid fa-circle-plus"></i></div>
            <div class="quad-label">Report Complaint</div>
            <div class="quad-desc">Dorm room or Academic block</div>
          </div>
          <div class="quad-card" onclick="window.hostelApp.openScreen('tracking', 'HF1087')">
            <div class="quad-icon-box text-blue-400"><i class="fa-solid fa-list-check"></i></div>
            <div class="quad-label">My Complaints</div>
            <div class="quad-desc">${activeTickets.length} active request(s)</div>
          </div>
          <div class="quad-card" onclick="window.hostelApp.switchView('3d')">
            <div class="quad-icon-box text-amber-400"><i class="fa-solid fa-cube"></i></div>
            <div class="quad-label">3D Room Inspector</div>
            <div class="quad-desc">1-Click 3D diagnosis</div>
          </div>
          <div class="quad-card" onclick="window.hostelApp.openScreen('notifications')">
            <div class="quad-icon-box text-rose-400"><i class="fa-solid fa-bullhorn"></i></div>
            <div class="quad-label">Notices & Delays</div>
            <div class="quad-desc">Visit windows & stock</div>
          </div>
        </div>

        <!-- Active Ticket Live Card (HF1087) -->
        <div class="section-heading">
          <span>Active Complaint In Progress</span>
          <a href="javascript:void(0)" onclick="window.hostelApp.openScreen('tracking', 'HF1087')">View Timeline</a>
        </div>

        <div class="live-ticket-card" onclick="window.hostelApp.openScreen('tracking', 'HF1087')">
          <div class="lt-header">
            <div class="lt-id">
              <span class="badge badge-ticket">#HF1087</span>
              <span class="lt-category"><i class="fa-solid fa-bolt text-amber-400"></i> Electrical</span>
            </div>
            <span class="badge badge-status-progress"><i class="fa-solid fa-spinner fa-spin"></i> In Progress</span>
          </div>

          <h4 class="lt-title">Ceiling Fan Not Working / Humming Loudly</h4>
          <p class="lt-desc">Technician Ramesh Kumar on-site. Motor winding healthy; 2.5µF capacitor replacement underway.</p>

          <div class="lt-footer">
            <div class="lt-tech-pill">
              <i class="fa-solid fa-user-wrench"></i>
              <span>Ramesh Kumar (Electrician)</span>
            </div>
            <div class="lt-eta"><i class="fa-regular fa-clock"></i> Today 10 AM - 12 PM</div>
          </div>
        </div>

        <!-- Two-Way Loop Closure Handshake Prompt -->
        <div class="security-pin-card">
          <div class="spc-text">
            <strong><i class="fa-solid fa-shield-halved text-emerald-400"></i> Anti-Ghost Closure Security PIN:</strong>
            <p>Give this PIN to technician ONLY AFTER fan is tested in your room.</p>
          </div>
          <div class="spc-pin">4829</div>
        </div>
      </div>
    `;
  }

  // --- FACULTY & ACADEMIC PORTAL ---
  renderFacultyHomeScreen() {
    return `
      <div class="screen-view faculty-view">
        <div class="app-topbar faculty-topbar">
          <div class="brand-left">
            <div class="brand-logo-icon bg-blue-600"><i class="fa-solid fa-chalkboard-user"></i></div>
            <div>
              <div class="brand-title">Faculty Academic Services</div>
              <div class="brand-sub">Dr. Ananya Sen • Block 14 & 34 (SCSE)</div>
            </div>
          </div>
          <div class="brand-right">
            <button class="icon-btn" onclick="window.hostelApp.switchRole('student')"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
          </div>
        </div>

        <div class="quad-actions-grid mt-2">
          <div class="quad-card card-primary" onclick="window.hostelApp.openScreen('report')">
            <div class="quad-icon-box"><i class="fa-solid fa-video"></i></div>
            <div class="quad-label">Report Lab / AV Issue</div>
            <div class="quad-desc">Smartboards, projectors, HVAC</div>
          </div>
          <div class="quad-card" onclick="window.hostelApp.openScreen('tracking', 'AC3401')">
            <div class="quad-icon-box text-blue-400"><i class="fa-solid fa-list-check"></i></div>
            <div class="quad-label">Department Tickets</div>
            <div class="quad-desc">1 active in Block 34</div>
          </div>
        </div>

        <div class="section-heading mt-3">
          <span>Active Academic Work Order</span>
        </div>

        <div class="live-ticket-card" onclick="window.hostelApp.openScreen('tracking', 'AC3401')">
          <div class="lt-header">
            <span class="badge badge-ticket">#AC3401</span>
            <span class="badge badge-status-progress">In Progress</span>
          </div>
          <h4 class="lt-title">Smartboard Touch Calibration Dead (Block 34 Lab 204)</h4>
          <p class="lt-desc">Harwinder Bawa (Smart AV Specialist) assigned. Replacing IR sensor ribbon cable before next lecture.</p>
          <div class="lt-footer">
            <span><i class="fa-solid fa-user-gear"></i> Harwinder Bawa</span>
            <span class="text-amber-400">ETA: 11:30 AM</span>
          </div>
        </div>
      </div>
    `;
  }

  // --- SCREEN 4: REPORT COMPLAINT (WITH AI TRIAGE) ---
  renderReportScreen() {
    const data = window.LPU_CAMPUS_DATA || {};
    const blocks = data.blocks || [];

    return `
      <div class="screen-view report-view">
        <div class="sub-screen-header">
          <button class="back-btn" onclick="window.hostelApp.openScreen('student-home')"><i class="fa-solid fa-arrow-left"></i></button>
          <h3>Report Maintenance Issue</h3>
          <div class="spacer"></div>
        </div>

        <!-- AI Duplicate Detection Banner -->
        <div id="duplicate-warning" class="duplicate-alert" style="display: none;">
          <div class="alert-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="alert-content">
            <strong>Similar Issue Already Reported on This Floor/Wing!</strong>
            <p>Ticket #HF1082 (Water Cooler 3rd Floor) is already active. Tap below to subscribe instead of duplicating.</p>
            <button type="button" class="btn btn-sm btn-white mt-1" onclick="window.hostelApp.openScreen('tracking', 'HF1082')">View Ticket #HF1082</button>
          </div>
        </div>

        <form id="report-form" class="form-container" onsubmit="window.hostelApp.handleComplaintSubmit(event)">
          <!-- Campus Block Selector -->
          <div class="form-group">
            <label><i class="fa-solid fa-building"></i> Campus Block / Hostel *</label>
            <select id="form-block" class="input-select" required>
              <optgroup label="Residential Hostels">
                <option value="BH-4 (Block 48)" selected>BH-4 Nilgiri (Boys Hostel 4)</option>
                <option value="BH-1 (Block 43)">BH-1 Shivalik (Boys Hostel 1)</option>
                <option value="BH-2 (Block 45)">BH-2 Himalaya (Boys Hostel 2)</option>
                <option value="BH-3 (Block 46)">BH-3 Aravali (Boys Hostel 3)</option>
                <option value="GH-1 (Block 09)">GH-1 Ganga (Girls Hostel 1)</option>
                <option value="GH-2 (Block 10)">GH-2 Yamuna (Girls Hostel 2)</option>
              </optgroup>
              <optgroup label="Academic & Research Towers">
                <option value="Block 34 (SCSE Tech Tower)">Block 34 (SCSE Google Chrome Lab)</option>
                <option value="Block 37 (Central Library)">Block 37 (LPU Central Library)</option>
                <option value="Block 14 (Mittal Business)">Block 14 (Mittal School of Business)</option>
                <option value="Block 15 (Uni-Mall)">Block 15 (Uni-Mall & Hotel Management)</option>
                <option value="Block 55 (Mechanical)">Block 55 (Mechanical Engineering)</option>
              </optgroup>
            </select>
          </div>

          <div class="form-group-row">
            <div class="form-group">
              <label>Floor *</label>
              <input type="text" id="form-floor" class="input-text" value="3rd Floor" required />
            </div>
            <div class="form-group">
              <label>Room / Lab No. *</label>
              <input type="text" id="form-room" class="input-text" value="312" required />
            </div>
          </div>

          <!-- Trade Category -->
          <div class="form-group">
            <label>Issue Category *</label>
            <select id="form-category" class="input-select" onchange="window.hostelApp.handleCategoryChange(this.value)" required>
              <option value="electrical" selected>Electrical (Fan, Light, Sockets, Geyser)</option>
              <option value="plumbing">Plumbing & Water Supply (Tap, Drain, Cistern)</option>
              <option value="carpentry">Carpentry & Furniture (Door Lock, Desk, Bed)</option>
              <option value="civil">Civil & Masonry (Wall Seepage, Tile Crack)</option>
              <option value="hvac">HVAC & Water Coolers</option>
              <option value="it">Network, Wi-Fi & Smart Classroom AV</option>
            </select>
          </div>

          <div class="form-group">
            <label>Specific Component *</label>
            <select id="form-subcategory" class="input-select" required>
              <option value="Ceiling Fan Not Working / Humming">Ceiling Fan Not Working / Humming</option>
              <option value="LED Tube Light Blinking / Dead">LED Tube Light Blinking / Dead</option>
              <option value="Study Table Socket Not Working">Study Table Socket Not Working</option>
              <option value="Geyser Not Heating / Sparking">Geyser Not Heating / Sparking</option>
            </select>
          </div>

          <div class="form-group">
            <label>Problem Description *</label>
            <textarea id="form-description" class="input-textarea" rows="3" oninput="window.hostelApp.checkDuplicateDetection(this.value)" required placeholder="Describe the problem in detail...">Ceiling fan stopped rotating properly yesterday night. When turned to speed 5, it just hums loudly and moves at crawl speed. Likely capacitor blown.</textarea>
          </div>

          <!-- Preferred Visit Slot -->
          <div class="form-group">
            <label><i class="fa-regular fa-clock"></i> Preferred Visit Window (When You Are In Room)</label>
            <select id="form-slot" class="input-select">
              <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
              <option value="Afternoon (02:00 PM - 04:00 PM)">Afternoon (02:00 PM - 04:00 PM)</option>
              <option value="Evening (05:00 PM - 07:00 PM) [After Lectures]">Evening (05:00 PM - 07:00 PM) [After Lectures]</option>
              <option value="Weekend Full Day">Weekend Full Day</option>
            </select>
          </div>

          <!-- Photo Upload Zone -->
          <div class="photo-upload-zone" onclick="window.hostelApp.triggerPhotoMock()">
            <div class="puz-icon"><i class="fa-solid fa-camera"></i></div>
            <div class="puz-text">
              <strong>Add Equipment Photograph (Optional)</strong>
              <span>Helps technician bring genuine spare parts on the first visit</span>
            </div>
            <div id="photo-preview-name" class="puz-filename text-emerald-400 font-semibold" style="display:none;">fan_capacitor_burn.jpg (Attached)</div>
          </div>

          <!-- Urgent Checkbox -->
          <div class="urgency-checkbox-row">
            <label class="custom-checkbox">
              <input type="checkbox" id="form-emergency">
              <span class="checkmark"></span>
              <span class="checkbox-label"><strong>Urgent / Electrical Hazard</strong> (Sparks, water flooding, exposed wires)</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-submit-complaint">
            <i class="fa-solid fa-paper-plane"></i> Submit Complaint
          </button>
        </form>
      </div>
    `;
  }

  // --- SCREEN 5: SUBMISSION ACKNOWLEDGEMENT ---
  renderAcknowledgementScreen() {
    const t = this.getTicket(this.activeTicketId) || this.tickets[0];

    return `
      <div class="screen-view ack-view">
        <div class="ack-card">
          <div class="sunburst-wrapper">
            <div class="sunburst-circle"><i class="fa-solid fa-check"></i></div>
          </div>

          <h2 class="ack-title">Complaint Submitted!</h2>
          <p class="ack-sub">Your maintenance request is registered and assigned to facilities dispatch queue.</p>

          <div class="token-id-container">
            <div class="token-label">Official Complaint Reference Token</div>
            <div class="token-id-badge">
              <span>${t.id}</span>
              <button class="btn-copy-token" onclick="window.hostelApp.copyToken('${t.id}')"><i class="fa-regular fa-copy"></i></button>
            </div>
          </div>

          <div class="ack-details-pill">
            <div class="pill-row"><span>Equipment:</span> <strong>${t.subcategory}</strong></div>
            <div class="pill-row"><span>Location:</span> <strong>${t.hostel} • Room ${t.room}</strong></div>
            <div class="pill-row"><span>Target SLA:</span> <strong class="text-emerald-400">Under 12 Hours</strong></div>
          </div>

          <div class="omni-channel-proof">
            <div class="channel-item"><i class="fa-brands fa-whatsapp text-emerald-400"></i> WhatsApp confirmation dispatched to +91 98140-12345</div>
            <div class="channel-item"><i class="fa-regular fa-comment-dots text-blue-400"></i> SMS Token generated with LPU Facilities</div>
          </div>

          <div class="ack-actions">
            <button class="btn btn-primary w-full" onclick="window.hostelApp.openScreen('tracking', '${t.id}')">
              <i class="fa-solid fa-route"></i> Track Status & Live Timeline
            </button>
            <button class="btn btn-outline w-full" onclick="window.hostelApp.openScreen('student-home')">
              <i class="fa-solid fa-house"></i> Return to Home
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- SCREEN 6: TRACKING & PROGRESS TIMELINE ---
  renderTrackingScreen() {
    const t = this.getTicket(this.activeTicketId) || this.tickets[0];
    const isSubmittedDone = true;
    const isAssignedDone = ['Assigned', 'In Progress', 'Awaiting Parts', 'Resolved', 'Closed'].includes(t.status);
    const isInProgressDone = ['In Progress', 'Awaiting Parts', 'Resolved', 'Closed'].includes(t.status);
    const isResolvedDone = ['Resolved', 'Closed'].includes(t.status);

    return `
      <div class="screen-view tracking-view">
        <div class="sub-screen-header">
          <button class="back-btn" onclick="window.hostelApp.openScreen('student-home')"><i class="fa-solid fa-arrow-left"></i></button>
          <h3>Complaint Tracking</h3>
          <span class="badge badge-ticket">#${t.id}</span>
        </div>

        <div class="tracking-summary-card">
          <div class="tsc-top">
            <div class="tsc-badge-row">
              <span class="badge ${this.getStatusBadgeClass(t.status)}">${t.status}</span>
              <span class="tsc-prio prio-${t.priority.toLowerCase()}">${t.priority} Priority</span>
            </div>
            <span class="tsc-time text-slate-400 text-xs">${t.createdAt}</span>
          </div>
          <h4 class="tsc-title">${t.subcategory}</h4>
          <p class="tsc-desc">${t.description}</p>
          <div class="tsc-loc"><i class="fa-solid fa-location-dot text-rose-400"></i> ${t.hostel} • Floor ${t.floor} • Room ${t.room}</div>
        </div>

        <!-- 4-Step Vertical Timeline (CP5 Sketch Screen 6) -->
        <div class="timeline-container">
          <h4 class="section-title"><i class="fa-solid fa-stairs text-blue-400"></i> Live Resolution Timeline</h4>

          <div class="timeline-item ${isSubmittedDone ? 'completed' : ''}">
            <div class="timeline-dot"><i class="fa-solid fa-check"></i></div>
            <div class="timeline-content">
              <div class="tl-title-row"><strong>Complaint Submitted</strong> <span class="tl-date">${t.createdAt}</span></div>
              <p class="tl-sub">Reference Token #${t.id} verified. Dispatched to Warden queue.</p>
            </div>
          </div>

          <div class="timeline-item ${isAssignedDone ? 'completed' : 'active'}">
            <div class="timeline-dot"><i class="fa-solid ${isAssignedDone ? 'fa-check' : 'fa-user-clock'}"></i></div>
            <div class="timeline-content">
              <div class="tl-title-row"><strong>Assigned to Maintenance</strong> <span class="tl-date">${t.assignedTo ? t.assignedTo.assignedAt : 'Pending'}</span></div>
              ${t.assignedTo ? `
                <div class="assigned-tech-card">
                  <div class="tech-avatar"><i class="fa-solid fa-wrench"></i></div>
                  <div class="tech-info">
                    <div class="tech-name">${t.assignedTo.name}</div>
                    <div class="tech-trade">${t.assignedTo.trade}</div>
                  </div>
                  <a href="tel:+919876543210" class="btn-call-tech"><i class="fa-solid fa-phone"></i></a>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="timeline-item ${t.status === 'Awaiting Parts' ? 'delayed' : (isInProgressDone ? 'completed' : '')}">
            <div class="timeline-dot"><i class="fa-solid ${t.status === 'Awaiting Parts' ? 'fa-triangle-exclamation' : (isInProgressDone ? 'fa-screwdriver-wrench' : 'fa-hourglass')}"></i></div>
            <div class="timeline-content">
              <div class="tl-title-row"><strong>${t.status === 'Awaiting Parts' ? 'Awaiting Parts (Delayed)' : 'In Repair'}</strong> <span class="tl-date">${t.scheduledVisit || 'Today'}</span></div>
              ${t.progressNotes && t.progressNotes.length > 0 ? `
                <div class="progress-notes-box">
                  <div class="pnote-author"><i class="fa-solid fa-comment-dots"></i> Latest Staff Remark:</div>
                  <div class="pnote-text">"${t.progressNotes[t.progressNotes.length - 1].text}"</div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="timeline-item ${isResolvedDone ? 'completed active-verification' : ''}">
            <div class="timeline-dot"><i class="fa-solid ${isResolvedDone ? 'fa-flag-checkered' : 'fa-circle'}"></i></div>
            <div class="timeline-content">
              <div class="tl-title-row"><strong>Resolution & Loop Closure</strong> <span class="tl-date">${isResolvedDone ? 'Awaiting Verification' : 'Pending'}</span></div>
              <p class="tl-sub">Requires Two-Way Verification from student before ticket can close.</p>
            </div>
          </div>
        </div>

        <!-- Loop Closure Prompt -->
        ${t.status === 'Resolved' ? `
          <div class="verification-prompt-box">
            <div class="vpb-header">
              <i class="fa-solid fa-handshake-simple text-purple-400"></i>
              <div>
                <h4>Technician Marked Work Complete!</h4>
                <span>Does the equipment actually work? Close the loop or reopen.</span>
              </div>
            </div>
            <div class="vpb-actions">
              <button class="btn btn-primary" onclick="window.hostelApp.openScreen('feedback', '${t.id}')">
                <i class="fa-solid fa-circle-check"></i> Verify & Confirm Resolution
              </button>
              <button class="btn btn-danger-outline" onclick="window.hostelApp.reopenTicket('${t.id}')">
                <i class="fa-solid fa-arrow-rotate-left"></i> Not Fixed! Reopen Ticket
              </button>
            </div>
          </div>
        ` : ''}

        <div class="security-pin-card">
          <div class="spc-text">
            <strong><i class="fa-solid fa-shield-halved text-emerald-400"></i> Two-Way Handshake PIN:</strong>
            <p>Give this PIN to technician only after testing the equipment.</p>
          </div>
          <div class="spc-pin">${t.verificationPin || '4829'}</div>
        </div>
      </div>
    `;
  }

  // --- SCREEN 7: NOTIFICATIONS HUB ---
  renderNotificationsScreen() {
    return `
      <div class="screen-view notifs-view">
        <div class="sub-screen-header">
          <button class="back-btn" onclick="window.hostelApp.openScreen('student-home')"><i class="fa-solid fa-arrow-left"></i></button>
          <h3>Notifications</h3>
          <button class="btn-clear-notifs" onclick="window.hostelApp.markAllNotificationsRead()"><i class="fa-solid fa-check-double"></i> Mark read</button>
        </div>

        <div class="notifs-list">
          ${this.notifications.map(n => `
            <div class="notif-item-card ${n.read ? 'read' : 'unread'}" onclick="window.hostelApp.openScreen('tracking', '${n.ticketId}')">
              <div class="notif-icon-bubble type-${n.type}"><i class="fa-solid ${n.icon}"></i></div>
              <div class="notif-body">
                <div class="notif-title-row">
                  <span class="notif-title">${n.title}</span>
                  <span class="notif-time">${n.time}</span>
                </div>
                <div class="notif-text">${n.text}</div>
                <div class="notif-meta">
                  <span class="badge badge-ticket">#${n.ticketId}</span>
                  <span class="notif-tap-hint">Tap to view timeline <i class="fa-solid fa-chevron-right"></i></span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- SCREEN 8: STAFF / WARDEN DASHBOARD ---
  renderStaffDashboardScreen() {
    const newCount = this.tickets.filter(t => t.status === 'Submitted').length;
    const inProgressCount = this.tickets.filter(t => ['In Progress', 'Assigned', 'Awaiting Parts'].includes(t.status)).length;
    const resolvedCount = this.tickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length;

    return `
      <div class="screen-view warden-view">
        <div class="app-topbar warden-topbar">
          <div class="brand-left">
            <div class="brand-logo-icon bg-purple-600"><i class="fa-solid fa-building-shield"></i></div>
            <div>
              <div class="brand-title">Warden Operations</div>
              <div class="brand-sub">BH-3 & BH-4 Complex • LPU Facilities</div>
            </div>
          </div>
          <div class="brand-right">
            <span class="badge badge-purple">Mr. Harpreet Singh</span>
            <button class="icon-btn" onclick="window.hostelApp.switchRole('student')"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
          </div>
        </div>

        <div class="quad-actions-grid warden-kpis">
          <div class="quad-card card-purple">
            <div class="quad-icon-box"><i class="fa-solid fa-inbox"></i></div>
            <div class="quad-number">${newCount}</div>
            <div class="quad-label">New Complaints</div>
          </div>
          <div class="quad-card card-blue">
            <div class="quad-icon-box"><i class="fa-solid fa-wrench"></i></div>
            <div class="quad-number">${inProgressCount}</div>
            <div class="quad-label">In Progress</div>
          </div>
          <div class="quad-card card-emerald">
            <div class="quad-icon-box"><i class="fa-regular fa-circle-check"></i></div>
            <div class="quad-number">${resolvedCount}</div>
            <div class="quad-label">Resolved</div>
          </div>
          <div class="quad-card" onclick="window.hostelApp.openScreen('admin-telemetry')">
            <div class="quad-icon-box text-amber-400"><i class="fa-solid fa-chart-line"></i></div>
            <div class="quad-number">94.8%</div>
            <div class="quad-label">SLA Rate</div>
          </div>
        </div>

        <div class="warden-queue-header">
          <h4 class="section-title"><i class="fa-solid fa-list-check text-purple-400"></i> Dispatch Queue</h4>
        </div>

        <div class="warden-ticket-list">
          ${this.tickets.map(t => `
            <div class="w-ticket-card" onclick="window.hostelApp.openWardenUpdateModal('${t.id}')">
              <div class="wt-top">
                <span class="badge badge-ticket">#${t.id}</span>
                <span class="badge ${this.getStatusBadgeClass(t.status)}">${t.status}</span>
              </div>
              <div class="wt-title">${t.subcategory}</div>
              <div class="wt-meta"><i class="fa-solid fa-location-dot"></i> ${t.hostel} • Room ${t.room} • ${t.studentName}</div>
              <div class="wt-footer">
                <span><i class="fa-solid fa-user-gear"></i> ${t.assignedTo ? t.assignedTo.name : '<strong class="text-rose-400">Tap to Assign</strong>'}</span>
                <button class="btn btn-xs btn-primary">Update <i class="fa-solid fa-chevron-right"></i></button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- SCREEN 9: UPDATE COMPLAINT (STAFF / WARDEN) ---
  renderStaffUpdateScreen() {
    const t = this.getTicket(this.activeTicketId) || this.tickets[0];
    const technicians = window.LPU_CAMPUS_DATA ? window.LPU_CAMPUS_DATA.technicians : [];

    return `
      <div class="screen-view staff-update-view">
        <div class="sub-screen-header">
          <button class="back-btn" onclick="window.hostelApp.openScreen('staff-dashboard')"><i class="fa-solid fa-arrow-left"></i></button>
          <h3>Update Complaint Status</h3>
          <span class="badge badge-ticket">#${t.id}</span>
        </div>

        <form id="staff-update-form" class="form-container" onsubmit="window.hostelApp.handleStaffUpdateSubmit(event, '${t.id}')">
          <div class="form-group">
            <label><i class="fa-solid fa-user-gear"></i> Assign Maintenance Technician *</label>
            <select id="update-technician" class="input-select" required>
              ${technicians.map(tech => `
                <option value="${tech.id}" ${t.assignedTo && t.assignedTo.id === tech.id ? 'selected' : ''}>
                  ${tech.name} (${tech.trade}) - ${tech.activeJobs} Active Jobs
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Update Status *</label>
            <select id="update-status" class="input-select" required>
              <option value="Assigned" ${t.status === 'Assigned' ? 'selected' : ''}>Assigned (Dispatched)</option>
              <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress (Work Underway)</option>
              <option value="Awaiting Parts" ${t.status === 'Awaiting Parts' ? 'selected' : ''}>Awaiting Parts (Requisition Sent)</option>
              <option value="Resolved" ${t.status === 'Resolved' ? 'selected' : ''}>Resolved (Handshake Verification Required)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Technician Visit Window</label>
            <input type="text" id="update-visit" class="input-text" value="${t.scheduledVisit || 'Today 10:00 AM – 12:00 PM'}" />
          </div>

          <div class="form-group">
            <label>Staff Remarks / Replacement Parts *</label>
            <textarea id="update-remarks" class="input-textarea" rows="3" required>Issue fixed. Replaced 2.5µF capacitor with genuine Havells spare from sub-store. Speed restored.</textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full">
            <i class="fa-solid fa-floppy-disk"></i> Save & Broadcast Update to Student
          </button>
        </form>
      </div>
    `;
  }

  // --- SCREEN 10: FEEDBACK / TWO-WAY VERIFICATION HANDSHAKE ---
  renderFeedbackScreen() {
    const t = this.getTicket(this.activeTicketId) || this.tickets[0];

    return `
      <div class="screen-view feedback-view">
        <div class="sub-screen-header">
          <button class="back-btn" onclick="window.hostelApp.openScreen('tracking', '${t.id}')"><i class="fa-solid fa-arrow-left"></i></button>
          <h3>Give Feedback & Close Loop</h3>
          <span class="badge badge-ticket">#${t.id}</span>
        </div>

        <div class="feedback-card">
          <div class="fc-header">
            <div class="fc-badge"><i class="fa-solid fa-circle-check text-emerald-400"></i> Two-Way Handshake</div>
            <h4>Complaint ID : ${t.id}</h4>
            <p class="text-sm text-slate-400">${t.subcategory} • ${t.hostel} Room ${t.room}</p>
          </div>

          <form id="feedback-form" class="form-container" onsubmit="window.hostelApp.handleFeedbackSubmit(event, '${t.id}')">
            <div class="form-group">
              <label class="font-bold text-base mb-2 block">Was your issue resolved?</label>
              <div class="radio-toggle-group">
                <label class="radio-pill active" onclick="window.hostelApp.toggleFeedbackResolved(true, this)">
                  <input type="radio" name="issue-resolved" value="yes" checked />
                  <i class="fa-solid fa-check"></i> Yes, completely fixed!
                </label>
                <label class="radio-pill" onclick="window.hostelApp.toggleFeedbackResolved(false, this)">
                  <input type="radio" name="issue-resolved" value="no" />
                  <i class="fa-solid fa-xmark"></i> No, still broken
                </label>
              </div>
            </div>

            <div id="rating-container" class="form-group">
              <label class="font-bold text-base mb-2 block">Rate the service:</label>
              <div class="star-rating-row">
                <span class="star-btn active" data-star="1" onclick="window.hostelApp.setStarRating(1)"><i class="fa-solid fa-star"></i></span>
                <span class="star-btn active" data-star="2" onclick="window.hostelApp.setStarRating(2)"><i class="fa-solid fa-star"></i></span>
                <span class="star-btn active" data-star="3" onclick="window.hostelApp.setStarRating(3)"><i class="fa-solid fa-star"></i></span>
                <span class="star-btn active" data-star="4" onclick="window.hostelApp.setStarRating(4)"><i class="fa-solid fa-star"></i></span>
                <span class="star-btn active" data-star="5" onclick="window.hostelApp.setStarRating(5)"><i class="fa-solid fa-star"></i></span>
              </div>
              <input type="hidden" id="star-value" value="5" />
            </div>

            <div class="form-group">
              <label>Additional Comments</label>
              <textarea id="feedback-comments" class="input-textarea" rows="3">Technician Ramesh Kumar arrived on time, was polite, and fixed the fan cleanly.</textarea>
            </div>

            <button type="submit" class="btn btn-primary w-full">
              <i class="fa-solid fa-check-to-slot"></i> Submit Verification & Close Ticket
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // --- TECHNICIAN MOBILE PORTAL ---
  renderTechnicianScreen() {
    const techTickets = this.tickets.filter(t => t.assignedTo && t.assignedTo.name.includes('Ramesh'));

    return `
      <div class="screen-view technician-view">
        <div class="app-topbar tech-topbar">
          <div class="brand-left">
            <div class="brand-logo-icon bg-amber-600"><i class="fa-solid fa-toolbox"></i></div>
            <div>
              <div class="brand-title">Technician Mobile Field Ops</div>
              <div class="brand-sub">Ramesh Kumar • Senior Electrician</div>
            </div>
          </div>
          <div class="brand-right">
            <button class="icon-btn" onclick="window.hostelApp.switchRole('student')"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
          </div>
        </div>

        <div class="tech-jobs-header">
          <h4><i class="fa-solid fa-clipboard-list text-amber-400"></i> Today's Assigned Work Orders (${techTickets.length})</h4>
          <span class="badge badge-amber">BH-4 Sector</span>
        </div>

        <div class="tech-job-cards">
          ${techTickets.map(t => `
            <div class="tech-card">
              <div class="tc-top">
                <span class="badge badge-ticket">#${t.id}</span>
                <span class="badge ${this.getStatusBadgeClass(t.status)}">${t.status}</span>
              </div>
              <div class="tc-room"><i class="fa-solid fa-door-closed text-blue-400"></i> ${t.hostel} • Room ${t.room}</div>
              <div class="tc-title">${t.subcategory}</div>
              <div class="tc-slot"><i class="fa-regular fa-clock"></i> Scheduled: ${t.scheduledVisit}</div>

              <div class="tc-actions">
                <button class="btn btn-sm btn-outline" onclick="window.hostelApp.openScreen('staff-update', '${t.id}')">Update Log</button>
                <button class="btn btn-sm btn-primary" onclick="window.hostelApp.markTechComplete('${t.id}')">Mark Complete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- ADMIN TELEMETRY ---
  renderAdminTelemetryScreen() {
    const data = window.LPU_CAMPUS_DATA || {};
    const inventory = data.inventory || [];
    const preventive = data.preventiveSchedules || [];

    return `
      <div class="screen-view admin-view">
        <div class="sub-screen-header">
          <button class="back-btn" onclick="window.hostelApp.openScreen('staff-dashboard')"><i class="fa-solid fa-arrow-left"></i></button>
          <h3>LPU Facilities Telemetry & Asset Hub</h3>
          <div class="spacer"></div>
        </div>

        <div class="admin-charts-grid">
          <div class="admin-chart-card">
            <h4><i class="fa-solid fa-chart-pie text-amber-400"></i> Complaints by Category (LPU Hostels)</h4>
            <div class="chart-canvas-box"><canvas id="categoryDonutChart"></canvas></div>
          </div>
          <div class="admin-chart-card">
            <h4><i class="fa-solid fa-chart-column text-emerald-400"></i> SLA Resolution Turnaround (Hours)</h4>
            <div class="chart-canvas-box"><canvas id="slaBarChart"></canvas></div>
          </div>
        </div>

        <!-- Spare Parts Register -->
        <div class="admin-table-card">
          <div class="atc-header">
            <h4><i class="fa-solid fa-boxes-stacked text-blue-400"></i> Smart Spare Parts Stock Register</h4>
            <span class="badge badge-outline">Depot Bay 40</span>
          </div>
          <table class="admin-table">
            <thead>
              <tr><th>Part Description</th><th>Stock</th><th>Threshold</th><th>Depot Location</th></tr>
            </thead>
            <tbody>
              ${inventory.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td><span class="stock-badge ${item.stock <= item.minThreshold ? 'stock-low' : 'stock-ok'}">${item.stock} ${item.unit}</span></td>
                  <td>${item.minThreshold}</td>
                  <td class="text-xs text-slate-400">${item.location}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Preventive Schedules -->
        <div class="admin-table-card mt-3">
          <div class="atc-header">
            <h4><i class="fa-solid fa-shield-virus text-purple-400"></i> Campus Preventive Inspection Schedules</h4>
          </div>
          <div class="pm-list">
            ${preventive.map(pm => `
              <div class="pm-item">
                <div class="pm-info">
                  <strong>${pm.target}</strong>
                  <div class="pm-meta">${pm.block} • ${pm.cadence}</div>
                  <div class="pm-checklist">Checklist: ${pm.checklist.join(' • ')}</div>
                </div>
                <div class="pm-status">
                  <span class="badge badge-emerald">${pm.status}</span>
                  <div class="text-xs text-slate-400 mt-1">Due: ${pm.nextDue}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* =========================================================================
   * EVENT HANDLERS & ACTIONS
   * ========================================================================= */
  handleComplaintSubmit(e) {
    e.preventDefault();
    const block = document.getElementById('form-block').value;
    const room = document.getElementById('form-room').value;
    const floor = document.getElementById('form-floor').value;
    const category = document.getElementById('form-category').value;
    const subcategory = document.getElementById('form-subcategory').value;
    const desc = document.getElementById('form-description').value;
    const slot = document.getElementById('form-slot').value;
    const isEmergency = document.getElementById('form-emergency').checked;

    const newId = 'HF' + (1090 + this.tickets.length);
    const newTicket = {
      id: newId,
      category: category,
      subcategory: subcategory,
      hostel: block,
      floor: floor,
      room: room,
      studentName: 'Aarav Sharma',
      studentReg: '12204561',
      studentPhone: '+91 98140 12345',
      description: desc,
      photo: 'attached_photo.jpg',
      createdAt: 'Just now',
      priority: isEmergency ? 'Critical' : 'Medium',
      status: 'Submitted',
      assignedTo: null,
      scheduledVisit: slot,
      progressNotes: [{ time: 'Just now', author: 'System', text: `Complaint registered with ID #${newId}. Priority: ${isEmergency ? 'Critical' : 'Standard'}.` }],
      partsUsed: [],
      verificationPin: Math.floor(1000 + Math.random() * 9000).toString(),
      feedback: null
    };

    this.tickets.unshift(newTicket);
    this.activeTicketId = newId;

    // Asynchronous backend REST sync when live FastAPI server is active
    if (this.isBackendConnected) {
      fetch(`${this.apiBaseUrl}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category,
          subcategory: subcategory,
          hostel: block,
          room: room,
          floor: parseInt(floor) || 3,
          description: desc,
          student_name: 'Aarav Sharma',
          student_phone: '+91 98140 12345',
          preferred_slot: slot
        })
      }).catch(err => console.log('Offline fallback sync active:', err));
    }

    this.notifications.unshift({
      id: 'N' + Date.now(),
      ticketId: newId,
      title: 'Complaint Logged Successfully',
      text: `Your maintenance ticket #${newId} has been registered and assigned to facilities queue.`,
      time: 'Just now',
      read: false,
      icon: 'fa-check',
      type: 'info'
    });

    if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    this.showToast(`Complaint #${newId} logged successfully!`, 'success');
    this.openScreen('acknowledgement', newId);
  }

  handleStaffUpdateSubmit(e, ticketId) {
    e.preventDefault();
    const techId = document.getElementById('update-technician').value;
    const status = document.getElementById('update-status').value;
    const visit = document.getElementById('update-visit').value;
    const remarks = document.getElementById('update-remarks').value;

    const t = this.getTicket(ticketId);
    if (!t) return;

    const techList = window.LPU_CAMPUS_DATA ? window.LPU_CAMPUS_DATA.technicians : [];
    const tech = techList.find(x => x.id === techId) || { name: 'Assigned Staff', trade: 'Technician' };

    t.assignedTo = { id: tech.id, name: tech.name, trade: tech.trade, assignedAt: 'Just now' };
    t.status = status;
    t.scheduledVisit = visit;
    t.progressNotes.push({ time: 'Just now', author: `Staff (${tech.name})`, text: remarks });

    this.notifications.unshift({
      id: 'N' + Date.now(),
      ticketId: ticketId,
      title: `Status Updated: ${status}`,
      text: remarks,
      time: 'Just now',
      read: false,
      icon: 'fa-wrench',
      type: status === 'Awaiting Parts' ? 'delay' : 'info'
    });

    this.showToast(`Complaint #${ticketId} updated to: ${status}`, 'success');
    this.openScreen('staff-dashboard');
  }

  handleFeedbackSubmit(e, ticketId) {
    e.preventDefault();
    const resolvedYes = document.querySelector('input[name="issue-resolved"]:checked').value === 'yes';
    const rating = parseInt(document.getElementById('star-value').value || '5');
    const comments = document.getElementById('feedback-comments').value;

    const t = this.getTicket(ticketId);
    if (!t) return;

    if (resolvedYes) {
      t.status = 'Closed';
      t.feedback = { resolved: true, rating: rating, comments: comments };
      t.progressNotes.push({ time: 'Just now', author: 'Student (Aarav Sharma)', text: `Confirmed resolution via loop-closure handshake. Rating: ${rating}/5 stars.` });
      if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      this.showToast('Loop Closed! Thank you for validating the repair.', 'success');
      this.openScreen('tracking', ticketId);
    } else {
      this.reopenTicket(ticketId, comments);
    }
  }

  reopenTicket(ticketId, reason = null) {
    const t = this.getTicket(ticketId);
    if (!t) return;
    t.status = 'In Progress';
    t.priority = 'Critical';
    const note = reason || 'Equipment still not functioning after staff inspection. Reopened by student.';
    t.progressNotes.push({ time: 'Just now', author: 'Student Reopen (Escalated)', text: `REOPENED: ${note} Auto-escalated to Chief Warden.` });
    this.showToast(`Ticket #${ticketId} Reopened & Escalated to Chief Warden!`, 'warning');
    this.openScreen('tracking', ticketId);
  }

  markTechComplete(ticketId) {
    const t = this.getTicket(ticketId);
    if (!t) return;
    t.status = 'Resolved';
    t.progressNotes.push({ time: 'Just now', author: 'Ramesh Kumar (Tech)', text: 'Repair finished on-site. Work completed; requested student verification.' });
    this.showToast(`Work order marked completed for #${ticketId}`, 'info');
    this.render();
  }

  handle3DSelection(data) {
    if (data.isCampusBlock) {
      this.showToast(`Selected Block ${data.id}: ${data.name} (${data.activeTickets} tickets)`, 'info');
      if (this.campusMapNav) this.campusMapNav.selectBlock(data.id);
      return;
    }

    if (data.ticketId) {
      this.activeTicketId = data.ticketId;
      this.switchView('hifi');
      this.openScreen('tracking', data.ticketId);
      this.showToast(`Opened Ticket #${data.ticketId} from 3D Inspector!`, 'info');
    }
  }

  handleCategoryChange(cat) {
    const subSelect = document.getElementById('form-subcategory');
    if (!subSelect || !window.LPU_CAMPUS_DATA) return;
    const catData = window.LPU_CAMPUS_DATA.categories.find(c => c.id === cat);
    if (catData) {
      subSelect.innerHTML = catData.subcategories.map(s => `<option value="${s}">${s}</option>`).join('');
    }
  }

  checkDuplicateDetection(text) {
    const warningEl = document.getElementById('duplicate-warning');
    if (!warningEl) return;
    const lower = text.toLowerCase();
    if (lower.includes('water cooler') || lower.includes('cooler') || lower.includes('ro filter')) {
      warningEl.style.display = 'flex';
    } else {
      warningEl.style.display = 'none';
    }
  }

  triggerPhotoMock() {
    const preview = document.getElementById('photo-preview-name');
    if (preview) {
      preview.style.display = 'block';
      this.showToast('Attached photograph: fan_capacitor_burn.jpg (1.8 MB)', 'success');
    }
  }

  copyToken(id) {
    if (navigator.clipboard) navigator.clipboard.writeText(id);
    this.showToast(`Reference Token #${id} copied to clipboard!`, 'info');
  }

  markAllNotificationsRead() {
    this.notifications.forEach(n => n.read = true);
    this.showToast('All notifications marked as read', 'info');
    this.render();
  }

  toggleFeedbackResolved(isYes, labelEl) {
    document.querySelectorAll('.radio-pill').forEach(p => p.classList.remove('active'));
    labelEl.classList.add('active');
    const ratingBox = document.getElementById('rating-container');
    if (ratingBox) ratingBox.style.display = isYes ? 'block' : 'none';
  }

  setStarRating(stars) {
    document.querySelectorAll('.star-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx < stars);
    });
    const starVal = document.getElementById('star-value');
    if (starVal) starVal.value = stars;
  }

  openWardenUpdateModal(ticketId) {
    this.openScreen('staff-update', ticketId);
  }

  getTicket(id) {
    return this.tickets.find(t => t.id === id);
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Submitted': return 'badge-status-new';
      case 'Assigned': return 'badge-status-assigned';
      case 'In Progress': return 'badge-status-progress';
      case 'Awaiting Parts': return 'badge-status-delayed';
      case 'Resolved': return 'badge-status-resolved';
      case 'Closed': return 'badge-status-closed';
      default: return 'badge-status-new';
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : (type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info');
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    const container = document.getElementById('toast-container');
    if (container) {
      container.appendChild(toast);
      setTimeout(() => toast.classList.add('toast-show'), 10);
      setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
  }

  initCharts() {
    setTimeout(() => {
      this.renderCategoryChart();
      this.renderSlaChart();
    }, 250);
  }

  renderCategoryChart() {
    const ctx = document.getElementById('categoryDonutChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (this.chartInstances.category) this.chartInstances.category.destroy();

    this.chartInstances.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Electrical', 'Plumbing', 'Carpentry', 'Civil', 'HVAC', 'Smart IT'],
        datasets: [{
          data: [38, 26, 14, 8, 8, 6],
          backgroundColor: ['#eab308', '#3b82f6', '#f97316', '#8b5cf6', '#06b6d4', '#10b981'],
          borderWidth: 2,
          borderColor: '#1e293b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
      }
    });
  }

  renderSlaChart() {
    const ctx = document.getElementById('slaBarChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (this.chartInstances.sla) this.chartInstances.sla.destroy();

    this.chartInstances.sla = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Electrical (12h)', 'Plumbing (8h)', 'Carpentry (24h)', 'Civil (48h)', 'HVAC (12h)', 'Smart IT (8h)'],
        datasets: [
          { label: 'Avg Turnaround (Hrs)', data: [4.2, 3.1, 8.5, 18.2, 5.4, 2.8], backgroundColor: '#3b82f6', borderRadius: 4 },
          { label: 'Target SLA Ceiling (Hrs)', data: [12, 8, 24, 48, 12, 8], backgroundColor: '#334155', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 9 } } }
        },
        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } }
      }
    });
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.hostelApp = new LpuNexusApp();
});
