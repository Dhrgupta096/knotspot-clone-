import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Cpu, Flame, Sun, Bus, ShieldAlert, Sparkles, Layers, Eye, RotateCcw, Box, Wind, ArrowRight, Compass, Crosshair } from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';
import Magnet from './reactbits/Magnet';
import ShinyText from './reactbits/ShinyText';

const BUILDINGS_BASE = [
  {
    id: 'dgx-lab',
    name: 'NVIDIA DGX AI Supercomputing Lab',
    category: 'High-Density Compute',
    desc: 'Houses 8x NVIDIA A100 Tensor Core GPUs for real-time vision training and LLM research.',
    pos: [-35, 12, -20],
    size: [26, 24, 28],
    color: 0xd4ff00,
    accent: 'var(--phosphor)',
  },
  {
    id: 'transit-hub',
    name: 'Main Gate & Transit Bus Depot',
    category: 'Transportation Hub',
    desc: 'Campus shuttle terminal connecting KS Layout ⇋ Harohalli inter-campus transit.',
    pos: [35, 7, 25],
    size: [34, 14, 24],
    color: 0xff5500,
    accent: 'var(--thermal)',
  },
  {
    id: 'admin-block',
    name: 'Engineering & Academic Towers',
    category: 'Institutional Facilities',
    desc: 'Classrooms, computer science departments, centralized HVAC chillers and rooftop solar.',
    pos: [0, 18, -35],
    size: [42, 36, 26],
    color: 0x00f0ff,
    accent: 'var(--cyan)',
  },
  {
    id: 'solar-farm',
    name: 'Rooftop Solar Array & Battery Hub',
    category: 'Clean Energy Generation',
    desc: 'Monocrystalline photovoltaic arrays feeding campus labs during daylight.',
    pos: [-40, 5, 30],
    size: [30, 10, 30],
    color: 0x10b981,
    accent: 'var(--emerald)',
  }
];

// Helper to compute reactive metrics based on simulation values
function getDynamicMetrics(buildingId, simValues = {}) {
  const { fleetEv = 30, aiSolarShift = true, solarCapacity = 350, hvacOpt = 40 } = simValues;

  switch (buildingId) {
    case 'dgx-lab':
      return {
        power: '4.82 kW Active Draw',
        pue: aiSolarShift ? '1.18 (Solar Microgrid PUE)' : '1.58 (Peak Fossil PUE)',
        coolingLoad: '2.4 kW Variable Chiller',
        activeJobs: '4 Vision Training Workloads',
        footprint: aiSolarShift ? '0.24 kg CO2/hr (-79% Solar Shift)' : '1.85 kg CO2/hr (Grid Coal)',
        carbonStatus: aiSolarShift ? 'Zero-Carbon Midday Solar Synchronized' : 'High-Carbon Grid Tariff'
      };
    case 'transit-hub': {
      const dieselBuses = Math.max(1, Math.round(6 * (1 - fleetEv / 100)));
      const evBuses = Math.round(6 * (fleetEv / 100));
      const footprint = (4.82 * (1 - (fleetEv / 100) * 0.8)).toFixed(2);
      return {
        activeBuses: `${dieselBuses} Diesel • ${evBuses} Electric EV`,
        idlingAlerts: fleetEv > 60 ? '0 Idling (EV Swapped)' : '2 Detected (>3m Idle)',
        fuelBurnRate: fleetEv > 60 ? '0.08 L/min' : '0.56 L/min Waste',
        evTransition: `${fleetEv}% Fleet Electrified`,
        footprint: `${footprint} kg CO2/hr`,
        carbonStatus: fleetEv > 60 ? 'Optimal Green Fleet Transition' : 'High Tailpipe Concentration'
      };
    }
    case 'admin-block': {
      const load = (18.5 * (1 - (hvacOpt / 100) * 0.35)).toFixed(1);
      const footprint = (4.2 * (1 - (hvacOpt / 100) * 0.4)).toFixed(2);
      return {
        occupancy: '2,400 Students & Staff',
        lightingHVAC: `${load} kW Optimized Load`,
        solarRoof: `${solarCapacity} kW Monocrystalline Array`,
        hvacModulation: `${hvacOpt}% AI VFD Chiller Modulation`,
        footprint: `${footprint} kg CO2/hr`,
        carbonStatus: '68% Clean Energy Offset'
      };
    }
    case 'solar-farm': {
      const output = Math.round(solarCapacity * 0.82);
      const offset = (solarCapacity * 0.195).toFixed(1);
      return {
        currentOutput: `${output} kW Active Solar Peak`,
        dailyYield: `${(solarCapacity * 4.2).toFixed(0)} kWh/day`,
        batteryStorage: '150 kWh LiFePO4 Microgrid',
        offsetAmount: `-${offset} kg CO2/hr`,
        efficiency: '21.8% Monocrystalline N-Type',
        carbonStatus: '100% Zero-Carbon Direct Feed'
      };
    }
    default:
      return {};
  }
}

