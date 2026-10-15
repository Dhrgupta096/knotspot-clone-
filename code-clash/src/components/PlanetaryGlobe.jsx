import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Globe2, Zap, ArrowRight, Activity, ShieldCheck, Sun, Target, Layers } from 'lucide-react';
import OptionWheel from './reactbits/OptionWheel';
import ShinyText from './reactbits/ShinyText';
import SpotlightCard from './reactbits/SpotlightCard';
import Magnet from './reactbits/Magnet';

// Real-world electricity grid regional emission factors (gCO2/kWh)
const REGIONS = [
  {
    name: 'Karnataka SLDC (Bangalore, IN)',
    wheelLabel: 'Karnataka SLDC (Bangalore)',
    lat: 12.9716,
    lon: 77.5946,
    baseCarbon: 238,
    status: 'moderate',
    note: 'CEA v20.0 (0.716 kg/kWh) • Pavagada 2,050 MW Solar Cluster',
    mix: { solar: 36, coal: 31, hydro: 19, wind: 11, nuclear: 3 },
    rot: { y: 4.2, x: 0.22 }
  },
  {
    name: 'California CAISO (San Jose, US)',
    wheelLabel: 'California CAISO (San Jose)',
    lat: 37.3382,
    lon: -121.8863,
    baseCarbon: 182,
    status: 'optimal',
    note: 'High Solar + Battery Storage',
    mix: { solar: 54, battery: 16, gas: 18, wind: 12 },
    rot: { y: 1.0, x: 0.55 }
  },
  {
    name: 'Europe West (Paris, FR)',
    wheelLabel: 'RTE Grid (France)',
    lat: 48.8566,
    lon: 2.3522,
    baseCarbon: 56,
    status: 'optimal',
    note: '70% Nuclear Baseload + Wind',
    mix: { nuclear: 68, wind: 16, hydro: 10, solar: 6 },
    rot: { y: 2.9, x: 0.75 }
  },
  {
    name: 'Europe Central (Frankfurt, DE)',
    wheelLabel: 'Amprion Grid (Germany)',
    lat: 50.1109,
    lon: 8.6821,
    baseCarbon: 340,
    status: 'moderate',
    note: 'Wind + Gas Balance',
    mix: { wind: 38, coal: 26, solar: 22, gas: 14 },
    rot: { y: 2.8, x: 0.78 }
  },
  {
    name: 'Nordic Grid (Oslo, NO)',
    wheelLabel: 'Nord Pool (Norway)',
    lat: 59.9139,
    lon: 10.7522,
    baseCarbon: 28,
    status: 'optimal',
    note: '98% Hydroelectric & Wind',
    mix: { hydro: 88, wind: 10, biomass: 2 },
    rot: { y: 2.7, x: 0.95 }
  },
  {
    name: 'East Asia Grid (Tokyo, JP)',
    wheelLabel: 'TEPCO (Tokyo, JP)',
    lat: 35.6762,
    lon: 139.6503,
    baseCarbon: 490,
    status: 'moderate',
    note: 'LNG Baseload + Nuclear',
    mix: { gas: 64, nuclear: 18, coal: 11, solar: 7 },
    rot: { y: 5.2, x: 0.52 }
  },
];

