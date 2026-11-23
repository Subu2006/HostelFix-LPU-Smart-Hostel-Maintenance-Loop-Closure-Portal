/**
 * HostelFix & LPU NEXUS 360™ — 2D Interactive Campus Spatial Navigator & Master Map
 * 
 * Recreates the full 600-Acre Lovely Professional University (LPU) Master Plan:
 * - Based on official LPU Site Plan Legend & Induction Venue Maps
 * - 6 Functional Zones, 58 Numbered Blocks, 18 Gates, 33 Parking Areas
 * - Linear layout from NH-44 G.T. Road to rear Sports/Hostel/Engineering perimeters
 * - Pathfinding, Walking Time Estimator, Block Dossier, and 1-Click Maintenance Reporting
 */

class CampusMapNavigator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeZone = 'all';
    this.activeType = 'all';
    this.searchQuery = '';
    this.selectedBlock = null;
    this.routeFrom = 'G-01A';
    this.routeTo = 34; // SCSE Block 34 default
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  render() {
    if (!this.container) return;
    const data = window.LPU_CAMPUS_DATA || {};
    const blocks = data.blocks || [];
    const zones = data.zones || [];

    // Filter blocks
    const filteredBlocks = blocks.filter(b => {
      const matchZone = this.activeZone === 'all' || b.zone === this.activeZone;
      const matchType = this.activeType === 'all' || b.type === this.activeType;
      const q = this.searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        b.name.toLowerCase().includes(q) || 
        b.code.toLowerCase().includes(q) || 
        `block ${b.id}`.includes(q) || 
        b.dept.toLowerCase().includes(q);
      return matchZone && matchType && matchSearch;
    });

    let html = `
      <div class="campus-navigator-root">
        <!-- Top Toolbar -->
        <div class="campus-nav-toolbar">
          <div class="cnt-search-box">
            <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
            <input type="text" id="campus-block-search" class="cnt-search-input" placeholder="Search 58 blocks (e.g. Block 34, Central Library, BH-4, Uni-Mall, Hospital)..." value="${this.searchQuery}" oninput="window.campusMapNav.handleSearch(this.value)" />
            ${this.searchQuery ? `<button class="cnt-clear-btn" onclick="window.campusMapNav.handleSearch('')"><i class="fa-solid fa-xmark"></i></button>` : ''}
          </div>

          <!-- Zone Filter Tabs -->
          <div class="cnt-zone-pills">
            <button class="cnt-pill ${this.activeZone === 'all' ? 'active' : ''}" onclick="window.campusMapNav.setZone('all')">All 6 Zones (58 Blocks)</button>
            ${zones.map(z => `
              <button class="cnt-pill ${this.activeZone === z.id ? 'active' : ''}" style="${this.activeZone === z.id ? `background:${z.color}; border-color:${z.color}; color:#fff;` : ''}" onclick="window.campusMapNav.setZone('${z.id}')">
                ${z.name.split('. ')[1] || z.name}
              </button>
            `).join('')}
          </div>

          <!-- Facility Category Filters -->
          <div class="cnt-type-pills">
            <button class="cnt-sub-pill ${this.activeType === 'all' ? 'active' : ''}" onclick="window.campusMapNav.setType('all')">
              <i class="fa-solid fa-shapes"></i> All Types
            </button>
            <button class="cnt-sub-pill ${this.activeType === 'academic' ? 'active' : ''}" onclick="window.campusMapNav.setType('academic')">
              <i class="fa-solid fa-graduation-cap"></i> Academic & Labs
            </button>
            <button class="cnt-sub-pill ${this.activeType === 'hostel' ? 'active' : ''}" onclick="window.campusMapNav.setType('hostel')">
              <i class="fa-solid fa-bed"></i> Residential Hostels
            </button>
            <button class="cnt-sub-pill ${this.activeType === 'commercial' ? 'active' : ''}" onclick="window.campusMapNav.setType('commercial')">
              <i class="fa-solid fa-store"></i> Uni-Mall & Dining
            </button>
            <button class="cnt-sub-pill ${this.activeType === 'sports' ? 'active' : ''}" onclick="window.campusMapNav.setType('sports')">
              <i class="fa-solid fa-futbol"></i> Sports & Stadiums
            </button>
            <button class="cnt-sub-pill ${this.activeType === 'governance' ? 'active' : ''}" onclick="window.campusMapNav.setType('governance')">
              <i class="fa-solid fa-landmark"></i> Governance & Library
            </button>
          </div>
        </div>

        <!-- Main Workspace: Interactive Spatial Map Canvas (Left) + Detail Dossier (Right) -->
        <div class="campus-spatial-stage">
          
          <!-- Left: Spatial Map Visualization (Matching LPU Master Map) -->
          <div class="campus-map-viewport">
            <div class="cmv-header">
              <div class="cmv-title">
                <i class="fa-solid fa-map-location-dot text-primary"></i>
                <span>LPU Linear Township Spatial Layout (600 Acres • NH-44 to Sports Perimeter)</span>
              </div>
              <div class="cmv-legend-mini">
                <span class="leg-item"><span class="leg-dot bg-blue-500"></span> Academic</span>
                <span class="leg-item"><span class="leg-dot bg-amber-500"></span> Hostels</span>
                <span class="leg-item"><span class="leg-dot bg-purple-500"></span> Governance</span>
                <span class="leg-item"><span class="leg-dot bg-orange-500"></span> Commercial</span>
                <span class="leg-item"><span class="leg-dot bg-emerald-500"></span> Sports</span>
              </div>
            </div>

            <!-- Scrollable Linear Campus Master Plan Grid -->
            <div class="spatial-blocks-concourse">
              
              <!-- SECTION 6: NORTH / SPORTS & RESIDENTIAL PERIMETER -->
              <div class="spatial-zone-sector zone-sports" id="sec-zone-6">
                <div class="zone-banner">
                  <span class="zone-badge bg-emerald-500/20 text-emerald-400">Zone 6</span>
                  <strong>Sports Complex & Residential Townships (Eastern Perimeter)</strong>
                  <span class="zone-meta">BH-1 to BH-9 • Shanti Devi Indoor Stadium • Cricket Stadium • 7.5 MW Solar</span>
                </div>
                <div class="blocks-flex-row">
                  ${this.renderBlockCluster(filteredBlocks, [47, 54, 43, 45, 46, 48, 49, 50, 51, 52, 53, 39, 40, 41, 42])}
                </div>
              </div>

              <!-- SECTION 5: HEAVY ENGINEERING & WORKSHOPS (GURUDWARA ROAD) -->
              <div class="spatial-zone-sector zone-eng" id="sec-zone-5">
                <div class="zone-banner">
                  <span class="zone-badge bg-amber-500/20 text-amber-400">Zone 5</span>
                  <strong>Heavy Engineering, Applied Workshops & Polytechnic (Blocks 55 – 58)</strong>
                  <span class="zone-meta">Mechanical • Civil • Heavy Thermal Bays • Student Fabrication Streets</span>
                </div>
                <div class="blocks-flex-row">
                  ${this.renderBlockCluster(filteredBlocks, [55, 56, 57, 58])}
                </div>
              </div>

              <!-- SECTION 4: COMPUTING, ELECTRONICS & KNOWLEDGE HUB -->
              <div class="spatial-zone-sector zone-tech" id="sec-zone-4">
                <div class="zone-banner">
                  <span class="zone-badge bg-blue-500/20 text-blue-400">Zone 4</span>
                  <strong>Computing, Electronics & Knowledge Hub (Blocks 33 – 38)</strong>
                  <span class="zone-meta">School of CSE (Chrome/iMac Labs) • Central Library (10,000 sqm) • Open Auditorium</span>
                </div>
                <div class="blocks-flex-row">
                  ${this.renderBlockCluster(filteredBlocks, [33, 34, 35, 36, 37, 38])}
                </div>
              </div>

              <!-- SECTION 3: CENTRAL GOVERNANCE, ADMISSIONS & RESEARCH SPINE -->
              <div class="spatial-zone-sector zone-gov" id="sec-zone-3">
                <div class="zone-banner">
                  <span class="zone-badge bg-purple-500/20 text-purple-400">Zone 3</span>
                  <strong>Central Governance, Admissions & Research Spine (Blocks 25 – 32)</strong>
                  <span class="zone-meta">Chancellor/VC Office • Admissions & DIA • Placement Cell (Block 32) • Pharmacy & Agriculture</span>
                </div>
                <div class="blocks-flex-row">
                  ${this.renderBlockCluster(filteredBlocks, [25, 26, 27, 28, 29, 30, 31, 32])}
                </div>
              </div>

              <!-- SECTION 2: HUMANITIES, DESIGN & CREATIVE ARTS -->
              <div class="spatial-zone-sector zone-arts" id="sec-zone-2">
                <div class="zone-banner">
                  <span class="zone-badge bg-pink-500/20 text-pink-400">Zone 2</span>
                  <strong>Humanities, Design & Creative Arts Zone (Blocks 16 – 24)</strong>
                  <span class="zone-meta">School of Performing Arts • Uni TV Broadcast • Girls Hostels GH 1–4</span>
                </div>
                <div class="blocks-flex-row">
                  ${this.renderBlockCluster(filteredBlocks, [16, 17, 18, 19, 20, 21, 22, 23, 24, 9, 10, 11])}
                </div>
              </div>

              <!-- SECTION 1: FRONT & GATEWAY ZONE (HIGHWAY PERIMETER NH-44) -->
              <div class="spatial-zone-sector zone-front" id="sec-zone-1">
                <div class="zone-banner">
                  <span class="zone-badge bg-orange-500/20 text-orange-400">Zone 1</span>
                  <strong>Front & Gateway Zone (Blocks 1 – 15)</strong>
                  <span class="zone-meta">Main Gate 1-A & 1-B • 24/7 Hospital • Lovely Unipolis • Uni-Mall • Mittal School of Business</span>
                </div>
                <div class="blocks-flex-row">
                  ${this.renderBlockCluster(filteredBlocks, [1, 2, 3, 4, 5, 6, 7, 8, 12, 13, 14, 15])}
                </div>

                <!-- Main Entrance Highway Roadway -->
                <div class="highway-gate-strip">
                  <div class="hgs-highway"><i class="fa-solid fa-road"></i> National Highway 44 (Jalandhar – Delhi G.T. Road)</div>
                  <div class="hgs-gates">
                    <span class="gate-tag"><i class="fa-solid fa-id-card"></i> Main Gate 1-A (11 RFID Barriers & Visitor Security)</span>
                    <span class="gate-tag"><i class="fa-solid fa-person-walking"></i> Main Gate 1-B (Pedestrian & Girls Transit)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Right: Interactive Block Intelligence Dossier & Pathfinding -->
          <div class="campus-detail-panel">
            ${this.renderDetailPanel()}
          </div>

        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  renderBlockCluster(allFiltered, targetIds) {
    const matched = allFiltered.filter(b => targetIds.includes(b.id));
    if (matched.length === 0) {
      return `<div class="no-blocks-in-cluster text-xs text-slate-500 italic p-2">No blocks matching current filters in this zone.</div>`;
    }

    return matched.map(b => {
      const isSelected = this.selectedBlock && this.selectedBlock.id === b.id;
      const typeClass = `block-type-${b.type}`;
      const hasTickets = b.activeTickets > 0;

      return `
        <div class="spatial-block-chip ${typeClass} ${isSelected ? 'selected' : ''}" onclick="window.campusMapNav.selectBlock(${b.id})">
          <div class="sbc-top">
            <span class="sbc-num">#${b.id}</span>
            ${hasTickets ? `<span class="sbc-ticket-badge" title="${b.activeTickets} Active Infrastructure Tickets"><i class="fa-solid fa-triangle-exclamation"></i> ${b.activeTickets}</span>` : '<span class="sbc-ok-badge"><i class="fa-solid fa-check"></i></span>'}
          </div>
          <div class="sbc-name">${b.name}</div>
          <div class="sbc-meta">${b.dept.length > 32 ? b.dept.substring(0, 32) + '...' : b.dept}</div>
        </div>
      `;
    }).join('');
  }

  renderDetailPanel() {
    const data = window.LPU_CAMPUS_DATA || {};
    const b = this.selectedBlock || data.blocks.find(x => x.id === 34) || data.blocks[0]; // SCSE Block 34 default

    return `
      <div class="dossier-card">
        <!-- Dossier Header -->
        <div class="dossier-header">
          <div class="dossier-tag-row">
            <span class="badge badge-ticket">Block ${b.id} (${b.code})</span>
            <span class="badge ${b.activeTickets > 4 ? 'badge-status-delayed' : (b.activeTickets > 0 ? 'badge-status-progress' : 'badge-emerald')}">
              ${b.activeTickets} Active Tickets
            </span>
          </div>
          <h3 class="dossier-title">${b.name}</h3>
          <div class="dossier-zone-text"><i class="fa-solid fa-location-dot text-rose-400"></i> ${b.dept} • G+${b.floors} Floors</div>
        </div>

        <!-- 1-Click Action Buttons -->
        <div class="dossier-actions-row">
          <button class="btn btn-sm btn-primary w-full" onclick="window.campusMapNav.reportIssueForBlock(${b.id})">
            <i class="fa-solid fa-file-circle-plus"></i> Report Issue in Block ${b.id}
          </button>
          <button class="btn btn-sm btn-outline" onclick="window.campusMapNav.inspectIn3D(${b.id})">
            <i class="fa-solid fa-cube"></i> View in 3D Digital Twin
          </button>
        </div>

        <!-- Active Maintenance Tickets in this Block -->
        <div class="dossier-section">
          <div class="ds-title"><i class="fa-solid fa-screwdriver-wrench text-amber-400"></i> Active Facility Tickets in Block ${b.id}</div>
          <div class="block-tickets-feed">
            ${this.renderBlockTickets(b.id)}
          </div>
        </div>

        <!-- Smart Campus Pathfinding & Transit Estimator -->
        <div class="dossier-section pathfinding-box">
          <div class="ds-title"><i class="fa-solid fa-route text-blue-400"></i> Smart Campus Wayfinding from Main Gate</div>
          <div class="transit-matrix">
            <div class="tm-stat">
              <span class="tm-num text-blue-400">${this.getDistanceEstimate(b.id)} m</span>
              <span class="tm-lbl">From Gate 1-A</span>
            </div>
            <div class="tm-stat">
              <span class="tm-num text-emerald-400">${this.getWalkingTimeEstimate(b.id)} mins</span>
              <span class="tm-lbl">Walking Concourse</span>
            </div>
            <div class="tm-stat">
              <span class="tm-num text-purple-400">${Math.ceil(this.getWalkingTimeEstimate(b.id) / 3)} mins</span>
              <span class="tm-lbl">E-Rickshaw Route</span>
            </div>
          </div>
          
          <div class="wayfinding-trail">
            <div class="trail-step"><i class="fa-solid fa-archway text-orange-400"></i> Gate 1-A (NH-44)</div>
            <div class="trail-arrow"><i class="fa-solid fa-chevron-right"></i></div>
            <div class="trail-step"><i class="fa-solid fa-landmark text-amber-400"></i> Unipolis (Blk 12)</div>
            <div class="trail-arrow"><i class="fa-solid fa-chevron-right"></i></div>
            <div class="trail-step active"><i class="fa-solid fa-location-dot text-emerald-400"></i> Block ${b.id} (${b.name})</div>
          </div>

          <div class="transit-metrics-row text-xs text-slate-400 mt-2 flex justify-between">
            <span><i class="fa-solid fa-shoe-prints text-cyan-400"></i> ~${Math.round(this.getDistanceEstimate(b.id) * 1.3)} Steps</span>
            <span><i class="fa-solid fa-fire text-rose-400"></i> ~${Math.round(this.getDistanceEstimate(b.id) * 0.045)} kcal</span>
            <span><i class="fa-solid fa-wheelchair text-emerald-400"></i> Ramped / Accessible</span>
          </div>

          <div class="transit-tips mt-2">
            <i class="fa-solid fa-person-walking-dashed-line-arrow-right text-slate-400"></i>
            <span>Take Covered Walkway 2 past Lovely Unipolis (Block 12) to stay sheltered from sun/rain.</span>
          </div>
        </div>

        <!-- Block Specifications List -->
        <div class="dossier-section">
          <div class="ds-title"><i class="fa-solid fa-building-circle-check text-emerald-400"></i> Infrastructure Health Telemetry</div>
          <div class="dossier-spec-grid">
            <div class="dsg-item"><span>HVAC Status:</span> <strong class="text-emerald-400">Operational</strong></div>
            <div class="dsg-item"><span>Wi-Fi Coverage:</span> <strong class="text-emerald-400">99.4% (Wi-Fi 6)</strong></div>
            <div class="dsg-item"><span>Passenger Lifts:</span> <strong class="text-amber-400">3/4 Running (1 Maint)</strong></div>
            <div class="dsg-item"><span>Fire Safety:</span> <strong class="text-emerald-400">Inspected Nov 2026</strong></div>
          </div>
        </div>
      </div>
    `;
  }

  renderBlockTickets(blockId) {
    const tickets = window.LPU_CAMPUS_DATA ? window.LPU_CAMPUS_DATA.initialTickets : [];
    const matched = tickets.filter(t => t.blockId === blockId || (t.hostel && t.hostel.includes(`BH-${blockId - 42}`)));

    if (matched.length === 0) {
      return `
        <div class="no-tickets-box">
          <i class="fa-solid fa-circle-check text-emerald-400"></i>
          <span>No active maintenance alerts for this block. All systems normal!</span>
        </div>
      `;
    }

    return matched.map(t => `
      <div class="block-ticket-item" onclick="window.hostelApp.switchView('hifi'); window.hostelApp.openScreen('tracking', '${t.id}')">
        <div class="bti-top">
          <span class="badge badge-ticket">#${t.id}</span>
          <span class="badge ${window.hostelApp ? window.hostelApp.getStatusBadgeClass(t.status) : ''}">${t.status}</span>
        </div>
        <div class="bti-title">${t.subcategory}</div>
        <div class="bti-meta">${t.hostel} • Floor ${t.floor} • Room ${t.room}</div>
      </div>
    `).join('');
  }

  getDistanceEstimate(blockId) {
    // Linear estimate from Gate 1-A (South) to North
    // Block 1 ~ 80m, Block 34 ~ 850m, Block 48 ~ 1400m, Block 58 ~ 1800m
    const factor = Math.min(blockId, 58) * 32;
    return 60 + factor;
  }

  getWalkingTimeEstimate(blockId) {
    const dist = this.getDistanceEstimate(blockId);
    return Math.max(1, Math.round(dist / 80)); // 80 meters per minute average walking pace
  }

  selectBlock(blockId) {
    const data = window.LPU_CAMPUS_DATA || {};
    this.selectedBlock = data.blocks.find(b => b.id === blockId);
    this.render();
  }

  setZone(zoneId) {
    this.activeZone = zoneId;
    this.render();
  }

  setType(typeId) {
    this.activeType = typeId;
    this.render();
  }

  handleSearch(text) {
    this.searchQuery = text;
    this.render();
  }

  reportIssueForBlock(blockId) {
    const data = window.LPU_CAMPUS_DATA || {};
    const b = data.blocks.find(x => x.id === blockId);
    if (!b) return;

    if (window.hostelApp) {
      window.hostelApp.switchView('hifi');
      window.hostelApp.openScreen('report');
      setTimeout(() => {
        const desc = document.getElementById('form-description');
        if (desc) desc.value = `Facility maintenance request for Block ${b.id} (${b.name}) - ${b.dept}. Room/Area: `;
      }, 50);
      window.hostelApp.showToast(`Pre-filled complaint form for Block ${b.id}!`, 'info');
    }
  }

  inspectIn3D(blockId) {
    if (window.hostelApp) {
      window.hostelApp.switchView('3d');
      if (window.hostelApp.explorer3D) {
        window.hostelApp.explorer3D.focusOnBlock(blockId);
      }
      window.hostelApp.showToast(`Flying 3D camera to Block #${blockId}...`, 'info');
    }
  }
}

// Export to window
if (typeof window !== 'undefined') {
  window.CampusMapNavigator = CampusMapNavigator;
}
