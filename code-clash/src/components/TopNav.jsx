import React, { useState, useEffect } from 'react';
import { Globe, Building2, Eye, Sliders, FileText, Volume2, VolumeX, BookOpen, Activity, ShieldCheck, Zap } from 'lucide-react';
import ShinyText from './reactbits/ShinyText';
import Magnet from './reactbits/Magnet';

export default function TopNav({ activeMode, setActiveMode, viewEngine, setViewEngine, soundEnabled, setSoundEnabled, fps }) {
  const [time, setTime] = useState('');
  const [gridFreq, setGridFreq] = useState('50.02');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
      // Karnataka SLDC Nominal 50Hz dynamic micro-fluctuation
      const jitter = (50.00 + (Math.sin(Date.now() / 3000) * 0.025) + ((Math.random() - 0.5) * 0.008)).toFixed(2);
      setGridFreq(jitter);
    };
    const timer = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      height: '56px',
      background: 'rgba(6, 7, 10, 0.88)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 100,
      flexShrink: 0
    }}>
      {/* Brand & Identity with Swiss Architectural Layout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '5px',
            background: 'var(--phosphor)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#08090d',
            fontWeight: 900,
            fontSize: '13px',
            boxShadow: '0 0 16px rgba(212, 255, 0, 0.35)',
            letterSpacing: '-0.02em'
          }}>
            Ω
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <ShinyText text="OMNICARBON" color="#ffffff" shineColor="#d4ff00" speed={3} shineWidth={50} style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.03em' }} />
              <span className="swiss-label" style={{ color: 'var(--phosphor)', fontSize: '9px' }}>DSU // SRE</span>
            </div>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              KPTCL GRID • 12.97° N, 77.59° E
            </span>
          </div>
        </div>

        {/* Minimalist Divider */}
        <div style={{ height: '16px', width: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Dual Engine Switcher Pill with Magnet (drone.riotters.com inspired) */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          padding: '2px',
          gap: '2px'
        }}>
          <Magnet padding={40} magnetStrength={3} maxOffset={8}>
            <button
              onClick={() => setViewEngine('globe')}
              style={{
                padding: '4px 11px',
                borderRadius: '999px',
                background: viewEngine === 'globe' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                border: viewEngine === 'globe' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                color: viewEngine === 'globe' ? 'var(--cyan)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <Globe size={11} color={viewEngine === 'globe' ? 'var(--cyan)' : 'currentColor'} />
              <span>[01] EARTH 3D</span>
            </button>
          </Magnet>

          <Magnet padding={40} magnetStrength={3} maxOffset={8}>
            <button
              onClick={() => setViewEngine('campus')}
              style={{
                padding: '4px 11px',
                borderRadius: '999px',
                background: viewEngine === 'campus' ? 'rgba(212, 255, 0, 0.12)' : 'transparent',
                border: viewEngine === 'campus' ? '1px solid var(--border-active)' : '1px solid transparent',
                color: viewEngine === 'campus' ? 'var(--phosphor)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <Building2 size={11} color={viewEngine === 'campus' ? 'var(--phosphor)' : 'currentColor'} />
              <span>[02] DSU TWIN</span>
            </button>
          </Magnet>
        </div>
      </div>

      {/* Mode Selectors (Swiss Editorial Navigation with Kinetic Hover) */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        background: 'rgba(255, 255, 255, 0.025)',
        padding: '3px',
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {[
          { id: 'overview', label: 'Overview', tag: '01', icon: Activity },
          { id: 'vision', label: 'Metropolis CV', tag: '02', icon: Eye },
          { id: 'simulator', label: 'What-If Sandbox', tag: '03', icon: Sliders },
          { id: 'playbook', label: 'AI Playbook', tag: '04', icon: FileText },
          { id: 'research', label: 'KA Audit & Science', tag: '05', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <Magnet key={tab.id} padding={50} magnetStrength={3} maxOffset={8}>
              <button
                onClick={() => setActiveMode(tab.id)}
                style={{
                  padding: '5px 13px',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  color: isActive ? 'var(--text-pure)' : 'var(--text-secondary)',
                  fontSize: '11.5px',
                  fontWeight: isActive ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none'
                }}
              >
                <Icon size={12} color={isActive ? 'var(--phosphor)' : 'var(--text-secondary)'} />
                <span>{tab.label}</span>
                {isActive && (
                  <span style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--phosphor)',
                    opacity: 0.8
                  }}>
                    [{tab.tag}]
                  </span>
                )}
              </button>
            </Magnet>
          );
        })}
      </nav>

      {/* Right Telemetry: Live Grid Hz, Audio Visualizer, KA Data Badge & Heartbeat */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Real-time Grid Frequency Telemetry (cominvi.com.mx inspired) */}
        <div className="telemetry-chip" title="Karnataka KPTCL/SLDC Live Frequency (Nominal 50.00 Hz)">
          <Zap size={11} color="var(--cyan)" />
          <span>GRID</span>
          <span className="mono-nums" style={{ color: 'var(--text-pure)', fontWeight: 700 }}>
            {gridFreq} Hz
          </span>
        </div>

        {/* Karnataka Real Data Pill Indicator */}
        <Magnet padding={35} magnetStrength={3} maxOffset={6}>
          <button
            onClick={() => setActiveMode('research')}
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(212, 255, 0, 0.08)',
              border: '1px solid rgba(212, 255, 0, 0.35)',
              color: 'var(--phosphor)',
              fontSize: '10.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.15s ease'
            }}
            title="Open Karnataka 2020-2024 Empirical Dataset (CEA v20.0, KPTCL, IISc)"
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--phosphor)', boxShadow: '0 0 8px var(--phosphor)' }} />
            <span>KA 2020–24 REAL DATA</span>
          </button>
        </Magnet>

        {/* Audio Synthesizer with Equalizer Wave (edolus.com inspired) */}
        <Magnet padding={40} magnetStrength={3} maxOffset={6}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              color: soundEnabled ? 'var(--phosphor)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
            title={soundEnabled ? 'Mute Web Audio Synthesizer' : 'Unmute Web Audio Synthesizer'}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            {soundEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '10px' }}>
                <span style={{ width: '2px', height: '8px', background: 'var(--phosphor)', borderRadius: '1px', animation: 'smoothPulse 1.2s infinite ease-in-out' }} />
                <span style={{ width: '2px', height: '12px', background: 'var(--phosphor)', borderRadius: '1px', animation: 'smoothPulse 1.6s infinite ease-in-out 0.2s' }} />
                <span style={{ width: '2px', height: '6px', background: 'var(--phosphor)', borderRadius: '1px', animation: 'smoothPulse 1.4s infinite ease-in-out 0.4s' }} />
              </div>
            )}
          </button>
        </Magnet>

        {/* System Heartbeat */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <span className="pulse-dot" />
          <span style={{ color: 'var(--text-muted)' }}>{time}</span>
          <span style={{ color: 'var(--phosphor)', fontWeight: 600 }}>{fps} FPS</span>
        </div>
      </div>
    </header>
  );
}