export default function PlanetaryGlobe({ onZoomCampus, playSound }) {
  const mountRef = useRef(null);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);
  const [hudMode, setHudMode] = useState('wheel'); // 'wheel' | 'tiles'
  const [liveJitter, setLiveJitter] = useState(0);
  const [simulatedTime, setSimulatedTime] = useState('');

  const targetRotationRef = useRef({ y: REGIONS[0].rot.y, x: REGIONS[0].rot.x });
  const selectedRegion = REGIONS[selectedRegionIndex];

  // Live dynamic fluctuation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveJitter((Math.random() - 0.5) * 3.5);
      const now = new Date();
      setSimulatedTime(now.toTimeString().split(' ')[0] + ' UTC');
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleSelectRegion = (index) => {
    setSelectedRegionIndex(index);
    const reg = REGIONS[index];
    if (reg && reg.rot) {
      targetRotationRef.current = { y: reg.rot.y, x: reg.rot.x };
    }
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 205;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Core Earth Sphere with Local NASA High-Res Texture
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = textureLoader.load('/textures/earth_daymap.jpg');
    const cloudsTexture = textureLoader.load('/textures/earth_clouds.png');

    const earthGeo = new THREE.SphereGeometry(60, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: dayTexture,
      roughness: 0.65,
      metalness: 0.12,
      bumpScale: 0.05
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 2. Realistic Atmospheric Clouds Layer
    const cloudsGeo = new THREE.SphereGeometry(60.8, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);

    // 3. Atmospheric Rayleigh Scattering Glow (Fresnel outer halo)
    const atmosphereGeo = new THREE.SphereGeometry(62.5, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.0, 0.94, 1.0, 1.0) * intensity * 0.85;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 4. Cinematic Space Sun Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(150, 40, 120);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x101b33, 0.6);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.4);
    rimLight.position.set(-150, -50, -80);
    scene.add(rimLight);

    // 5. Global Power Grid Lat/Lon Coordinate Helper
    const latLonToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    // 6. Interactive 3D Beacon Markers
    const markerMeshes = [];
    REGIONS.forEach((region) => {
      const pos = latLonToVector3(region.lat, region.lon, 61.2);

      const color = region.status === 'optimal' ? 0xd4ff00 : (region.status === 'dirty' ? 0xff5500 : 0x00f0ff);
      const dotGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      globeGroup.add(dot);

      const ringGeo = new THREE.RingGeometry(1.6, 2.4, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      globeGroup.add(ring);

      markerMeshes.push({ dot, ring, region });
    });

    // 7. Space Particles Dust
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 800;
      starPositions[i + 1] = (Math.random() - 0.5) * 800;
      starPositions[i + 2] = (Math.random() - 0.5) * 800;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x64748b, size: 1.1, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Initial orientation: Center on India / Bangalore
    globeGroup.rotation.y = targetRotationRef.current.y;
    globeGroup.rotation.x = targetRotationRef.current.x;

    // Mouse Drag Rotation
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('.option-wheel')) return;
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;
      targetRotationRef.current.y = globeGroup.rotation.y;
      targetRotationRef.current.x = globeGroup.rotation.x;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => { isDragging = false; };

    currentMount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize handler
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 60 FPS Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth interpolation toward target rotation when not dragging
      if (!isDragging) {
        globeGroup.rotation.y += (targetRotationRef.current.y - globeGroup.rotation.y) * 0.06;
        globeGroup.rotation.x += (targetRotationRef.current.x - globeGroup.rotation.x) * 0.06;
        // Subtle planetary drift
        targetRotationRef.current.y += 0.0006;
      }

      // Clouds rotate slightly faster for realistic atmospheric drift
      cloudsMesh.rotation.y += 0.0004;

      // Animate pulsing rings on markers
      markerMeshes.forEach((m, idx) => {
        const scale = 1.0 + Math.sin(elapsedTime * 3 + idx) * 0.25;
        m.ring.scale.set(scale, scale, scale);
        m.ring.material.opacity = 0.5 + Math.sin(elapsedTime * 3 + idx) * 0.35;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      currentMount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const currentDisplayCarbon = (selectedRegion.baseCarbon + liveJitter).toFixed(1);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 3D Realistic WebGL Earth Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Atmospheric Spatial Vignette & Subtle Scanlines (edolus.com inspired) */}
      <div className="spatial-vignette" />
      <div className="hud-scanlines" />

      {/* Top-Left HUD Corner Bracket: Orbital Telemetry (drone.riotters.com inspired) */}
      <div className="hud-corner-box cyan" style={{
        position: 'absolute',
        top: '20px',
        left: '24px',
        padding: '9px 14px',
        background: 'rgba(6, 8, 12, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 20,
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span className="pulse-dot cyan" />
          <span className="swiss-label" style={{ color: 'var(--cyan)' }}>[ORBITAL TELEMETRY // MERRA-2]</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-main)', display: 'flex', gap: '12px' }}>
          <span>LAT <span className="mono-nums" style={{ color: 'var(--cyan)', fontWeight: 700 }}>{selectedRegion.lat}°</span></span>
          <span>LON <span className="mono-nums" style={{ color: 'var(--cyan)', fontWeight: 700 }}>{selectedRegion.lon}°</span></span>
          <span>ALT <span className="mono-nums" style={{ color: 'var(--text-pure)' }}>640 KM</span></span>
        </div>
      </div>

      {/* Top-Right HUD Corner Bracket: Grid Telemetry (cominvi.com.mx inspired) */}
      <div className="hud-corner-box" style={{
        position: 'absolute',
        top: '20px',
        right: '24px',
        padding: '9px 14px',
        background: 'rgba(6, 8, 12, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
        zIndex: 20,
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span className="swiss-label" style={{ color: 'var(--phosphor)' }}>[KPTCL // SLDC DISPATCH]</span>
          <span className="pulse-dot" />
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
          PAVAGADA SOLAR <span style={{ color: 'var(--phosphor)', fontWeight: 700 }}>2,050 MW</span> • RTPS <span style={{ color: 'var(--text-pure)' }}>1,720 MW</span>
        </div>
      </div>

      {/* Central Interactive Navigation Hint */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        borderRadius: '999px',
        background: 'rgba(10, 12, 18, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        pointerEvents: 'none',
        zIndex: 20,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
      }}>
        <span className="pulse-dot" />
        <span style={{ letterSpacing: '0.04em' }}>DRAG TO ROTATE 360° • SCROLL TO ZOOM • CLICK NODE TO LOCK</span>
      </div>

      {/* Floating Left HUD: React Bits SpotlightCard with OptionWheel */}
      <div className="hud-corner-box" style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        width: '340px',
        maxWidth: '90vw',
        pointerEvents: 'auto',
        zIndex: 20
      }}>
        <SpotlightCard
          spotlightColor="rgba(212, 255, 0, 0.15)"
          spotlightSize={260}
          style={{ padding: '16px', borderRadius: '18px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe2 size={15} color="var(--cyan)" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-pure)' }}>
                Global Grid Nodes
              </span>
            </div>
            
            {/* View Mode Toggle: Wheel vs Tiles */}
            <div style={{ display: 'flex', gap: '3px' }}>
              <button
                onClick={() => {
                  setHudMode('wheel');
                  if (playSound) playSound(520, 'sine', 0.05);
                }}
                style={{
                  padding: '3px 8px',
                  background: hudMode === 'wheel' ? 'rgba(212, 255, 0, 0.15)' : 'transparent',
                  border: hudMode === 'wheel' ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                  color: hudMode === 'wheel' ? 'var(--phosphor)' : 'var(--text-muted)',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Wheel
              </button>
              <button
                onClick={() => {
                  setHudMode('tiles');
                  if (playSound) playSound(520, 'sine', 0.05);
                }}
                style={{
                  padding: '3px 8px',
                  background: hudMode === 'tiles' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: hudMode === 'tiles' ? '1px solid var(--cyan)' : '1px solid var(--border-subtle)',
                  color: hudMode === 'tiles' ? 'var(--cyan)' : 'var(--text-muted)',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                List
              </button>
            </div>
          </div>

          {/* OptionWheel from React Bits */}
          {hudMode === 'wheel' ? (
            <div style={{
              height: '175px',
              position: 'relative',
              background: 'rgba(5, 7, 10, 0.7)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              marginBottom: '10px'
            }}>
              {/* Subtle indicator bar */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '6px',
                right: '6px',
                transform: 'translateY(-50%)',
                height: '30px',
                borderRadius: '6px',
                border: '1px solid rgba(212, 255, 0, 0.25)',
                pointerEvents: 'none',
                background: 'rgba(212, 255, 0, 0.05)'
              }} />

              <OptionWheel
                items={REGIONS.map(r => r.wheelLabel)}
                defaultSelected={selectedRegionIndex}
                onChange={(idx) => handleSelectRegion(idx)}
                onTick={() => {
                  if (playSound) playSound(720, 'sine', 0.03);
                }}
                fontSize={0.92}
                spacing={1.35}
                tilt={6}
                curve={1.05}
                activeColor="var(--phosphor)"
                textColor="#64748b"
                inset={16}
              />
            </div>
          ) : (
            /* Traditional Clean List View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px', maxHeight: '175px', overflowY: 'auto' }}>
              {REGIONS.map((r, i) => {
                const isSelected = selectedRegionIndex === i;
                return (
                  <div
                    key={i}
                    onClick={() => handleSelectRegion(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(212, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={`pulse-dot ${r.status === 'dirty' ? 'thermal' : (r.status === 'optimal' ? '' : 'cyan')}`} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? 'var(--text-pure)' : 'var(--text-secondary)' }}>
                        {r.name}
                      </span>
                    </div>
                    <span className="mono-nums" style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: r.status === 'optimal' ? 'var(--phosphor)' : (r.status === 'dirty' ? 'var(--thermal)' : 'var(--cyan)')
                    }}>
                      {isSelected ? `${currentDisplayCarbon} g` : `${r.baseCarbon} g`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Node Live Carbon Sheen Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '7px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Carbon Intensity
            </span>
            <ShinyText
              text={`${currentDisplayCarbon} gCO₂/kWh`}
              color="var(--phosphor)"
              shineColor="#ffffff"
              speed={2.2}
              style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </SpotlightCard>
      </div>

      {/* Floating Right HUD: Live Regional Energy Mix & Facility Target */}
      <div className="hud-corner-box cyan" style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        width: '360px',
        maxWidth: '90vw',
        pointerEvents: 'auto',
        zIndex: 20
      }}>
        <SpotlightCard
          spotlightColor="rgba(56, 189, 248, 0.15)"
          spotlightSize={280}
          style={{ padding: '18px', borderRadius: '18px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Target size={15} color="var(--phosphor)" />
              <span className="swiss-label" style={{ color: 'var(--phosphor)' }}>
                [TARGET GRID NODE]
              </span>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {simulatedTime || 'LIVE UTC'}
            </span>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-pure)', marginBottom: '3px', letterSpacing: '-0.02em' }}>
            {selectedRegion.name}
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            {selectedRegion.note}
          </p>

          {/* IISc Bangalore Study Reference Badge (Shown for Karnataka) */}
          {selectedRegionIndex === 0 && (
            <div style={{
              background: 'rgba(212, 255, 0, 0.05)',
              border: '1px solid rgba(212, 255, 0, 0.25)',
              borderRadius: '8px',
              padding: '7px 10px',
              marginBottom: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="swiss-label" style={{ color: 'var(--phosphor)' }}>IISc Ramachandra et al. (Springer 2021)</span>
                <span className="mono-nums" style={{ fontSize: '10px', color: 'var(--phosphor)', fontWeight: 700 }}>CR = 10.7%</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                Gross 150.65 Tg CO₂e vs 16.10 Tg sink • 89.3% deficit
              </span>
            </div>
          )}

          {/* Clean Dynamic Generation Mix */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '10px 12px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Generation Mix
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>100% Real-time</span>
            </div>

            <div style={{ display: 'flex', height: '6px', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
              {selectedRegion.mix.solar && <div style={{ width: `${selectedRegion.mix.solar}%`, background: 'var(--emerald)' }} title="Solar" />}
              {selectedRegion.mix.wind && <div style={{ width: `${selectedRegion.mix.wind}%`, background: 'var(--cyan)' }} title="Wind" />}
              {selectedRegion.mix.hydro && <div style={{ width: `${selectedRegion.mix.hydro}%`, background: '#38bdf8' }} title="Hydro" />}
              {selectedRegion.mix.nuclear && <div style={{ width: `${selectedRegion.mix.nuclear}%`, background: '#a855f7' }} title="Nuclear" />}
              {selectedRegion.mix.gas && <div style={{ width: `${selectedRegion.mix.gas}%`, background: '#f59e0b' }} title="Gas" />}
              {selectedRegion.mix.coal && <div style={{ width: `${selectedRegion.mix.coal}%`, background: 'var(--thermal)' }} title="Coal" />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', fontSize: '10.5px' }}>
              {Object.entries(selectedRegion.mix).map(([source, val]) => (
                <div key={source} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{source}:</span>
                  <span className="mono-nums" style={{ fontWeight: 700, color: 'var(--text-pure)' }}>{val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Magnetic CTA Button to Dive to DSU Campus */}
          <Magnet padding={50} magnetStrength={3} maxOffset={8} style={{ width: '100%' }}>
            <button
              onClick={onZoomCampus}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '999px',
                background: 'var(--phosphor)',
                color: '#08090d',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(212, 255, 0, 0.35)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none'
              }}
            >
              <span>Dive to DSU Campus 3D Twin</span>
              <ArrowRight size={14} />
            </button>
          </Magnet>
        </SpotlightCard>
      </div>
    </div>
  );
}