export default function CampusTwin({ simulationValues = {}, onSelectBuilding, playSound }) {
  const mountRef = useRef(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState('dgx-lab');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [xRayMode, setXRayMode] = useState(false);
  const [lidarScan, setLidarScan] = useState(false);
  const [activePreset, setActivePreset] = useState('iso');

  // Camera Target and Angle References for Smooth Tweening
  const cameraTargetRef = useRef({ x: 0, y: 0, z: 0 });
  const targetCameraTargetRef = useRef({ x: 0, y: 0, z: 0 });

  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 4, radius: 120 });
  const targetCameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 4, radius: 120 });

  const selectedBuilding = BUILDINGS_BASE.find(b => b.id === selectedBuildingId) || BUILDINGS_BASE[0];
  const dynamicMetrics = getDynamicMetrics(selectedBuilding.id, simulationValues);

  // Camera presets definition
  const PRESETS = [
    { id: 'iso', label: 'DEFAULT ISO', target: { x: 0, y: 0, z: 0 }, angle: { theta: Math.PI / 4, phi: Math.PI / 4, radius: 120 }, buildingId: 'dgx-lab', xRay: false },
    { id: 'dgx', label: 'DGX AI LAB', target: { x: -35, y: 12, z: -20 }, angle: { theta: -Math.PI / 3, phi: Math.PI / 3.4, radius: 68 }, buildingId: 'dgx-lab', xRay: true },
    { id: 'transit', label: 'TRANSIT GATE', target: { x: 35, y: 7, z: 25 }, angle: { theta: Math.PI / 1.6, phi: Math.PI / 3.2, radius: 75 }, buildingId: 'transit-hub', xRay: false },
    { id: 'solar', label: 'ROOFTOP SOLAR', target: { x: -40, y: 5, z: 30 }, angle: { theta: -Math.PI / 1.7, phi: Math.PI / 3.5, radius: 72 }, buildingId: 'solar-farm', xRay: false },
    { id: 'ortho', label: 'TOP BLUEPRINT', target: { x: 0, y: 0, z: 0 }, angle: { theta: 0.001, phi: 0.05, radius: 135 }, buildingId: 'admin-block', xRay: false }
  ];

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setSelectedBuildingId(preset.buildingId);
    if (preset.xRay !== undefined) setXRayMode(preset.xRay);
    
    targetCameraTargetRef.current = { ...preset.target };
    targetCameraAngleRef.current = { ...preset.angle };

    if (playSound) playSound(520, 'triangle', 0.08);
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Three.js Scene & Orthographic Camera Setup
    const scene = new THREE.Scene();
    const aspect = width / height;
    const d = 68;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // 1. Campus Ground Baseplate
    const groundGeo = new THREE.PlaneGeometry(175, 175);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070a12,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    scene.add(ground);

    // 2. Blueprint Architectural Grid
    const gridHelper = new THREE.GridHelper(175, 35, 0x1e293b, 0x0d131f);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    // 3. Asphalt Road Network & Bus Lanes
    const roadMat = new THREE.MeshBasicMaterial({ color: 0x111624 });
    const road1Geo = new THREE.PlaneGeometry(175, 16);
    const road1 = new THREE.Mesh(road1Geo, roadMat);
    road1.rotation.x = -Math.PI / 2;
    road1.position.set(0, 0.1, 8);
    scene.add(road1);

    const road2Geo = new THREE.PlaneGeometry(16, 175);
    const road2 = new THREE.Mesh(road2Geo, roadMat);
    road2.rotation.x = -Math.PI / 2;
    road2.position.set(12, 0.1, 0);
    scene.add(road2);

    // Road dashed centerlines
    const centerLineGeo = new THREE.PlaneGeometry(175, 0.6);
    const centerLineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const centerLine = new THREE.Mesh(centerLineGeo, centerLineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.15, 8);
    scene.add(centerLine);

    // 4. Lighting: Sun Directional + Cyber Accent Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xd4ff00, 0.7);
    sunLight.position.set(70, 110, 50);
    scene.add(sunLight);

    const cyanLight = new THREE.DirectionalLight(0x00f0ff, 0.45);
    cyanLight.position.set(-80, 60, -50);
    scene.add(cyanLight);

    // 5. Procedural 3D Trees (Green Zones / Carbon Offset)
    const treeGroup = new THREE.Group();
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x334155 });

    const treeLocations = [
      [-15, 0, 15], [-20, 0, 18], [-12, 0, 22], [22, 0, -18],
      [28, 0, -14], [25, 0, -24], [-10, 0, -10], [-55, 0, -40]
    ];

    treeLocations.forEach(([x, y, z]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 3, 6), trunkMat);
      trunk.position.set(x, 1.5, z);
      const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.8, 5.5, 6), treeMat);
      foliage.position.set(x, 5, z);
      treeGroup.add(trunk);
      treeGroup.add(foliage);
    });
    scene.add(treeGroup);

    // 6. 3D Architectural Buildings & Interior X-Ray Elements
    const buildingMeshes = [];
    const fanBlades = [];
    const serverRacks = [];
    const busMeshes = [];

    BUILDINGS_BASE.forEach((b) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(b.pos[0], 0, b.pos[2]);

      const geo = new THREE.BoxGeometry(b.size[0], b.size[1], b.size[2]);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0c1322,
        roughness: 0.35,
        metalness: 0.85,
        transparent: true,
        opacity: xRayMode ? 0.32 : 0.92
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = b;
      mesh.position.y = b.size[1] / 2;
      bGroup.add(mesh);

      // Glowing Wireframe Edges
      const edges = new THREE.EdgesGeometry(geo);
      const wireMat = new THREE.LineBasicMaterial({
        color: b.color,
        linewidth: 1.5,
        transparent: true,
        opacity: xRayMode ? 0.95 : 0.75
      });
      const wireframe = new THREE.LineSegments(edges, wireMat);
      wireframe.position.y = b.size[1] / 2;
      bGroup.add(wireframe);

      // --- ROOFTOP DETAILS ---
      // A) Solar Panels on Academic Block & Solar Farm
      if (b.id === 'admin-block' || b.id === 'solar-farm') {
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.2 });
        const panelRows = b.id === 'solar-farm' ? 3 : 2;
        for (let row = 0; row < panelRows; row++) {
          for (let col = -2; col <= 2; col++) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 5), panelMat);
            panel.rotation.x = -0.3;
            panel.position.set(col * 5.5, b.size[1] + 1.2, (row - 1) * 7);
            bGroup.add(panel);
          }
        }
      }

      // B) Server Room Cooling Chiller Fans on DGX Lab
      if (b.id === 'dgx-lab') {
        const chillerBox = new THREE.Mesh(
          new THREE.BoxGeometry(16, 4, 12),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
        );
        chillerBox.position.set(0, b.size[1] + 2, 0);
        bGroup.add(chillerBox);

        // 2 Spinning Fans
        [-4, 4].forEach((fx) => {
          const fanGeo = new THREE.BoxGeometry(3.5, 0.2, 0.6);
          const fanMat = new THREE.MeshBasicMaterial({ color: 0xd4ff00 });
          const fan = new THREE.Mesh(fanGeo, fanMat);
          fan.position.set(fx, b.size[1] + 4.2, 0);
          bGroup.add(fan);
          fanBlades.push(fan);
        });

        // 8 Internal DGX Server Racks
        for (let r = -2; r <= 2; r++) {
          const rack = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 12, 3.5),
            new THREE.MeshBasicMaterial({
              color: simulationValues?.aiSolarShift ? 0x10b981 : 0xff5500,
              transparent: true,
              opacity: xRayMode ? 0.95 : 0.0
            })
          );
          rack.position.set(r * 4.5, 6, 0);
          bGroup.add(rack);
          serverRacks.push(rack);
        }
      }

      // C) Stylized Buses at Transit Depot
      if (b.id === 'transit-hub') {
        const isFleetGreen = simulationValues?.fleetEv >= 50;
        [-8, 0, 8].forEach((bx, i) => {
          const isEvBus = isFleetGreen || i === 1;
          const busBody = new THREE.Mesh(
            new THREE.BoxGeometry(6, 3.5, 12),
            new THREE.MeshStandardMaterial({
              color: isEvBus ? 0x10b981 : 0xff5500,
              metalness: 0.6
            })
          );
          busBody.position.set(bx, 2, -15);
          bGroup.add(busBody);
          busMeshes.push({ mesh: busBody, isEv: isEvBus });
        });
      }

      // Floating Marker Beacon
      const beaconGeo = new THREE.ConeGeometry(2, 4.5, 4);
      const beaconMat = new THREE.MeshBasicMaterial({ color: b.color });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.rotation.x = Math.PI;
      beacon.position.set(0, b.size[1] + 6, 0);
      bGroup.add(beacon);

      scene.add(bGroup);
      buildingMeshes.push({ mesh, bGroup, beacon, b, wireMat, mainMat: mat });
    });

    // 7. Dynamic Spline Energy Flow Particles
    const solarCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-40, 6, 30),
      new THREE.Vector3(-25, 18, 5),
      new THREE.Vector3(-35, 16, -20)
    ]);

    const gridCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(60, 2, -60),
      new THREE.Vector3(45, 10, -10),
      new THREE.Vector3(35, 8, 25)
    ]);

    const particleCount = 70;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;

      if (i < particleCount / 2) {
        // Solar Particles (Emerald / Phosphor)
        particleColors[i * 3] = 0.83;
        particleColors[i * 3 + 1] = 1.0;
        particleColors[i * 3 + 2] = 0.0;
      } else {
        // Grid / Diesel Particles (Thermal Orange)
        particleColors[i * 3] = 1.0;
        particleColors[i * 3 + 1] = 0.33;
        particleColors[i * 3 + 2] = 0.0;
      }
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // 8. 360° Mouse Orbit & Pan Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const updateCameraPosition = () => {
      const curTarget = cameraTargetRef.current;
      const curAngle = cameraAngleRef.current;
      camera.position.x = curTarget.x + curAngle.radius * Math.sin(curAngle.phi) * Math.sin(curAngle.theta);
      camera.position.y = curTarget.y + curAngle.radius * Math.cos(curAngle.phi);
      camera.position.z = curTarget.z + curAngle.radius * Math.sin(curAngle.phi) * Math.cos(curAngle.theta);
      camera.lookAt(curTarget.x, curTarget.y, curTarget.z);
    };

    updateCameraPosition();

    const handleMouseDown = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;

      targetCameraAngleRef.current.theta -= deltaX * 0.008;
      targetCameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, targetCameraAngleRef.current.phi + deltaY * 0.008));

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e) => {
      targetCameraAngleRef.current.radius = Math.max(45, Math.min(180, targetCameraAngleRef.current.radius + e.deltaY * 0.08));
    };

    currentMount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    currentMount.addEventListener('wheel', handleWheel);

    // Raycasting for Building Click Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshes.map(bm => bm.mesh));

      if (intersects.length > 0) {
        const clickedBuilding = intersects[0].object.userData;
        setSelectedBuildingId(clickedBuilding.id);
        if (onSelectBuilding) onSelectBuilding(clickedBuilding);

        targetCameraTargetRef.current = {
          x: clickedBuilding.pos[0],
          y: clickedBuilding.size[1] / 2,
          z: clickedBuilding.pos[2]
        };
        targetCameraAngleRef.current.radius = 85;
        if (playSound) playSound(600, 'triangle', 0.08);
      }
    };

    currentMount.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      const newAspect = w / h;
      camera.left = -d * newAspect;
      camera.right = d * newAspect;
      camera.top = d;
      camera.bottom = -d;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with Smooth Camera Interpolation
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = (performance.now() - startTime) * 0.001;

      // Camera Smooth Tweening
      const angle = cameraAngleRef.current;
      const targetAngle = targetCameraAngleRef.current;
      angle.theta += (targetAngle.theta - angle.theta) * 0.08;
      angle.phi += (targetAngle.phi - angle.phi) * 0.08;
      angle.radius += (targetAngle.radius - angle.radius) * 0.08;

      const target = cameraTargetRef.current;
      const targetTarget = targetCameraTargetRef.current;
      target.x += (targetTarget.x - target.x) * 0.08;
      target.y += (targetTarget.y - target.y) * 0.08;
      target.z += (targetTarget.z - target.z) * 0.08;

      updateCameraPosition();

      // Spin Rooftop Chiller Fans
      fanBlades.forEach((fan) => {
        fan.rotation.y += 0.28;
      });

      // Beacon bounce animation
      buildingMeshes.forEach((bm) => {
        bm.beacon.position.y = bm.b.size[1] + 6 + Math.sin(time * 3.5) * 1.5;
        bm.beacon.rotation.y += 0.04;
      });

      // Animate Energy Flow Particles
      if (showParticles) {
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const t = ((time * 0.25 + i / particleCount) % 1);
          let point;
          if (i < particleCount / 2) {
            point = solarCurve.getPoint(t);
          } else {
            point = gridCurve.getPoint(t);
          }
          positions[i * 3] = point.x;
          positions[i * 3 + 1] = point.y;
          positions[i * 3 + 2] = point.z;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      currentMount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      currentMount.removeEventListener('wheel', handleWheel);
      currentMount.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [showParticles]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Atmospheric Spatial Vignette & Subtle Scanlines (edolus.com inspired) */}
      <div className="spatial-vignette" />
      <div className="hud-scanlines" />

      {/* Active LiDAR Laser Beam Sweep & Telemetry Dossier (drone.riotters.com inspired) */}
      {lidarScan && (
        <>
          <div className="lidar-scan-beam" />
          <div className="hud-corner-box" style={{
            position: 'absolute',
            top: '76px',
            right: '24px',
            width: '320px',
            background: 'rgba(6, 8, 12, 0.92)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--border-active)',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: '0 0 24px rgba(212, 255, 0, 0.2)',
            zIndex: 25
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crosshair size={13} color="var(--phosphor)" />
                <span className="swiss-label" style={{ color: 'var(--phosphor)' }}>
                  [LIDAR SURFACE TELEMETRY]
                </span>
              </div>
              <span className="telemetry-chip active">5 RETURNS</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-main)', lineHeight: 1.45, marginBottom: '10px' }}>
              Autonomous LiDAR pulse inspection sweeping DSU building envelope. Real-time dual-wavelength deformation detection active at ±1.8 cm tolerance.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '10.5px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                <span className="swiss-label" style={{ display: 'block', fontSize: '8.5px' }}>CONFIDENCE</span>
                <span className="mono-nums" style={{ color: 'var(--phosphor)', fontWeight: 700 }}>94.2%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                <span className="swiss-label" style={{ display: 'block', fontSize: '8.5px' }}>DEFORMATION</span>
                <span className="mono-nums" style={{ color: 'var(--cyan)', fontWeight: 700 }}>±1.8 cm</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                <span className="swiss-label" style={{ display: 'block', fontSize: '8.5px' }}>SCAN RANGE</span>
                <span className="mono-nums" style={{ color: 'var(--text-pure)', fontWeight: 700 }}>450 M</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                <span className="swiss-label" style={{ display: 'block', fontSize: '8.5px' }}>POINT DENSITY</span>
                <span className="mono-nums" style={{ color: 'var(--emerald)', fontWeight: 700 }}>240 pts/m²</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Top Facility Hotspots Bar (Direct Jump & Camera Focus) */}
      <div style={{
        position: 'absolute',
        top: '68px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '5px',
        zIndex: 20
      }}>
        {BUILDINGS_BASE.map(b => {
          const isSelected = selectedBuildingId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBuildingId(b.id);
                targetCameraTargetRef.current = { x: b.pos[0], y: b.size[1] / 2, z: b.pos[2] };
                targetCameraAngleRef.current.radius = 85;
                if (playSound) playSound(640, 'triangle', 0.08);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '999px',
                background: isSelected ? 'rgba(212, 255, 0, 0.15)' : 'rgba(8, 10, 15, 0.75)',
                border: isSelected ? '1px solid var(--border-active)' : '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                color: isSelected ? 'var(--phosphor)' : 'var(--text-secondary)',
                fontSize: '10.5px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isSelected ? 'var(--phosphor)' : 'var(--text-muted)' }} />
              <span>{b.name.split(' ')[0]} {b.name.split(' ')[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Top Centered Floating Controls Island with React Bits Magnet */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'auto',
        zIndex: 20
      }}>
        {/* Preset Camera Views Pill Dock */}
        <div style={{
          display: 'flex',
          gap: '3px',
          background: 'rgba(10, 12, 18, 0.8)',
          padding: '3px',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
        }}>
          {PRESETS.map((p) => {
            const isActive = activePreset === p.id;
            return (
              <Magnet key={p.id} padding={40} magnetStrength={3} maxOffset={6}>
                <button
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    padding: '5px 12px',
                    background: isActive ? 'rgba(212, 255, 0, 0.12)' : 'transparent',
                    border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
                    color: isActive ? 'var(--phosphor)' : 'var(--text-secondary)',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <Compass size={11} color={isActive ? 'var(--phosphor)' : 'currentColor'} />
                  <span>{p.label}</span>
                </button>
              </Magnet>
            );
          })}
        </div>

        {/* Spatial Layer Toggles */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(10, 12, 18, 0.8)',
          padding: '3px',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
        }}>
          {/* LiDAR Laser Beam Inspection Toggle (drone.riotters.com inspired) */}
          <Magnet padding={40} magnetStrength={3} maxOffset={6}>
            <button
              onClick={() => {
                setLidarScan(!lidarScan);
                if (playSound) playSound(740, 'sawtooth', 0.08);
              }}
              style={{
                padding: '5px 12px',
                background: lidarScan ? 'rgba(212, 255, 0, 0.15)' : 'transparent',
                border: lidarScan ? '1px solid var(--phosphor)' : '1px solid transparent',
                borderRadius: '999px',
                color: lidarScan ? 'var(--phosphor)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <Crosshair size={12} color={lidarScan ? 'var(--phosphor)' : 'currentColor'} />
              <span>LiDAR: {lidarScan ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </Magnet>

          {/* X-Ray Internal Sensor Toggle */}
          <Magnet padding={40} magnetStrength={3} maxOffset={6}>
            <button
              onClick={() => {
                setXRayMode(!xRayMode);
                if (playSound) playSound(660, 'square', 0.08);
              }}
              style={{
                padding: '5px 12px',
                background: xRayMode ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                border: xRayMode ? '1px solid var(--cyan)' : '1px solid transparent',
                borderRadius: '999px',
                color: xRayMode ? 'var(--cyan)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <Box size={12} />
              <span>X-Ray: {xRayMode ? 'ON' : 'OFF'}</span>
            </button>
          </Magnet>

          {/* Emissions Heatmap Toggle */}
          <Magnet padding={40} magnetStrength={3} maxOffset={6}>
            <button
              onClick={() => {
                setShowHeatmap(!showHeatmap);
                if (playSound) playSound(560, 'sine', 0.06);
              }}
              style={{
                padding: '5px 12px',
                background: showHeatmap ? 'rgba(255, 85, 0, 0.15)' : 'transparent',
                border: showHeatmap ? '1px solid var(--thermal)' : '1px solid transparent',
                borderRadius: '999px',
                color: showHeatmap ? 'var(--thermal)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <Flame size={12} />
              <span>Heatmap: {showHeatmap ? 'ON' : 'OFF'}</span>
            </button>
          </Magnet>
        </div>
      </div>

      {/* Bottom Left: Selected Building Telemetry SpotlightCard */}
      <div className="hud-corner-box" style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        width: '380px',
        maxWidth: '90vw',
        pointerEvents: 'auto',
        zIndex: 20
      }}>
        <SpotlightCard
          spotlightColor={selectedBuilding.accent}
          spotlightSize={300}
          style={{ padding: '18px', borderRadius: '18px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={14} color={selectedBuilding.accent} />
              <span className="swiss-label" style={{ color: selectedBuilding.accent }}>
                [{selectedBuilding.category}]
              </span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              LIVE DIGITAL TWIN
            </span>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-pure)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            {selectedBuilding.name}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '12px' }}>
            {selectedBuilding.desc}
          </p>

          {/* Dynamic Reactive Metric Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            marginBottom: xRayMode ? '8px' : '0'
          }}>
            {Object.entries(dynamicMetrics).map(([key, val], idx) => (
              <div key={idx} style={{ gridColumn: key === 'carbonStatus' ? 'span 2' : 'span 1' }}>
                <span className="swiss-label" style={{ display: 'block', marginBottom: '2px' }}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="mono-nums" style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: key === 'footprint' ? 'var(--thermal)' : (key === 'carbonStatus' ? 'var(--phosphor)' : 'var(--text-pure)')
                }}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          {xRayMode && (
            <div style={{
              fontSize: '11px',
              color: 'var(--cyan)',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(56, 189, 248, 0.08)',
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Crosshair size={12} color="var(--cyan)" />
              <span>
                X-Ray Rack Status: {simulationValues?.aiSolarShift ? 'Optimal Solar Draw' : 'High Grid Load'}
              </span>
            </div>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
