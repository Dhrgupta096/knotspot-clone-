import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ShieldCheck, Sparkles, TrendingUp, AlertCircle, Award, MessageSquare, Send, Bot, Terminal, ArrowRight } from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';
import Magnet from './reactbits/Magnet';
import ShinyText from './reactbits/ShinyText';

const SUGGESTED_PROMPTS = [
  "How can DSU reach Net-Zero by 2030?",
  "Explain the DGX A100 solar time-shift algorithm",
  "What is our largest Scope 2 emission source?",
  "Calculate financial ROI & payback for +200kW solar"
];

export default function AIPlaybook({ simState = { fleetEv: 30, aiSolarShift: true, solarCapacity: 350, hvacOpt: 40 }, playSound }) {
  const [downloaded, setDownloaded] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      time: '10:15',
      content: 'Hello. I am OmniAgent, your NVIDIA NIM-powered Decarbonization Assistant. Based on current digital twin telemetry, DSU has achieved a projected carbon reduction. How may I assist your ESG audit?'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Derive dynamic metrics from simulation
  const { fleetEv, aiSolarShift, solarCapacity, hvacOpt } = simState;

  const baselineEmissions = 420;
  const fleetReduction = 120 * (fleetEv / 100);
  const computeReduction = aiSolarShift ? 46.2 : 0;
  const solarReduction = ((solarCapacity - 100) / 100) * 32;
  const hvacReduction = 28 * (hvacOpt / 100);
  const totalSaved = Math.min(baselineEmissions * 0.85, (fleetReduction + computeReduction + solarReduction + hvacReduction));
  const percentSaved = ((totalSaved / baselineEmissions) * 100).toFixed(1);
  const annualSavingsINR = ((fleetReduction * 14000 + computeReduction * 18000 + solarReduction * 16000 + hvacReduction * 11000) / 100000).toFixed(2);

  // 1-Click CSV / ESG Report Generator
  const handleDownloadReport = () => {
    if (playSound) playSound(720, 'sine', 0.12);
    const reportContent = `========================================================================
OMNICARBON PLATFORM // EXECUTIVE DECARBONIZATION AUDIT REPORT
Institution: Dayananda Sagar University (DSU) - Bangalore, India
Technology Stack: NVIDIA Metropolis Edge CV + Omniverse Digital Twin + NIM
Generated: ${new Date().toISOString()}
========================================================================

1. EXECUTIVE SUMMARY & TARGETS
------------------------------------------------------------------------
Baseline Annual Footprint:    420.0 Metric Tons CO2e
Simulated Target Footprint:   ${(baselineEmissions - totalSaved).toFixed(1)} Metric Tons CO2e
Net Carbon Reduction:         -${percentSaved}% (-${totalSaved.toFixed(1)} Tons CO2e/year)
Projected Financial ROI:      ₹${annualSavingsINR} Lakhs annual OPEX/diesel savings
Payback Horizon:              1.8 Years

2. ACTIONABLE INITIATIVES BREAKDOWN
------------------------------------------------------------------------
[PRIORITY 1 - IMMEDIATE ZERO CAPEX]
* Initiative: NVIDIA DGX Compute Solar Time-Shift (AI Eco-Scheduler)
  Status: ${aiSolarShift ? 'APPROVED / ACTIVE' : 'PENDING ACTIVATION'}
  Impact: ${computeReduction.toFixed(1)} Tons CO2e avoided
  Action: Queue student training and vision inferences to 11:00 AM - 2:30 PM.

* Initiative: Campus Transit Idling Enforcement (Metropolis CV)
  Status: ACTIVE ENFORCEMENT (YOLO-v8 Edge Inference)
  Impact: 14.8 Tons CO2e avoided
  Action: Real-time CCTV alerts when diesel shuttles idle > 3 minutes at Gate 1.

[PRIORITY 2 - MEDIUM-TERM HIGH ROI]
* Initiative: Campus Shuttle Electrification (${fleetEv}% Target)
  Impact: ${fleetReduction.toFixed(1)} Tons CO2e avoided
  CAPEX: Phased lease of 4 electric 32-seater campus transit shuttles.

* Initiative: Rooftop Photovoltaic Expansion (${solarCapacity} kW)
  Impact: ${solarReduction.toFixed(1)} Tons CO2e avoided
  Annual Clean Generation: ${(solarCapacity * 4.2 * 300).toLocaleString()} kWh

3. ESG & REGULATORY COMPLIANCE MAPPING
------------------------------------------------------------------------
* GHG Protocol Scope 1 (Direct Fuel): Fully Audited via Edge Vision
* GHG Protocol Scope 2 (Grid Electricity): Offset via On-Site Solar
* ISO 14064 Carbon Verification Standard: Certified Ready for Third-Party Audit

Audit Certified by: OmniCarbon Autonomous System
Platform Version: 2.6 Enterprise Edition
========================================================================`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `DSU_Carbon_Audit_Report_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  // Automated GenAI Reasoning Engine response generator
  const generateAgentResponse = (query) => {
    const q = query.toLowerCase();
    let reply = "";

    if (q.includes('net-zero') || q.includes('2030')) {
      reply = `To achieve Net-Zero by 2030 at DSU:\n\n1. **Phase 1 (Months 1–6):** Electrify the KS Layout ⇋ Harohalli shuttle loop (${fleetEv}% target saves ~${fleetReduction.toFixed(1)} Tons/yr).\n2. **Phase 2 (Year 1):** Expand rooftop solar to 600 kW to fully power daytime lab loads.\n3. **Phase 3 (Year 2):** Deploy 300 kWh BESS storage to capture midday solar surplus for evening research loads.\n\nProjected capital expenditure payback: ~1.8 years.`;
    } else if (q.includes('dgx') || q.includes('solar time-shift') || q.includes('algorithm')) {
      reply = `The DGX A100 Solar Time-Shift algorithm dynamically queues batch deep learning training and vision inferences to execute during Bangalore's 11:00 AM – 2:30 PM peak solar window.\n\n* **Without Shift:** Powered by grid coal baseload (~0.716 kg CO₂/kWh).\n* **With Shift:** Direct solar feed (0.00 kg CO₂/kWh).\n* **Net Impact:** Saves ~${computeReduction.toFixed(1)} Metric Tons CO₂e annually.`;
    } else if (q.includes('scope 2') || q.includes('largest')) {
      reply = `DSU's largest Scope 2 emission source is currently daytime HVAC chiller power in the Academic Blocks (~180 MWh/year), followed by the NVIDIA DGX Supercomputing Lab (~42 MWh/year).\n\nDeploying AI-driven chiller modulation and rooftop solar canopy directly counters this footprint.`;
    } else if (q.includes('roi') || q.includes('financial') || q.includes('payback')) {
      reply = `Financial Analysis for DSU Interventions:\n\n* **Annual OPEX Savings:** ₹${annualSavingsINR} Lakhs.\n* **Diesel Savings:** Avoids ~${(fleetReduction * 14000 / 100000).toFixed(2)} Lakhs in diesel.\n* **Solar Electricity Offset:** Saves ~${(solarReduction * 16000 / 100000).toFixed(2)} Lakhs in grid peak tariffs.\n* **Estimated Payback Horizon:** 1.8 Years with high IRR.`;
    } else {
      reply = `Based on your query: "${query}"\n\nOmniCarbon simulation confirms that Dayananda Sagar University is currently tracking at a **${percentSaved}% carbon reduction**, saving **${totalSaved.toFixed(1)} Tons CO₂e/yr** across transportation and AI computing workloads.`;
    }

    return reply;
  };

  const handleSendMessage = (overrideQuery) => {
    const textToSend = overrideQuery || userInput;
    if (!textToSend.trim()) return;

    if (playSound) playSound(600, 'sine', 0.05);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const newMessages = [
      ...chatMessages,
      { role: 'user', time: timeStr, content: textToSend }
    ];

    setChatMessages(newMessages);
    if (!overrideQuery) setUserInput('');
    setIsTyping(true);

    setTimeout(() => {
      const agentReply = generateAgentResponse(textToSend);
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          content: agentReply
        }
      ]);
      setIsTyping(false);
      if (playSound) playSound(720, 'triangle', 0.08);
    }, 600);
  };

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
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--phosphor)" />
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-pure)', letterSpacing: '-0.02em' }}>
              NVIDIA NIM Decarbonization Playbook
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            AI-synthesized actionable roadmaps, ROI projections, and ISO 14064 verified audit documentation.
          </p>
        </div>

        <Magnet padding={40} magnetStrength={3} maxOffset={8}>
          <button
            onClick={handleDownloadReport}
            style={{
              padding: '9px 18px',
              background: 'var(--phosphor)',
              color: '#08090d',
              border: 'none',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 18px rgba(212, 255, 0, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              outline: 'none'
            }}
          >
            <Download size={14} />
            <span>{downloaded ? 'Report Downloaded!' : 'Export ESG Audit Report'}</span>
          </button>
        </Magnet>
      </div>

      {/* AI Strategy Overview Card */}
      <SpotlightCard
        spotlightColor="rgba(212, 255, 0, 0.12)"
        spotlightSize={340}
        style={{ padding: '24px', borderRadius: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={16} color="var(--phosphor)" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--phosphor)' }}>
            NVIDIA NIM Climate Reasoning Model Output
          </span>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-pure)', marginBottom: '8px' }}>
          Recommended Decarbonization Trajectory: -{percentSaved}% CO₂e by Year 1
        </h2>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
          Based on real-time spatial digital twin simulations, Dayananda Sagar University can prevent <strong style={{ color: 'var(--phosphor)' }}>{totalSaved.toFixed(1)} Metric Tons</strong> of greenhouse emissions annually while unlocking <strong style={{ color: 'var(--emerald)' }}>₹{annualSavingsINR} Lakhs</strong> in recurring electricity and diesel savings.
        </p>

        {/* Actionable Phase Pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Phase 1 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--phosphor)' }}>
                Phase 1: Immediate Zero-CAPEX Interventions (Days 1 – 30)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>Est. Savings: ₹3.2L / yr</span>
            </div>
            <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>NVIDIA DGX Solar Time-Shift:</strong> Auto-schedule non-urgent deep learning model training into the 11:00 AM – 2:30 PM solar window. Avoids dirty peak coal grid power.</li>
              <li><strong>Metropolis CCTV Anti-Idling:</strong> Trigger automatic security gate alerts when diesel buses idle over 3 minutes. Saves ~14.8 Tons CO₂/yr.</li>
            </ul>
          </div>

          {/* Phase 2 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cyan)' }}>
                Phase 2: Medium-Term Infrastructure Upgrades (Months 1 – 6)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>Est. Savings: ₹9.8L / yr</span>
            </div>
            <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Rooftop Photovoltaic Expansion ({solarCapacity} kW):</strong> Maximize solar canopy over Academic Blocks to offset campus daytime baseline consumption.</li>
              <li><strong>Smart Chiller Frequency Inverters:</strong> Modulate server room cooling based on real-time server rack thermal telemetry rather than fixed-speed AC.</li>
            </ul>
          </div>

          {/* Phase 3 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--thermal)' }}>
                Phase 3: Net-Zero Fleet & Microgrid Transition (Year 1)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>Est. Savings: ₹16.4L / yr</span>
            </div>
            <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Campus Shuttle Electrification ({fleetEv}%):</strong> Replace diesel buses on KS Layout ⇋ Harohalli routes with 32-seater EV buses charged by campus solar microgrid.</li>
              <li><strong>BESS Storage Integration:</strong> 150 kWh battery storage to capture midday solar surplus and power campus labs during evening peak tariffs.</li>
            </ul>
          </div>
        </div>
      </SpotlightCard>

      {/* Interactive OmniAgent GenAI Copilot Console */}
      <SpotlightCard
        spotlightColor="rgba(56, 189, 248, 0.12)"
        spotlightSize={360}
        style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={17} color="var(--phosphor)" />
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-pure)' }}>
              OmniAgent Climate Reasoning Copilot
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              ONLINE (NIM v3.2)
            </span>
          </div>
        </div>

        {/* Suggested Prompt Chips with Magnet */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <Magnet key={idx} padding={30} magnetStrength={3} maxOffset={5}>
              <button
                onClick={() => handleSendMessage(prompt)}
                style={{
                  padding: '5px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '999px',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{prompt}</span>
                <ArrowRight size={10} color="var(--phosphor)" />
              </button>
            </Magnet>
          ))}
        </div>

        {/* Chat History Box */}
        <div style={{
          maxHeight: '260px',
          overflowY: 'auto',
          background: 'rgba(5, 7, 10, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>{msg.role === 'user' ? 'Operator' : 'OmniAgent (NIM)'}</span>
                <span>•</span>
                <span>{msg.time}</span>
              </div>
              <div style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '12.5px',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                background: msg.role === 'user' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(212, 255, 0, 0.06)',
                border: msg.role === 'user' ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(212, 255, 0, 0.2)',
                color: 'var(--text-pure)'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ fontSize: '11px', color: 'var(--phosphor)', fontFamily: 'var(--font-mono)' }}>
              OmniAgent is reasoning across multi-scope models...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask OmniAgent anything regarding DSU carbon targets, payback, or NVIDIA hardware..."
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'rgba(5, 7, 10, 0.7)',
              border: '1px solid var(--border-medium)',
              borderRadius: '999px',
              color: 'var(--text-pure)',
              fontSize: '12px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <Magnet padding={40} magnetStrength={3} maxOffset={6}>
            <button
              type="submit"
              style={{
                padding: '10px 18px',
                background: 'var(--phosphor)',
                color: '#08090d',
                border: 'none',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                outline: 'none'
              }}
            >
              <Send size={12} />
              <span>Send</span>
            </button>
          </Magnet>
        </form>
      </SpotlightCard>

      {/* Compliance Standards Badges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        paddingBottom: '24px'
      }}>
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.15)"
          spotlightSize={200}
          style={{ padding: '14px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <ShieldCheck size={22} color="var(--emerald)" />
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-pure)', display: 'block' }}>GHG Protocol</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scope 1, 2, 3 Verified</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(212, 255, 0, 0.15)"
          spotlightSize={200}
          style={{ padding: '14px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <Award size={22} color="var(--phosphor)" />
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-pure)', display: 'block' }}>ISO 14064 Ready</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automated Audit Logs</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(56, 189, 248, 0.15)"
          spotlightSize={200}
          style={{ padding: '14px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <TrendingUp size={22} color="var(--cyan)" />
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-pure)', display: 'block' }}>ESG Rating Boost</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+24 Pts Sustainability</span>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
