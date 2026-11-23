/**
 * HostelFix & LPU NEXUS 360™ — 3D Linear Campus Digital Twin & Facility Inspector
 * Powered by Three.js & OrbitControls
 * 
 * Accurately models the full 600-Acre Lovely Professional University (LPU) Master Plan:
 * - South-to-North Linear Spine from NH-44 G.T. Road to Sports & Hostels
 * - Iconic LPU Entrance Pylon / Monument Water Tower
 * - Stepped Brick Academic Facades & Angled Glass Roofs (matching drone photos)
 * - Lovely Unipolis (Block 12), Mittal Business (Block 14), Uni-Mall (Block 15)
 * - SCSE Tech Corridor (Blocks 33-35) & Central Library (Block 37)
 * - Shanti Devi Mittal Indoor Stadium (Block 47) & Cricket Stadium
 * - Boys Hostels (BH-1 to BH-9) & Girls Hostels (GH-1 to GH-6) with Rooftop Solar
 * - Seamless Deep-Dive into 3D Dorm Room & Smart Classroom Inspectors!
 */

class Campus3DExplorer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.currentMode = 'campus'; // 'campus', 'dorm-room', or 'classroom'
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hotspots = [];
    this.interactiveObjects = [];
    this.animId = null;

    // Room objects
    this.fanGroup = null;
    this.fanBlades = null;
    this.fanSpeed = 0.08;
    this.isFanWobbly = true;
    this.leakParticles = null;
    this.sparkParticles = null;

    // Drone tour animation
    this.isDroneTourActive = false;
    this.droneTourProgress = 0;

    this.onComponentClickCallback = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 900;
    const height = this.container.clientHeight || 550;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090e17);
    this.scene.fog = new THREE.FogExp2(0x090e17, 0.008);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 2000);
    this.camera.position.set(0, 75, 130);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
      this.controls.minDistance = 3;
      this.controls.maxDistance = 350;
      this.controls.target.set(0, 5, -20);
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Build Master Linear Campus
    this.buildLinearCampusScene();

    // 7. Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.renderer.domElement.addEventListener('pointermove', (e) => this.onPointerMove(e));

    // 8. Animation Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupLighting() {
    // Ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    // Sunlight
    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    sunLight.position.set(60, 140, 80);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 400;
    const d = 120;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    // Sky Blue Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.5);
    this.scene.add(hemiLight);
  }

  /* =========================================================================
   * MODE 1: MASTER 600-ACRE LINEAR LPU CAMPUS DIGITAL TWIN
   * ========================================================================= */
  buildLinearCampusScene() {
    this.currentMode = 'campus';
    this.clearSceneObjects();
    this.hotspots = [];
    this.interactiveObjects = [];

    const campusGroup = new THREE.Group();
    campusGroup.name = "LPU_Campus_Group";

    // 1. Vast Terrain Ground (Punjab Lush Green Fields + Central Linear Campus Spine)
    const groundGeo = new THREE.PlaneGeometry(350, 450);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x142018, roughness: 0.9 }); // Dark emerald grass
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.1, -40);
    ground.receiveShadow = true;
    campusGroup.add(ground);

    // Campus Paved Master Concourse (South to North Linear Spine: 60m wide, 360m long)
    const concourseGeo = new THREE.PlaneGeometry(55, 360);
    const concourseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const concourse = new THREE.Mesh(concourseGeo, concourseMat);
    concourse.rotation.x = -Math.PI / 2;
    concourse.position.set(0, 0.05, -40);
    concourse.receiveShadow = true;
    campusGroup.add(concourse);

    // Red Brick Pedestrian Walkway running alongside
    const walkGeo = new THREE.PlaneGeometry(6, 350);
    const walkMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 }); // Red brick paving
    const walkLeft = new THREE.Mesh(walkGeo, walkMat);
    walkLeft.rotation.x = -Math.PI / 2;
    walkLeft.position.set(-18, 0.08, -40);
    campusGroup.add(walkLeft);

    const walkRight = new THREE.Mesh(walkGeo, walkMat);
    walkRight.rotation.x = -Math.PI / 2;
    walkRight.position.set(18, 0.08, -40);
    campusGroup.add(walkRight);

    // 2. NH-44 G.T. Road (South Highway Border)
    this.buildHighwaySection(campusGroup);

    // 3. Iconic LPU Entrance Monument Pylon / Water Tower
    this.buildLpuPylonTower(campusGroup);

    // 4. Front & Gateway Zone (Blocks 1–15, Unipolis 12, Mittal Business 14, Uni-Mall 15, Hospital 3)
    this.buildFrontZone(campusGroup);

    // 5. Central Governance & Research Spine (Blocks 25–32)
    this.buildCentralSpine(campusGroup);

    // 6. Computing & Knowledge Hub (SCSE Blocks 33-35, Flagship Library Block 37, Open Auditorium)
    this.buildComputingHub(campusGroup);

    // 7. Heavy Engineering Zone (Blocks 55–58)
    this.buildHeavyEngineering(campusGroup);

    // 8. Sports Complex & Residential Townships (Stadium 47, Cricket Ground, BH 1-9, GH 1-6)
    this.buildSportsAndHostels(campusGroup);

    // 9. Floating 3D Zone Label Billboards
    this.buildZoneLabelBadges(campusGroup);

    this.scene.add(campusGroup);

    // Position Camera for Grand Linear Overview
    if (this.controls) {
      this.camera.position.set(0, 85, 140);
      this.controls.target.set(0, 10, -30);
      this.controls.update();
    }
    this.updateDiagnosticsUI('campus');
  }

  // --- NH-44 Highway & Main Gate 1-A/1-B ---
  buildHighwaySection(parent) {
    const hwGroup = new THREE.Group();
    hwGroup.position.set(0, 0, 120); // Far South

    // Asphalt Highway (8 Lanes)
    const roadGeo = new THREE.BoxGeometry(280, 0.2, 22);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    hwGroup.add(road);

    // Highway Median Divider
    const medianGeo = new THREE.BoxGeometry(280, 0.6, 1.2);
    const medianMat = new THREE.MeshStandardMaterial({ color: 0x16a34a }); // Green hedges
    const median = new THREE.Mesh(medianGeo, medianMat);
    median.position.y = 0.3;
    hwGroup.add(median);

    // Main Gate 1-A Arch (Grand 11-Barrier Entrance)
    const gateArchGeo = new THREE.BoxGeometry(32, 7.5, 3.5);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const gateArch = new THREE.Mesh(gateArchGeo, gateMat);
    gateArch.position.set(0, 3.75, -12);
    gateArch.castShadow = true;
    hwGroup.add(gateArch);

    // LPU Gate Signboard
    const signGeo = new THREE.BoxGeometry(28, 1.8, 0.2);
    const signMat = new THREE.MeshStandardMaterial({ color: 0xf97316 }); // LPU Orange
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 6.2, -10.1);
    hwGroup.add(sign);

    // 11 Boom Barriers (Striped red/white)
    for (let i = -14; i <= 14; i += 2.8) {
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2);
      const poleMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(i, 0.6, -11);
      hwGroup.add(pole);

      const barrierGeo = new THREE.BoxGeometry(2.4, 0.1, 0.1);
      const barrierMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const barrier = new THREE.Mesh(barrierGeo, barrierMat);
      barrier.position.set(i + 1.2, 0.9, -11);
      hwGroup.add(barrier);
    }

    // Visitor Parking Lots 1 & 2
    const parkGeo = new THREE.BoxGeometry(45, 0.1, 24);
    const parkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const parkLeft = new THREE.Mesh(parkGeo, parkMat);
    parkLeft.position.set(-45, 0.1, -12);
    hwGroup.add(parkLeft);

    const parkRight = new THREE.Mesh(parkGeo, parkMat);
    parkRight.position.set(45, 0.1, -12);
    hwGroup.add(parkRight);

    parent.add(hwGroup);
  }

  // --- Iconic LPU Entrance Monument Pylon / Tower ---
  buildLpuPylonTower(parent) {
    const pylonGroup = new THREE.Group();
    pylonGroup.position.set(-16, 0, 95);

    // Tall Monument Pylon Structure (As seen in drone photo!)
    const shaftGeo = new THREE.BoxGeometry(4.2, 28, 4.2);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.4 }); // LPU Terracotta Orange
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 14;
    shaft.castShadow = true;
    pylonGroup.add(shaft);

    // White Vertical Accent Strip
    const stripeGeo = new THREE.BoxGeometry(1.8, 27, 0.2);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 14, 2.15);
    pylonGroup.add(stripe);

    // Top Water Tank / Beacon Chamber
    const tankGeo = new THREE.CylinderGeometry(3.2, 3.2, 4.5, 24);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 29;
    pylonGroup.add(tank);

    // Glowing Beacon Light on Top
    const beaconGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 31.8;
    pylonGroup.add(beacon);

    parent.add(pylonGroup);
  }

  // --- Front Zone (Blocks 1–15) ---
  buildFrontZone(parent) {
    const fzGroup = new THREE.Group();
    fzGroup.position.set(0, 0, 70);

    // Circular Central Green Rotunda (from aerial drone photo!)
    const rotundaGeo = new THREE.CylinderGeometry(14, 14, 0.3, 32);
    const rotundaMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const rotunda = new THREE.Mesh(rotundaGeo, rotundaMat);
    rotunda.position.set(0, 0.15, 0);
    fzGroup.add(rotunda);

    // Inner Circular Fountain / Art Installation
    const fountainGeo = new THREE.CylinderGeometry(4.5, 5.2, 1.2, 24);
    const fountainMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4 });
    const fountain = new THREE.Mesh(fountainGeo, fountainMat);
    fountain.position.set(0, 0.75, 0);
    fzGroup.add(fountain);

    // Block 3: 24/7 LPU Hospital & Emergency
    this.createBuildingBlock(fzGroup, {
      id: 3,
      name: "LPU 24/7 Hospital & Emergency",
      pos: [24, 0, 10],
      size: [16, 14, 14],
      color: 0xf8fafc,
      floors: 6,
      accentColor: 0xef4444, // Red Cross
      isStepped: false
    });

    // Block 14: Mittal School of Business (MSB)
    this.createBuildingBlock(fzGroup, {
      id: 14,
      name: "Mittal School of Business (MSB)",
      pos: [-24, 0, -10],
      size: [18, 18, 16],
      color: 0x991b1b, // Red brick
      floors: 8,
      accentColor: 0x38bdf8,
      isStepped: true
    });

    // Block 15: Uni-Mall & School of Hotel Management (Commercial Hub)
    this.createBuildingBlock(fzGroup, {
      id: 15,
      name: "Uni-Mall & Uni-Hotel (Block 15)",
      pos: [-26, 0, 14],
      size: [22, 16, 18],
      color: 0x475569,
      floors: 7,
      accentColor: 0xf97316,
      isStepped: false
    });

    // Block 12: Lovely Unipolis (Open Amphitheater Plaza)
    const unipolisGeo = new THREE.CylinderGeometry(15, 18, 3.5, 32);
    const unipolisMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.7 });
    const unipolis = new THREE.Mesh(unipolisGeo, unipolisMat);
    unipolis.position.set(24, 1.75, -12);
    unipolis.userData = { id: 12, name: "Lovely Unipolis (Block 12)", dept: "Cultural Concourse & Amphitheater", isCampusBlock: true, activeTickets: 4 };
    this.interactiveObjects.push(unipolis);
    fzGroup.add(unipolis);

    parent.add(fzGroup);
  }

  // --- Central Governance & Research Spine (Blocks 25–32) ---
  buildCentralSpine(parent) {
    const csGroup = new THREE.Group();
    csGroup.position.set(0, 0, 20);

    // Block 29: Division of Security & University Governance
    this.createBuildingBlock(csGroup, {
      id: 29,
      name: "Division of Security & Governance",
      pos: [-22, 0, 0],
      size: [15, 14, 14],
      color: 0x1e293b,
      floors: 6,
      accentColor: 0x8b5cf6,
      isStepped: false
    });

    // Block 30: Division of Admissions & International Affairs (DIA)
    this.createBuildingBlock(csGroup, {
      id: 30,
      name: "Division of Admissions & DIA",
      pos: [-22, 0, -18],
      size: [16, 14, 14],
      color: 0x334155,
      floors: 6,
      accentColor: 0xa855f7,
      isStepped: true
    });

    // Block 32: Division of Career Services & Placements
    this.createBuildingBlock(csGroup, {
      id: 32,
      name: "Placement Cell & Exam Division (Block 32)",
      pos: [-22, 0, -36],
      size: [18, 18, 15],
      color: 0x7f1d1d,
      floors: 8,
      accentColor: 0x10b981,
      isStepped: true
    });

    // Blocks 25–28: Applied Sciences & Pharmaceutical Research Cluster
    this.createBuildingBlock(csGroup, {
      id: 25,
      name: "School of Biotechnology & Biosciences",
      pos: [22, 0, -5],
      size: [16, 16, 15],
      color: 0x991b1b,
      floors: 7,
      accentColor: 0x10b981,
      isStepped: true
    });

    this.createBuildingBlock(csGroup, {
      id: 28,
      name: "School of Agriculture & Greenhouses",
      pos: [22, 0, -25],
      size: [18, 13, 14],
      color: 0x15803d,
      floors: 6,
      accentColor: 0x84cc16,
      isStepped: false
    });

    parent.add(csGroup);
  }

  // --- Computing Hub: SCSE Blocks 33-35 & Central Library Block 37 ---
  buildComputingHub(parent) {
    const chGroup = new THREE.Group();
    chGroup.position.set(0, 0, -35);

    // Block 34: Flagship SCSE Tech Tower & Google Chrome Lab (Focus Academic Block)
    this.createBuildingBlock(chGroup, {
      id: 34,
      name: "School of CSE (Block 34 - Chrome/iMac Labs)",
      pos: [-24, 0, -10],
      size: [24, 20, 18],
      color: 0x991b1b, // Signature red brick
      floors: 8,
      accentColor: 0x38bdf8,
      isStepped: true // Distinctive stepped roof from drone photo!
    });

    // Block 33: SCSE Block 33
    this.createBuildingBlock(chGroup, {
      id: 33,
      name: "School of CSE Tower 1 (Block 33)",
      pos: [-24, 0, 10],
      size: [18, 18, 15],
      color: 0x991b1b,
      floors: 8,
      accentColor: 0x0284c7,
      isStepped: true
    });

    // Block 37: LPU Central Library & Knowledge Center (10,000+ sqm Mega Library)
    this.createBuildingBlock(chGroup, {
      id: 37,
      name: "LPU Central Library (Block 37 - 5 Lakh Books)",
      pos: [24, 0, -5],
      size: [26, 17, 24],
      color: 0x0f172a, // Modern slate & glass
      floors: 7,
      accentColor: 0xf59e0b,
      isStepped: false
    });

    // Block 35: Shanti Devi Mittal Open Air Auditorium
    const audGeo = new THREE.CylinderGeometry(18, 22, 2.5, 32);
    const audMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    const aud = new THREE.Mesh(audGeo, audMat);
    aud.position.set(0, 1.25, 5);
    aud.userData = { id: 35, name: "Shanti Devi Open Auditorium (Block 35)", isCampusBlock: true, activeTickets: 1 };
    this.interactiveObjects.push(aud);
    chGroup.add(aud);

    parent.add(chGroup);
  }

  // --- Heavy Engineering Zone (Blocks 55–58 along Gurudwara Road) ---
  buildHeavyEngineering(parent) {
    const heGroup = new THREE.Group();
    heGroup.position.set(-30, 0, -90); // North-West perimeter

    // Block 55: School of Mechanical Engineering
    this.createBuildingBlock(heGroup, {
      id: 55,
      name: "School of Mechanical Engineering (Block 55)",
      pos: [0, 0, 0],
      size: [24, 15, 16],
      color: 0x334155,
      floors: 7,
      accentColor: 0xf59e0b,
      isStepped: false
    });

    // Block 56: School of Civil Engineering
    this.createBuildingBlock(heGroup, {
      id: 56,
      name: "Civil Engineering & Bioengineering (Block 56)",
      pos: [0, 0, -22],
      size: [22, 15, 15],
      color: 0x334155,
      floors: 7,
      accentColor: 0xeab308,
      isStepped: false
    });

    // Block 57 & 58: Workshops & Fabrication Streets
    const shedGeo = new THREE.BoxGeometry(22, 9, 28);
    const shedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
    const shed = new THREE.Mesh(shedGeo, shedMat);
    shed.position.set(0, 4.5, -46);
    shed.userData = { id: 57, name: "Polytechnic & Applied Machine Workshops (57-58)", isCampusBlock: true, activeTickets: 3 };
    this.interactiveObjects.push(shed);
    heGroup.add(shed);

    parent.add(heGroup);
  }

  // --- Sports Complex & Hostels Zone (Shanti Devi Stadium, BH-1 to BH-9, GH-1 to GH-6) ---
  buildSportsAndHostels(parent) {
    const shGroup = new THREE.Group();
    shGroup.position.set(0, 0, -110); // Far North

    // Block 47: Shanti Devi Mittal Indoor Sports Stadium (Olympic Pool Dome)
    const stadiumGeo = new THREE.CylinderGeometry(18, 20, 11, 32);
    const stadiumMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.3 });
    const stadium = new THREE.Mesh(stadiumGeo, stadiumMat);
    stadium.position.set(0, 5.5, 0);
    stadium.castShadow = true;
    stadium.userData = { id: 47, name: "Shanti Devi Indoor Stadium (Olympic Pool)", isCampusBlock: true, activeTickets: 2 };
    this.interactiveObjects.push(stadium);
    shGroup.add(stadium);

    // Stadium Dome Roof
    const domeGeo = new THREE.SphereGeometry(18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, 11, 0);
    shGroup.add(dome);

    // Campus Cricket Ground & Athletic Track (Block 54)
    const trackGeo = new THREE.RingGeometry(18, 26, 32);
    const trackMat = new THREE.MeshBasicMaterial({ color: 0xb91c1c, side: THREE.DoubleSide }); // Terracotta running track
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.set(0, 0.12, -35);
    shGroup.add(track);

    const pitchGeo = new THREE.CircleGeometry(17.8, 32);
    const pitchMat = new THREE.MeshStandardMaterial({ color: 0x16a34a }); // Green grass
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.set(0, 0.14, -35);
    shGroup.add(pitch);

    // --- BOYS HOSTEL CLUSTER (BH-1 to BH-8, Blocks 43, 45, 46, 48, 49, 50, 51, 52) ---
    const bhPositions = [
      { id: 43, name: "Boys Hostel 1 (Shivalik)", pos: [32, 0, 15], floors: 8, tickets: 5 },
      { id: 45, name: "Boys Hostel 2 (Himalaya)", pos: [32, 0, -5], floors: 8, tickets: 6 },
      { id: 46, name: "Boys Hostel 3 (Aravali)", pos: [32, 0, -25], floors: 8, tickets: 7 },
      { id: 48, name: "Boys Hostel 4 (Nilgiri - Room 312)", pos: [32, 0, -45], floors: 8, tickets: 8 }, // Focus hostel!
      { id: 49, name: "Boys Hostel 5 (Vindhya)", pos: [52, 0, 5], floors: 9, tickets: 6 },
      { id: 50, name: "Boys Hostel 6 (Satpura)", pos: [52, 0, -15], floors: 9, tickets: 5 },
      { id: 51, name: "Boys Hostel 7 (Kailash)", pos: [52, 0, -35], floors: 8, tickets: 4 },
      { id: 52, name: "Boys Hostel 8 (Everest)", pos: [52, 0, -55], floors: 8, tickets: 3 }
    ];

    bhPositions.forEach(bh => {
      this.createHostelTower(shGroup, bh, 'BH');
    });

    // 7.5 MW Solar Array Panels on Hostel Rooftops
    const solarGeo = new THREE.BoxGeometry(10, 0.2, 10);
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
    const solar = new THREE.Mesh(solarGeo, solarMat);
    solar.position.set(32, 18.2, -45); // BH-4 rooftop
    shGroup.add(solar);

    parent.add(shGroup);
  }

  // --- Helper: Procedural Multi-Story Stepped Building Maker ---
  createBuildingBlock(parent, spec) {
    const bGroup = new THREE.Group();
    bGroup.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);

    const height = spec.size[1];
    const width = spec.size[0];
    const depth = spec.size[2];

    const bMat = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.6 });
    const bGeo = new THREE.BoxGeometry(width, height, depth);
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.y = height / 2;
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    bGroup.add(bMesh);

    // Stepped living roof / terrace (matching lpu_aerial_building.jpg)
    if (spec.isStepped) {
      const stepMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 }); // Green roof
      const stepGeo = new THREE.BoxGeometry(width * 0.7, 2, depth * 0.7);
      const stepMesh = new THREE.Mesh(stepGeo, stepMat);
      stepMesh.position.set(0, height + 1, 0);
      bGroup.add(stepMesh);

      // Angled glass roof skylight
      const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.8, roughness: 0.1 });
      const glassGeo = new THREE.CylinderGeometry(2, 4, 3, 4);
      glassGeo.rotateY(Math.PI / 4);
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, height + 3, 0);
      bGroup.add(glass);
    }

    // Modern Glass Window Stripes
    const winMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let f = 1; f < spec.floors; f++) {
      const stripGeo = new THREE.PlaneGeometry(width * 0.85, 0.6);
      const stripFront = new THREE.Mesh(stripGeo, winMat);
      stripFront.position.set(0, f * (height / spec.floors), depth / 2 + 0.05);
      bGroup.add(stripFront);

      const stripBack = new THREE.Mesh(stripGeo, winMat);
      stripBack.rotation.y = Math.PI;
      stripBack.position.set(0, f * (height / spec.floors), -depth / 2 - 0.05);
      bGroup.add(stripBack);
    }

    // Status Beacon on top
    const data = window.LPU_CAMPUS_DATA || {};
    const blkData = data.blocks ? data.blocks.find(x => x.id === spec.id) : null;
    const ticketCount = blkData ? blkData.activeTickets : (spec.id === 34 ? 6 : 1);

    const beaconColor = ticketCount > 4 ? 0xef4444 : (ticketCount > 0 ? 0xf59e0b : 0x10b981);
    const beaconGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: beaconColor });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = height + (spec.isStepped ? 4.5 : 1.2);
    bGroup.add(beacon);

    // Interactive metadata
    bMesh.userData = {
      isCampusBlock: true,
      id: spec.id,
      name: spec.name,
      dept: blkData ? blkData.dept : 'Academic & Research Department',
      activeTickets: ticketCount,
      floors: spec.floors
    };
    this.interactiveObjects.push(bMesh);

    parent.add(bGroup);
  }

  // --- Helper: Procedural Multi-Story Hostel Tower Maker ---
  createHostelTower(parent, bh, type) {
    const tGroup = new THREE.Group();
    tGroup.position.set(bh.pos[0], bh.pos[1], bh.pos[2]);

    const height = bh.floors * 2.2;
    const tMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    const tGeo = new THREE.BoxGeometry(14, height, 14);
    const tMesh = new THREE.Mesh(tGeo, tMat);
    tMesh.position.y = height / 2;
    tMesh.castShadow = true;
    tMesh.receiveShadow = true;
    tGroup.add(tMesh);

    // LPU Orange Roof Border
    const borderGeo = new THREE.BoxGeometry(14.5, 0.4, 14.5);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.y = height + 0.2;
    tGroup.add(border);

    // Windows Grid
    const winMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let f = 1; f < bh.floors; f++) {
      for (let w = -4; w <= 4; w += 4) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), winMat);
        win.position.set(w, f * 2.2, 7.05);
        tGroup.add(win);
      }
    }

    // 3D Status Beacon
    const beaconColor = bh.tickets > 5 ? 0xef4444 : 0xf59e0b;
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshBasicMaterial({ color: beaconColor }));
    beacon.position.y = height + 1.2;
    tGroup.add(beacon);

    tMesh.userData = {
      isCampusBlock: true,
      id: bh.id,
      name: bh.name,
      dept: `Residential Services (${type}) - ${bh.floors * 45} Capacity`,
      activeTickets: bh.tickets,
      floors: bh.floors
    };
    this.interactiveObjects.push(tMesh);

    parent.add(tGroup);
  }

  // --- 3D Billboard Zone Labels ---
  buildZoneLabelBadges(parent) {
    const zones = [
      { name: "Zone 1: Front Gateway (NH-44)", pos: [0, 18, 70], color: "#f97316" },
      { name: "Zone 3: Central Governance Spine", pos: [0, 20, 20], color: "#8b5cf6" },
      { name: "Zone 4: SCSE & Central Library", pos: [0, 22, -35], color: "#3b82f6" },
      { name: "Zone 6: Sports & BH Townships", pos: [0, 22, -110], color: "#10b981" }
    ];

    zones.forEach(z => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.roundRect(10, 10, 492, 108, 20);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = z.color;
      ctx.stroke();

      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(z.name, 256, 70);

      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
      sprite.position.set(z.pos[0], z.pos[1], z.pos[2]);
      sprite.scale.set(18, 4.5, 1);
      parent.add(sprite);
    });
  }

  /* =========================================================================
   * MODE 2: INTERACTIVE DORM ROOM INSPECTOR (BH-4 ROOM 312)
   * ========================================================================= */
  buildRoomScene() {
    this.currentMode = 'dorm-room';
    this.clearSceneObjects();
    this.hotspots = [];
    this.interactiveObjects = [];

    const roomGroup = new THREE.Group();
    roomGroup.name = "DormRoomModel";

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.5 });
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });

    // Floor & Walls
    const floor = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 7), floorMat);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(7, 3.8, 0.2), wallMat);
    backWall.position.set(0, 1.8, -3.4);
    roomGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 7), wallMat);
    leftWall.position.set(-3.4, 1.8, 0);
    roomGroup.add(leftWall);

    // Ceiling Fan (Ticket #HF1087)
    this.fanGroup = new THREE.Group();
    this.fanGroup.position.set(0, 3.4, 0);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65), metalMat);
    rod.position.y = 0.15;
    this.fanGroup.add(rod);

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.18, 24), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 }));
    motor.position.y = -0.15;
    this.fanGroup.add(motor);

    this.fanBlades = new THREE.Group();
    this.fanBlades.position.y = -0.18;
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 1.1), new THREE.MeshStandardMaterial({ color: 0x64748b }));
      blade.position.z = 0.55;
      const bHolder = new THREE.Group();
      bHolder.rotation.y = (i * Math.PI * 2) / 3;
      bHolder.add(blade);
      this.fanBlades.add(bHolder);
    }
    this.fanGroup.add(this.fanBlades);
    motor.userData = { componentId: 'fan', name: 'Ceiling Fan (Havells 1200mm)', ticketId: 'HF1087', category: 'electrical', health: 'Degraded Capacitor (35% RPM)' };
    this.interactiveObjects.push(motor);
    roomGroup.add(this.fanGroup);

    // Washbasin & Tap (Ticket #HF1088)
    const basin = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.65), whiteMat);
    basin.position.set(-3.25, 0.95, 2.1);
    roomGroup.add(basin);

    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.22), metalMat);
    tap.position.set(-3.17, 1.17, 2.1);
    roomGroup.add(tap);
    basin.userData = { componentId: 'tap', name: 'Washbasin & Ceramic Tap', ticketId: 'HF1088', category: 'plumbing', health: 'Dripping Water Leak (1 drop/sec)' };
    this.interactiveObjects.push(basin);

    // Water Leak Particle System
    this.setupLeakParticles(new THREE.Vector3(-3.1, 1.2, 2.1));

    // Study Desk & Socket (Ticket #HF1089)
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.1), deskMat);
    table.position.set(-2.0, 0.75, -2.2);
    roomGroup.add(table);

    const socket = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.04), whiteMat);
    socket.position.set(-1.0, 1.05, -3.28);
    socket.userData = { componentId: 'socket', name: 'Desk Dual 16A Power Socket', ticketId: 'HF1089', category: 'electrical', health: 'Spark Detected (Loose Neutral)' };
    this.interactiveObjects.push(socket);
    roomGroup.add(socket);

    // Spark Particles
    this.setupSparkParticles(socket.position);

    // Bed & Mattress
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 2.4), woodMat);
    bed.position.set(1.9, 0.25, -1.3);
    roomGroup.add(bed);

    this.scene.add(roomGroup);

    if (this.controls) {
      this.camera.position.set(5.5, 4.2, 6.5);
      this.controls.target.set(0, 1.5, 0);
      this.controls.update();
    }
    this.updateDiagnosticsUI('dorm-room');
  }

  /* =========================================================================
   * MODE 3: INTERACTIVE SCSE SMART COMPUTING LAB (BLOCK 34 LAB 204)
   * ========================================================================= */
  buildClassroomScene() {
    this.currentMode = 'classroom';
    this.clearSceneObjects();
    this.hotspots = [];
    this.interactiveObjects = [];

    const labGroup = new THREE.Group();
    labGroup.name = "SCSE_Lab_204";

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // Tiered floor & walls
    const floor = new THREE.Mesh(new THREE.BoxGeometry(9, 0.2, 8), floorMat);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    labGroup.add(floor);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(9, 4.2, 0.2), wallMat);
    frontWall.position.set(0, 2.0, -3.9);
    labGroup.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.2, 8), wallMat);
    leftWall.position.set(-4.4, 2.0, 0);
    labGroup.add(leftWall);

    // Front Smart Whiteboard Screen (120" Interactive)
    const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.1, 0.05), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    boardFrame.position.set(0, 2.2, -3.75);
    labGroup.add(boardFrame);

    const boardSurface = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 1.9), screenMat);
    boardSurface.position.set(0, 2.2, -3.72);
    labGroup.add(boardSurface);

    // Ceiling Laser Projector (Ticket #HF1095)
    const projectorGroup = new THREE.Group();
    projectorGroup.position.set(0, 3.7, -0.8);
    const pMount = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5), metalMat);
    pMount.position.y = 0.25;
    projectorGroup.add(pMount);

    const pBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.2, 0.45), whiteMat);
    projectorGroup.add(pBody);

    const pLens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    pLens.rotation.x = Math.PI / 2;
    pLens.position.set(0.15, 0, -0.23);
    projectorGroup.add(pLens);

    // Interactive Projector
    projectorGroup.userData = {
      componentId: "projector",
      name: "SCSE Projector (Epson 3LCD Laser)",
      ticketId: "HF1095",
      room: "Block 34 Lab 204",
      health: "Lamp Failure / HDMI Signal Loss",
      category: "IT/AV"
    };
    this.interactiveObjects.push(projectorGroup);
    labGroup.add(projectorGroup);

    // Student Workstation Desks (Rows of iMacs/Monitors)
    for (let r = 0; r < 2; r++) {
      const zPos = 0.8 + r * 2.2;
      for (let c = -1; c <= 1; c++) {
        const xPos = c * 2.4;
        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 0.8), deskMat);
        desk.position.set(xPos, 0.375, zPos);
        labGroup.add(desk);

        // Monitor
        const monStand = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18), metalMat);
        monStand.position.set(xPos, 0.84, zPos - 0.15);
        labGroup.add(monStand);

        const mon = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.38, 0.04), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
        mon.position.set(xPos, 1.02, zPos - 0.15);
        labGroup.add(mon);

        // Workstation 14 with Network Drop (#HF1096)
        if (r === 0 && c === 1) {
          mon.userData = {
            componentId: "workstation",
            name: "Workstation #14 (Dell Precision Tower)",
            ticketId: "HF1096",
            room: "Block 34 Lab 204",
            health: "Gigabit Ethernet Jack Broken",
            category: "Network"
          };
          this.interactiveObjects.push(mon);
        }
      }
    }

    // Ceiling Daikin Cassette AC (#HF1097)
    const ac = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 1.2), whiteMat);
    ac.position.set(0, 3.9, 1.6);
    ac.userData = {
      componentId: "hvac",
      name: "Cassette AC Unit (Daikin VRV)",
      ticketId: "HF1097",
      room: "Block 34 Lab 204",
      health: "Thermostat Trip / Cooling Low",
      category: "HVAC"
    };
    this.interactiveObjects.push(ac);
    labGroup.add(ac);

    this.scene.add(labGroup);

    if (this.controls) {
      this.camera.position.set(5.0, 4.2, 5.8);
      this.controls.target.set(0, 1.6, -0.5);
      this.controls.update();
    }
    this.updateDiagnosticsUI('classroom');
  }

  updateDiagnosticsUI(mode) {
    const box = document.getElementById('three-diagnostics-box');
    if (!box) return;

    if (mode === 'classroom') {
      box.innerHTML = `
        <div class="tdc-header">
          <div class="tdc-title"><i class="fa-solid fa-chalkboard-user text-primary"></i> SCSE Computing Lab 204</div>
          <span class="tdc-health">Block 34</span>
        </div>
        <div class="tdc-spec-list">
          <div><span>Location:</span> <strong>Block 34 (SCSE) 2nd Floor</strong></div>
          <div><span>Smart Projector:</span> <strong class="text-amber-400">Epson 3LCD Lamp Sync Fault (#HF1095)</strong></div>
          <div><span>Workstation 14:</span> <strong class="text-rose-400">Ethernet Jack Broken (#HF1096)</strong></div>
          <div><span>Cassette AC:</span> <strong class="text-blue-400">Thermostat Sensor Trip (#HF1097)</strong></div>
        </div>
        <button class="btn btn-primary w-full btn-sm" onclick="window.hostelApp.switchView('hifi'); window.hostelApp.openScreen('report')">
          <i class="fa-solid fa-file-circle-plus"></i> File Academic Lab Issue
        </button>
      `;
    } else if (mode === 'dorm-room') {
      box.innerHTML = `
        <div class="tdc-header">
          <div class="tdc-title"><i class="fa-solid fa-circle-dot text-amber-400"></i> Active Inspection Focus</div>
          <span class="tdc-health">Interactive 3D</span>
        </div>
        <div class="tdc-spec-list">
          <div><span>Location:</span> <strong>BH-4 (Nilgiri) Room 312</strong></div>
          <div><span>Ceiling Fan:</span> <strong class="text-amber-400">Degraded 2.5µF Capacitor (#HF1087)</strong></div>
          <div><span>Washbasin Tap:</span> <strong class="text-blue-400">Water Leakage Active (#HF1088)</strong></div>
          <div><span>Power Socket:</span> <strong class="text-rose-400">Spark / Loose Neutral (#HF1089)</strong></div>
        </div>
        <button class="btn btn-primary w-full btn-sm" onclick="window.hostelApp.switchView('hifi'); window.hostelApp.openScreen('report')">
          <i class="fa-solid fa-file-circle-plus"></i> File Issue From 3D Focus
        </button>
      `;
    } else {
      box.innerHTML = `
        <div class="tdc-header">
          <div class="tdc-title"><i class="fa-solid fa-mountain-city text-emerald-400"></i> LPU Linear Campus Master</div>
          <span class="tdc-health">600 Acres</span>
        </div>
        <div class="tdc-spec-list">
          <div><span>Infrastructure:</span> <strong>58 Blocks • 18 Gates • 33 Parking Areas</strong></div>
          <div><span>Clean Energy:</span> <strong class="text-emerald-400">7.5 MW Solar & Rooftop Grid</strong></div>
          <div><span>Water Systems:</span> <strong class="text-blue-400">5 MLD Main STP + Rainwater Harvest</strong></div>
          <div><span>Linear Concourse:</span> <strong class="text-amber-400">NH-44 G.T. Road to Sports Perimeter</strong></div>
        </div>
        <button class="btn btn-primary w-full btn-sm" onclick="window.hostelApp.switchView('campus-map')">
          <i class="fa-solid fa-map-location-dot"></i> Open 2D Campus Spatial Navigator
        </button>
      `;
    }
  }

  // --- Dynamic Particle Systems ---
  setupLeakParticles(pos) {
    const count = 20;
    const geo = new THREE.BufferGeometry();
    const posArr = new Float32Array(count * 3);
    const vel = [];
    for (let i = 0; i < count; i++) {
      posArr[i * 3] = pos.x + (Math.random() - 0.5) * 0.02;
      posArr[i * 3 + 1] = pos.y - (i / count) * 0.3;
      posArr[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.02;
      vel.push(0.015 + Math.random() * 0.02);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    this.leakParticles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.05, transparent: true }));
    this.leakParticles.userData = { initialY: pos.y, vel: vel };
    this.scene.add(this.leakParticles);
  }

  setupSparkParticles(pos) {
    const count = 15;
    const geo = new THREE.BufferGeometry();
    const posArr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) posArr[i] = (Math.random() - 0.5) * 0.15;
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    this.sparkParticles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xfacc15, size: 0.06, transparent: true }));
    this.sparkParticles.position.set(pos.x, pos.y, pos.z + 0.05);
    this.scene.add(this.sparkParticles);
  }

  clearSceneObjects() {
    const toRemove = [];
    this.scene.children.forEach(c => {
      if (c.type === 'Group' || c.type === 'Mesh' || c.type === 'Sprite' || c.type === 'Points') {
        toRemove.push(c);
      }
    });
    toRemove.forEach(c => this.scene.remove(c));
    this.leakParticles = null;
    this.sparkParticles = null;
    this.fanGroup = null;
    this.fanBlades = null;
  }

  /* =========================================================================
   * INTERACTION & RAYCASTING
   * ========================================================================= */
  onPointerMove(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.interactiveObjects, true);
    this.renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
  }

  onPointerDown(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (hits.length > 0) {
      let hit = hits[0].object;
      while (hit && (!hit.userData || Object.keys(hit.userData).length === 0) && hit.parent) {
        hit = hit.parent;
      }
      if (hit && hit.userData) {
        if (hit.userData.isCampusBlock) {
          this.handleBlockClick(hit.userData);
        } else if (hit.userData.componentId) {
          this.handleComponentClick(hit.userData);
        }
      }
    }
  }

  handleBlockClick(blockData) {
    if (this.onComponentClickCallback) {
      this.onComponentClickCallback({ isCampusBlock: true, ...blockData });
    }
  }

  handleComponentClick(data) {
    if (this.onComponentClickCallback) {
      this.onComponentClickCallback(data);
    }
  }

  /* =========================================================================
   * ANIMATION & CINEMATIC CAMERA PRESETS
   * ========================================================================= */
  animate() {
    this.animId = requestAnimationFrame(this.animate);

    // Fan Blade Rotation + Wobble
    if (this.fanBlades) {
      this.fanBlades.rotation.y += this.fanSpeed;
      if (this.isFanWobbly && this.fanGroup) {
        this.fanGroup.rotation.z = Math.sin(Date.now() * 0.01) * 0.04;
        this.fanGroup.rotation.x = Math.cos(Date.now() * 0.008) * 0.03;
      }
    }

    // Water Leak Particles
    if (this.leakParticles) {
      const pos = this.leakParticles.geometry.attributes.position.array;
      const initY = this.leakParticles.userData.initialY;
      const vel = this.leakParticles.userData.vel;
      for (let i = 0; i < vel.length; i++) {
        pos[i * 3 + 1] -= vel[i];
        if (pos[i * 3 + 1] < 0.95) pos[i * 3 + 1] = initY;
      }
      this.leakParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Spark Particles
    if (this.sparkParticles) {
      this.sparkParticles.visible = Math.random() > 0.4;
      this.sparkParticles.rotation.z += 0.05;
    }

    // Drone Tour Flight Path Animation
    if (this.isDroneTourActive && this.controls) {
      this.droneTourProgress += 0.0015;
      if (this.droneTourProgress > 1) this.droneTourProgress = 0;
      // Fly along linear spine: from Z = 120 (South) to Z = -130 (North)
      const curZ = 120 - this.droneTourProgress * 250;
      const curX = Math.sin(this.droneTourProgress * Math.PI * 4) * 15;
      this.camera.position.set(curX, 45, curZ + 35);
      this.controls.target.set(0, 5, curZ);
    }

    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // Camera Presets
  jumpToZone(zoneId) {
    if (this.currentMode !== 'campus') this.buildLinearCampusScene();
    this.isDroneTourActive = false;

    const map = {
      'gate': { pos: [0, 35, 145], target: [0, 4, 110] },
      'front': { pos: [0, 45, 95], target: [0, 5, 60] },
      'governance': { pos: [0, 45, 45], target: [0, 5, 10] },
      'computing': { pos: [0, 45, -10], target: [0, 5, -45] },
      'sports': { pos: [0, 55, -75], target: [0, 5, -120] }
    };

    if (map[zoneId] && this.controls) {
      const p = map[zoneId];
      this.camera.position.set(p.pos[0], p.pos[1], p.pos[2]);
      this.controls.target.set(p.target[0], p.target[1], p.target[2]);
      this.controls.update();
    }
  }

  focusOnBlock(blockId) {
    if (this.currentMode !== 'campus') this.buildLinearCampusScene();
    this.isDroneTourActive = false;

    // Approximate Z coordinate along linear spine
    const zPos = 80 - (blockId / 58) * 200;
    if (this.controls) {
      this.camera.position.set(0, 35, zPos + 40);
      this.controls.target.set(0, 6, zPos);
      this.controls.update();
    }
  }

  toggleDroneTour() {
    this.isDroneTourActive = !this.isDroneTourActive;
    if (this.isDroneTourActive && this.currentMode !== 'campus') {
      this.buildLinearCampusScene();
    }
    return this.isDroneTourActive;
  }

  toggleFanFault(enable) {
    this.isFanWobbly = enable;
    this.fanSpeed = enable ? 0.08 : 0.28;
  }

  toggleLeak(enable) {
    if (this.leakParticles) this.leakParticles.visible = enable;
  }

  focusOnComponent(compId) {
    if (this.currentMode !== 'dorm-room') this.buildRoomScene();
    const map = {
      fan: { cam: [2.5, 3.4, 2.5], look: [0, 3.2, 0] },
      tap: { cam: [-2.2, 1.4, 2.2], look: [-3.2, 1.1, 2.1] },
      socket: { cam: [-1.0, 1.2, -2.0], look: [-1.0, 1.05, -3.28] }
    };
    if (map[compId] && this.controls) {
      const t = map[compId];
      this.camera.position.set(t.cam[0], t.cam[1], t.cam[2]);
      this.controls.target.set(t.look[0], t.look[1], t.look[2]);
      this.controls.update();
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

// Export to window
if (typeof window !== 'undefined') {
  window.Campus3DExplorer = Campus3DExplorer;
  window.Hostel3DExplorer = Campus3DExplorer; // Backwards compatibility
}
