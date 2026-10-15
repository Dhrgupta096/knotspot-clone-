import React, { useState } from 'react';
import { Sliders, GitFork, ArrowDownRight, DollarSign, Leaf, Zap, BarChart3, CheckCircle2 } from 'lucide-react';
import ShinyText from './reactbits/ShinyText';
import SpotlightCard from './reactbits/SpotlightCard';
import Magnet from './reactbits/Magnet';

export default function SimulatorPanel({ simState, setSimState, onOpenPlaybook }) {
  const [activeBranch, setActiveBranch] = useState('alpha');

  // Mathematical Emission Reduction Calculations
  const fleetEv = simState.fleetEv; // 0 to 100%
  const aiSolarShift = simState.aiSolarShift; // boolean
  const solarCapacity = simState.solarCapacity; // 100 to 600 kW
  const hvacOpt = simState.hvacOpt; // 0 to 100%

  // Baseline Annual Emissions: 420 Metric Tons CO2e
  const baselineEmissions = 420;

  // Reductions:
  const fleetReduction = 120 * (fleetEv / 100);
  const computeReduction = aiSolarShift ? 46.2 : 0;
  const solarReduction = ((solarCapacity - 100) / 100) * 32;
  const hvacReduction = 28 * (hvacOpt / 100);

  const totalCarbonSaved = Math.min(baselineEmissions * 0.85, (fleetReduction + computeReduction + solarReduction + hvacReduction));
  const currentEmissions = Math.max(45, baselineEmissions - totalCarbonSaved);
  const percentReduction = ((totalCarbonSaved / baselineEmissions) * 100).toFixed(1);

  // Financial Savings in Lakhs INR (1 Lakh = 100,000 INR)
  const annualSavingsINR = ((fleetReduction * 14000 + computeReduction * 18000 + solarReduction * 16000 + hvacReduction * 11000) / 100000).toFixed(2);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '28px 36px',
      overflowY: 'auto',
      maxWidth: '1280px',
      margin: '0 auto'
    }}>
      {/* Header & Scenario Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--phosphor)" />
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-pure)', letterSpacing: '-0.02em' }}>
              What-If Decarbonization Sandbox
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
            Interactive mathematical physics simulation of DSU campus interventions & ROI.
          </p>
        </div>

        {/* Fork Scenario Tabs with React Bits Magnet */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '3px',
          borderRadius: '999px',
          border: '1px solid var(--border-subtle)'
        }}>
          <Magnet padding={40} magnetStrength={3} maxOffset={6}>
            <button
              onClick={() => setActiveBranch('alpha')}
              style={{
                padding: '5px 14px',
                background: activeBranch === 'alpha' ? 'rgba(212, 255, 0, 0.12)' : 'transparent',
                border: activeBranch === 'alpha' ? '1px solid var(--border-active)' : '1px solid transparent',
                color: activeBranch === 'alpha' ? 'var(--phosphor)' : 'var(--text-secondary)',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <GitFork size={12} />
              <span>Branch Alpha (Target 2027)</span>
            </button>
          </Magnet>

          <Magnet padding={40} magnetStrength={3} maxOffset={6}>
            <button
              onClick={() => setActiveBranch('beta')}
              style={{
                padding: '5px 14px',
                background: activeBranch === 'beta' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                border: activeBranch === 'beta' ? '1px solid var(--cyan)' : '1px solid transparent',
                color: activeBranch === 'beta' ? 'var(--cyan)' : 'var(--text-secondary)',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <GitFork size={12} />
              <span>Branch Beta (Aggressive Net-Zero)</span>
            </button>
          </Magnet>
        </div>
      </div>

      {/* Primary KPI Results Bar with SpotlightCards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
      }}>
        {/* KPI 1: Carbon Reduction */}
        <div className="hud-corner-box">
          <SpotlightCard
            spotlightColor="rgba(212, 255, 0, 0.18)"
            spotlightSize={260}
            style={{ padding: '18px', borderRadius: '16px' }}
          >
            <span className="swiss-label" style={{ color: 'var(--phosphor)' }}>
              [CARBON REDUCTION]
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0 4px' }}>
              <ShinyText
                text={`-${percentReduction}%`}
                color="var(--phosphor)"
                shineColor="#ffffff"
                speed={2}
                style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
              />
              <ArrowDownRight size={16} color="var(--phosphor)" />
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {totalCarbonSaved.toFixed(1)} Tons CO₂e avoided/yr
            </span>
          </SpotlightCard>
        </div>

        {/* KPI 2: Annual Cost Savings */}
        <div className="hud-corner-box">
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.18)"
            spotlightSize={260}
            style={{ padding: '18px', borderRadius: '16px' }}
          >
            <span className="swiss-label" style={{ color: 'var(--emerald)' }}>
              [ANNUAL OPEX SAVINGS]
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '6px 0 4px' }}>
              <ShinyText
                text={`₹${annualSavingsINR}L`}
                color="var(--emerald)"
                shineColor="#ffffff"
                speed={2.2}
                style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Power & diesel expenditure savings
            </span>
          </SpotlightCard>
        </div>

        {/* KPI 3: Projected Net Footprint */}
        <div className="hud-corner-box cyan">
          <SpotlightCard
            spotlightColor="rgba(56, 189, 248, 0.18)"
            spotlightSize={260}
            style={{ padding: '18px', borderRadius: '16px' }}
          >
            <span className="swiss-label" style={{ color: 'var(--cyan)' }}>
              [PROJECTED FOOTPRINT]
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '6px 0 4px' }}>
              <span className="mono-nums" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-pure)' }}>
                {currentEmissions.toFixed(0)}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tons CO₂e/yr</span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Down from 420 Tons baseline
            </span>
          </SpotlightCard>
        </div>

        {/* KPI 4: Estimated Payback */}
        <div className="hud-corner-box">
          <SpotlightCard
            spotlightColor="rgba(255, 255, 255, 0.12)"
            spotlightSize={260}
            style={{ padding: '18px', borderRadius: '16px' }}
          >
            <span className="swiss-label" style={{ color: 'var(--text-muted)' }}>
              [PAYBACK PERIOD]
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '6px 0 4px' }}>
              <span className="mono-nums" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--cyan)' }}>
                1.8 Years
              </span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              High capital efficiency
            </span>
          </SpotlightCard>
        </div>
      </div>

      {/* Interactive Simulation Sliders Deck */}
      <div className="hud-corner-box">
        <SpotlightCard
          spotlightColor="rgba(212, 255, 0, 0.08)"
          spotlightSize={400}
          style={{ padding: '24px', borderRadius: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-pure)', letterSpacing: '-0.02em' }}>
                Intervention Levers
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Adjust parameters below to dynamically recalculate carbon footprint across campus systems.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="telemetry-chip active">IPCC SCOPE 1 & 2</span>
              <span className="telemetry-chip">IISc TABLE 6 COMPLIANT</span>
            </div>
          </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Lever 1: Campus Shuttle Electrification */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-pure)' }}>
                1. Campus Shuttle Fleet Electrification
              </span>
              <span className="mono-nums" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--phosphor)' }}>
                {fleetEv}% Electrified
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={fleetEv}
              onChange={(e) => setSimState(prev => ({ ...prev, fleetEv: Number(e.target.value) }))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>0% Diesel Baseline</span>
              <span>50% Hybrid Fleet</span>
              <span>100% Zero-Emission Fleet</span>
            </div>
          </div>

          {/* Lever 2: NVIDIA DGX Compute Solar Time-Shift */}
          <div style={{
            background: 'rgba(212, 255, 0, 0.04)',
            border: '1px solid rgba(212, 255, 0, 0.18)',
            padding: '16px 20px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--phosphor)', display: 'block' }}>
                2. NVIDIA DGX AI Compute: Carbon-Aware Workload Shift
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                Automatically schedule non-urgent model training jobs to run during the peak solar window (11:00 AM – 2:30 PM), avoiding fossil peak grid energy.
              </p>
            </div>
            <Magnet padding={40} magnetStrength={3} maxOffset={6}>
              <button
                onClick={() => setSimState(prev => ({ ...prev, aiSolarShift: !prev.aiSolarShift }))}
                style={{
                  padding: '8px 18px',
                  background: aiSolarShift ? 'var(--phosphor)' : 'rgba(255, 255, 255, 0.08)',
                  color: aiSolarShift ? '#08090d' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none'
                }}
              >
                {aiSolarShift ? 'Active (Solar Shifted)' : 'Disabled'}
              </button>
            </Magnet>
          </div>

          {/* Lever 3: Rooftop Solar Expansion */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-pure)' }}>
                3. Campus Rooftop Solar Capacity
              </span>
              <span className="mono-nums" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--emerald)' }}>
                {solarCapacity} kW Installed
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="50"
              value={solarCapacity}
              onChange={(e) => setSimState(prev => ({ ...prev, solarCapacity: Number(e.target.value) }))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>100 kW Baseline</span>
              <span>350 kW Target</span>
              <span>600 kW Campus Canopy</span>
            </div>
          </div>

          {/* Lever 4: Smart HVAC Optimization */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-pure)' }}>
                4. AI Chiller & HVAC Variable Speed Modulation
              </span>
              <span className="mono-nums" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cyan)' }}>
                {hvacOpt}% Optimized
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={hvacOpt}
              onChange={(e) => setSimState(prev => ({ ...prev, hvacOpt: Number(e.target.value) }))}
            />
          </div>
        </div>
      </SpotlightCard>
      </div>

      {/* Action CTA: Push into GenAI Playbook */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', paddingBottom: '24px' }}>
        <Magnet padding={60} magnetStrength={3} maxOffset={10}>
          <button
            onClick={onOpenPlaybook}
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              background: 'var(--phosphor)',
              color: '#08090d',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 24px rgba(212, 255, 0, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              outline: 'none'
            }}
          >
            <Leaf size={15} />
            <span>Generate Decarbonization Playbook</span>
          </button>
        </Magnet>
      </div>
    </div>
  );
}
