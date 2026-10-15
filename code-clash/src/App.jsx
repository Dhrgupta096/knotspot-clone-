import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import PlanetaryGlobe from './components/PlanetaryGlobe';
import CampusTwin from './components/CampusTwin';
import VisionFeed from './components/VisionFeed';
import SimulatorPanel from './components/SimulatorPanel';
import AIPlaybook from './components/AIPlaybook';
import ResearchDossier from './components/ResearchDossier';
import ClickSpark from './components/reactbits/ClickSpark';

export default function App() {
  const [viewEngine, setViewEngine] = useState('globe'); // 'globe' | 'campus'
  const [activeMode, setActiveMode] = useState('overview'); // 'overview' | 'vision' | 'simulator' | 'playbook' | 'research'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fps, setFps] = useState('60.0');

  // Unified Simulation State
  const [simState, setSimState] = useState({
    fleetEv: 30, // %
    aiSolarShift: true, // boolean
    solarCapacity: 350, // kW
    hvacOpt: 40 // %
  });

  // Sound FX Helper using Web Audio API (zero external audio files needed)
  const playSound = (freq = 440, type = 'sine', duration = 0.08) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext muted/unsupported
    }
  };

  // FPS Monitor
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const currentFps = ((frameCount * 1000) / (now - lastTime)).toFixed(1);
      setFps(currentFps > 60 ? '60.0' : currentFps);
      frameCount = 0;
      lastTime = now;
    }, 1000);

    const countFrames = () => {
      frameCount++;
      requestAnimationFrame(countFrames);
    };
    const reqId = requestAnimationFrame(countFrames);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(reqId);
    };
  }, []);

  const handleZoomCampus = () => {
    playSound(680, 'triangle', 0.12);
    setViewEngine('campus');
  };

  return (
    <ClickSpark
      sparkColor={['#d4ff00', '#ffffff', '#38bdf8']}
      sparkSize={10}
      sparkRadius={26}
      sparkCount={6}
      sparkWidth={1.6}
      duration={400}
    >
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-canvas)',
        overflow: 'hidden'
      }}>
        {/* Top Command Bar */}
        <TopNav
          activeMode={activeMode}
          setActiveMode={(m) => {
            playSound(520, 'sine', 0.06);
            setActiveMode(m);
          }}
          viewEngine={viewEngine}
          setViewEngine={(v) => {
            playSound(600, 'triangle', 0.08);
            setViewEngine(v);
          }}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          fps={fps}
        />

        {/* Main Tactical Workspace */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
          
          {/* OVERVIEW MODE: Full-Screen Pure Spatial Experience */}
          {activeMode === 'overview' && (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {viewEngine === 'globe' ? (
                <PlanetaryGlobe onZoomCampus={handleZoomCampus} playSound={playSound} />
              ) : (
                <CampusTwin simulationValues={simState} playSound={playSound} />
              )}
            </div>
          )}

          {/* FULL CV VISION MODE */}
          {activeMode === 'vision' && <VisionFeed simState={simState} playSound={playSound} />}

          {/* FULL WHAT-IF SIMULATOR MODE */}
          {activeMode === 'simulator' && (
            <SimulatorPanel
              simState={simState}
              setSimState={setSimState}
              onOpenPlaybook={() => setActiveMode('playbook')}
            />
          )}

          {/* FULL GENAI PLAYBOOK MODE */}
          {activeMode === 'playbook' && <AIPlaybook simState={simState} playSound={playSound} />}

          {/* FULL RESEARCH & METHODOLOGY MODE */}
          {activeMode === 'research' && <ResearchDossier simState={simState} playSound={playSound} />}

        </div>
      </div>
    </ClickSpark>
  );
}
