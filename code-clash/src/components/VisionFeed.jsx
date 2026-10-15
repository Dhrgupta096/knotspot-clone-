import React, { useState, useEffect } from 'react';
import { 
  Video, ShieldAlert, Cpu, Eye, Radio, Sparkles, Filter, AlertTriangle, 
  CheckCircle, Camera, Zap, Thermometer, Layers, CheckCircle2, Send, 
  ExternalLink, X, Activity, Copy, Check, Crosshair, Download, Sliders, 
  BarChart2, CornerDownRight, Terminal, Gauge
} from 'lucide-react';
import ShinyText from './reactbits/ShinyText';
import SpotlightCard from './reactbits/SpotlightCard';
import Magnet from './reactbits/Magnet';

const CAMERAS = [
  {
    id: 'cam-01',
    code: 'CAM-01',
    name: 'DSU South Gate Transit Loop',
    category: 'Scope 1 Tailpipe Tracking',
    streamUrl: 'rtsp://10.24.4.12/metropolis/gate1-live',
    location: 'Gate 1 KS Layout Depot',
    inferenceModel: 'YOLO-v8x TensorRT FP16',
    detections: [
      {
        id: 'BUS-12',
        label: 'Diesel Shuttle #12',
        plate: 'KA-05-MN-8841',
        engine: 'BS-IV 6-Cylinder Turbo Diesel',
        status: 'IDLING EXCEEDED',
        idleTime: '08:42 min',
        burn: '0.28 L/min',
        co2: '+3.72 kg CO2',
        pm25: '84.2 µg/m³ (Severe)',
        x: 26,
        y: 34,
        w: 28,
        h: 24,
        isEv: false,
        alert: true
      },
      {
        id: 'EV-04',
        label: 'Staff EV Hatchback',
        plate: 'KA-01-EV-4419',
        engine: 'Permanent Magnet Synchronous Motor (72 kWh)',
        status: 'CHARGING DOCK',
        idleTime: '00:00',
        burn: '0.00 L/min',
        co2: '0.00 kg CO2',
        pm25: '0.0 µg/m³ (Zero)',
        x: 62,
        y: 52,
        w: 18,
        h: 18,
        isEv: true,
        alert: false
      },
      {
        id: 'VAN-02',
        label: 'Delivery Cargo Van',
        plate: 'KA-04-TR-9102',
        engine: 'Common Rail Diesel (2.2L)',
        status: 'UNLOADING IDLE',
        idleTime: '04:15 min',
        burn: '0.19 L/min',
        co2: '+1.84 kg CO2',
        pm25: '48.1 µg/m³ (Moderate)',
        x: 10,
        y: 64,
        w: 22,
        h: 20,
        isEv: false,
        alert: true
      },
      {
        id: 'SCOOT-09',
        label: 'Student EV Scooter',
        plate: 'KA-05-ES-1204',
        engine: 'Electric Hub Motor (3.7 kWh)',
        status: 'PARKED',
        idleTime: '--',
        burn: '0.00 L/min',
        co2: '0.00 kg CO2',
        pm25: '0.0 µg/m³ (Zero)',
        x: 78,
        y: 28,
        w: 14,
        h: 16,
        isEv: true,
        alert: false
      },
    ]
  },
  {
    id: 'cam-02',
    code: 'CAM-02',
    name: 'NVIDIA DGX AI Supercomputing Lab',
    category: 'Scope 2 High-Density Compute',
    streamUrl: 'rtsp://10.24.4.18/metropolis/dgx-rack-live',
    location: 'Engineering Block 3 - Clean Room B',
    inferenceModel: 'Thermal-UNet TensorRT FP16',
    detections: [
      {
        id: 'RACK-01',
        label: 'DGX A100 Primary Cluster',
        plate: 'NVIDIA-DGX-SXM4-01',
        engine: '8x A100 80GB (3,200W TDP)',
        status: 'ACTIVE INFERENCE',
        temp: '64.2°C',
        power: '4.8 kW Active',
        airVelocity: '4.2 m/s',
        x: 22,
        y: 25,
        w: 26,
        h: 48,
        isEv: true,
        alert: false
      },
      {
        id: 'RACK-02',
        label: 'DGX Station Workstation',
        plate: 'NVIDIA-DGX-DESK-04',
        engine: '4x A100 Tensor Core',
        status: 'STANDBY ECO',
        temp: '48.1°C',
        power: '1.2 kW Standby',
        airVelocity: '2.8 m/s',
        x: 55,
        y: 25,
        w: 24,
        h: 48,
        isEv: true,
        alert: false
      },
      {
        id: 'CHILL-01',
        label: 'Liebert Chiller Exhaust',
        plate: 'HVAC-CHILL-VFD-02',
        engine: 'Variable Speed Inverter Compressor',
        status: 'SOLAR SYNC',
        temp: '32.4°C',
        power: '2.4 kW',
        airVelocity: '5.8 m/s',
        x: 42,
        y: 78,
        w: 20,
        h: 16,
        isEv: true,
        alert: false
      }
    ]
  },
  {
    id: 'cam-03',
    code: 'CAM-03',
    name: 'Block C Rooftop Solar Farm',
    category: 'Zero-Carbon Generation',
    streamUrl: 'rtsp://10.24.4.24/metropolis/solar-roof-live',
    location: 'Rooftop Elevation 42m',
    inferenceModel: 'PV-Anomaly-Detect DeepStream 7.0',
    detections: [
      {
        id: 'ARRAY-A',
        label: 'Monocrystalline String 1',
        plate: 'SOLAR-PV-STRING-01',
        engine: '540W Tier-1 Bifacial N-Type',
        status: 'OPTIMAL GENERATION',
        irradiance: '942 W/m²',
        efficiency: '21.4%',
        yield: '142 kW',
        x: 18,
        y: 28,
        w: 32,
        h: 36,
        isEv: true,
        alert: false
      },
      {
        id: 'ARRAY-B',
        label: 'Monocrystalline String 2',
        plate: 'SOLAR-PV-STRING-02',
        engine: '540W Tier-1 Bifacial N-Type',
        status: 'OPTIMAL GENERATION',
        irradiance: '938 W/m²',
        efficiency: '21.1%',
        yield: '138 kW',
        x: 54,
        y: 28,
        w: 32,
        h: 36,
        isEv: true,
        alert: false
      },
      {
        id: 'INVERT-01',
        label: 'ABB Solar Central Inverter',
        plate: 'ABB-PVS980-GRID',
        engine: '1500V Utility Transformer Inverter',
        status: 'GRID SYNCHRONIZED',
        temp: '38.5°C',
        power: '280 kW',
        yield: '98.8% Conv.',
        x: 40,
        y: 72,
        w: 22,
        h: 20,
        isEv: true,
        alert: false
      }
    ]
  }
];

const PRECISION_MODES = {
  fp16: {
    label: 'FP16 TensorRT (High Fidelity)',
    short: 'FP16',
    latency: '11.4 ms',
    fps: '87.7 FPS',
    mapScore: '98.4%',
    power: '4.2 W',
    memoryBandwidth: '138.4 GB/s',
    stages: [
      { name: 'DMA & NVMM Decode', duration: '1.2 ms', pct: 10.5, color: 'var(--cyan)' },
      { name: 'Pre-Proc & Letterbox', duration: '0.8 ms', pct: 7.0, color: 'var(--phosphor)' },
      { name: 'CUDA SM80 GEMM Core', duration: '7.4 ms', pct: 64.9, color: 'var(--emerald)' },
      { name: 'NMS IoU Post-Proc', duration: '2.0 ms', pct: 17.5, color: '#f59e0b' }
    ]
  },
  int8: {
    label: 'INT8 PTQ Calibrated (Max Throughput)',
    short: 'INT8',
    latency: '5.2 ms',
    fps: '192.3 FPS',
    mapScore: '96.8%',
    power: '2.1 W',
    memoryBandwidth: '74.2 GB/s',
    stages: [
      { name: 'DMA & NVMM Decode', duration: '1.2 ms', pct: 23.1, color: 'var(--cyan)' },
      { name: 'Pre-Proc & Quantize', duration: '0.7 ms', pct: 13.5, color: 'var(--phosphor)' },
      { name: 'Tensor Core INT8 GEMM', duration: '2.1 ms', pct: 40.4, color: 'var(--emerald)' },
      { name: 'NMS IoU Post-Proc', duration: '1.2 ms', pct: 23.0, color: '#f59e0b' }
    ]
  },
  fp32: {
    label: 'FP32 Unquantized Baseline',
    short: 'FP32',
    latency: '24.6 ms',
    fps: '40.6 FPS',
    mapScore: '98.7%',
    power: '7.8 W',
    memoryBandwidth: '276.8 GB/s',
    stages: [
      { name: 'DMA & NVMM Decode', duration: '1.2 ms', pct: 4.9, color: 'var(--cyan)' },
      { name: 'Pre-Proc & Resize', duration: '0.9 ms', pct: 3.7, color: 'var(--phosphor)' },
      { name: 'FP32 Dense CUDA Math', duration: '19.8 ms', pct: 80.5, color: 'var(--emerald)' },
      { name: 'NMS IoU Post-Proc', duration: '2.7 ms', pct: 10.9, color: '#f59e0b' }
    ]
  }
};

const getSoftmaxDistribution = (det) => {
  if (!det) return [];
  if (det.id === 'BUS-12' || det.label?.toLowerCase().includes('bus') || det.label?.toLowerCase().includes('shuttle')) {
    return [
      { class: 'Diesel Heavy Shuttle Bus (M3)', prob: 98.4, color: 'var(--thermal)' },
      { class: 'Commercial Delivery Cargo Van', prob: 1.2, color: 'var(--text-muted)' },
      { class: 'Electric Transit Bus', prob: 0.4, color: 'var(--cyan)' }
    ];
  }
  if (det.isEv || det.label?.toLowerCase().includes('ev') || det.label?.toLowerCase().includes('scooter')) {
    return [
      { class: 'Zero-Emission EV Powertrain', prob: 99.1, color: 'var(--phosphor)' },
      { class: 'Hybrid Electric Light Vehicle', prob: 0.6, color: 'var(--text-muted)' },
      { class: 'Internal Combustion Engine', prob: 0.3, color: 'var(--cyan)' }
    ];
  }
  if (det.id?.startsWith('RACK') || det.label?.toLowerCase().includes('dgx')) {
    return [
      { class: 'NVIDIA DGX A100 SXM4 Substrate', prob: 99.4, color: 'var(--phosphor)' },
      { class: 'Standard 2U Rackmount Server', prob: 0.5, color: 'var(--cyan)' },
      { class: 'SAN Enterprise Storage Bay', prob: 0.1, color: 'var(--text-muted)' }
    ];
  }
  if (det.id?.startsWith('ARRAY') || det.label?.toLowerCase().includes('solar')) {
    return [
      { class: 'Bifacial N-Type Monocrystalline PV', prob: 98.9, color: 'var(--emerald)' },
      { class: 'Standard Polycrystalline Module', prob: 0.9, color: 'var(--cyan)' },
      { class: 'Thin-Film Cadmium Telluride Array', prob: 0.2, color: 'var(--text-muted)' }
    ];
  }
  return [
    { class: det.label || 'Detected Asset', prob: 97.8, color: 'var(--cyan)' },
    { class: 'Secondary Campus Utility Asset', prob: 1.8, color: 'var(--text-muted)' },
    { class: 'Background Optical Clutter', prob: 0.4, color: 'var(--text-muted)' }
  ];
};

export default function VisionFeed({ simState = { fleetEv: 30, aiSolarShift: true }, playSound }) {
  const [activeCamIndex, setActiveCamIndex] = useState(0);
  const [visionMode, setVisionMode] = useState('optical'); // 'optical' | 'thermal' | 'edge'
  const [testAlertTriggered, setTestAlertTriggered] = useState(false);
  const [violationResolved, setViolationResolved] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [quantizationMode, setQuantizationMode] = useState('fp16'); // 'fp16' | 'int8' | 'fp32'
  const [laserScanningId, setLaserScanningId] = useState(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [downloadedCsv, setDownloadedCsv] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);

  const [tickerLogs, setTickerLogs] = useState([
    { time: '10:14:22', text: 'Gate 1 Cam: Diesel Bus #12 exceeded 3-minute idle threshold.' },
    { time: '10:14:18', text: 'NVIDIA DeepStream: Bounding box confidence 98.4% (YOLO-v8 TensorRT).' },
    { time: '10:14:05', text: 'Parking Bay: EV Shuttle charged via rooftop solar node.' },
  ]);

  const activeCam = CAMERAS[activeCamIndex];

  // Dynamic Detections adjusted by simState and enforcement actions
  const dynamicDetections = activeCam.detections.map(det => {
    if (activeCam.id === 'cam-01' && det.id === 'BUS-12') {
      if (violationResolved) {
        return {
          ...det,
          status: 'DISPATCH ACKNOWLEDGED - ENGINE OFF',
          burn: '0.00 L/min',
          co2: '0.00 kg CO2 (Halted)',
          pm25: '0.0 µg/m³ (Idle Stopped)',
          alert: false
        };
      }
      if (simState?.fleetEv > 50) {
        return {
          ...det,
          label: 'Electric Shuttle #12 (Retrofit)',
          status: 'ZERO EMISSION TRANSIT',
          idleTime: '00:00 min',
          burn: '0.00 L/min',
          co2: '0.00 kg CO2',
          isEv: true,
          alert: false
        };
      }
    }
    if (activeCam.id === 'cam-02' && simState?.aiSolarShift && det.id === 'RACK-01') {
      return {
        ...det,
        status: 'SOLAR-SYNCHRONIZED COMPUTE',
        power: '4.8 kW (100% Rooftop Solar)'
      };
    }
    return det;
  });

  // Background stream simulated logs
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const pool = [
        `TensorRT FP16: Bounding box tracking verified across 32 stream frames.`,
        `Tailpipe Optical Density: Idle particulate matter index 0.12 g/min.`,
        `Solar Rooftop: Direct DC-to-Compute microgrid load factor 94.2%.`,
        `NVIDIA DeepStream 7.0: Zero inference drop rate (59.9 FPS steady).`
      ];
      const randomText = pool[Math.floor(Math.random() * pool.length)];
      setTickerLogs(prev => [{ time: timeStr, text: randomText }, ...prev.slice(0, 5)]);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleCameraChange = (idx) => {
    setActiveCamIndex(idx);
    setSelectedDetection(null);
    if (playSound) playSound(580, 'sine', 0.06);
  };

  const handleModeChange = (mode) => {
    setVisionMode(mode);
    if (playSound) playSound(640, 'triangle', 0.08);
  };

  const handleTriggerViolation = () => {
    if (playSound) playSound(880, 'sawtooth', 0.22);
    setTestAlertTriggered(true);
    setViolationResolved(false);
    const now = new Date().toTimeString().split(' ')[0];
    setTickerLogs(prev => [
      { time: now, text: `🚨 ALERT: Scope 1 Tailpipe Violation - Shuttle #12 Idling > 3m (Gate 1). Operator attention required.` },
      ...prev.slice(0, 5)
    ]);
  };

  const handleDispatchMarshal = () => {
    if (playSound) playSound(520, 'square', 0.18);
    setViolationResolved(true);
    setTestAlertTriggered(false);
    const now = new Date().toTimeString().split(' ')[0];
    setTickerLogs(prev => [
      { time: now, text: `✓ DISPATCH CONFIRMED: Gate 1 Security Marshal notified driver of Shuttle #12. Engine turned off. Tailpipe burn halted.` },
      ...prev.slice(0, 5)
    ]);
  };

  const handleTriggerLaserSweep = (id) => {
    setLaserScanningId(id);
    if (playSound) playSound(880, 'sawtooth', 0.18);
    setTimeout(() => {
      setLaserScanningId(null);
    }, 3200);
  };

  const handleCopyTensorJson = (det) => {
    const currentMetrics = PRECISION_MODES[quantizationMode];
    const ymin = parseFloat((det.y / 100).toFixed(3));
    const xmin = parseFloat((det.x / 100).toFixed(3));
    const ymax = parseFloat(((det.y + det.h) / 100).toFixed(3));
    const xmax = parseFloat(((det.x + det.w) / 100).toFixed(3));
    
    const payload = {
      schema_version: "2.4.0",
      inference_engine: "NVIDIA TensorRT 10.2 / DeepStream 7.0",
      hardware: "NVIDIA Jetson AGX Orin 64GB (275 TOPS)",
      stream_id: activeCam.code,
      stream_location: activeCam.location,
      quantization_precision: currentMetrics.short,
      pipeline_latency_ms: currentMetrics.latency,
      inference_throughput_fps: currentMetrics.fps,
      power_draw_w: currentMetrics.power,
      memory_bandwidth: currentMetrics.memoryBandwidth,
      stage_breakdown: currentMetrics.stages,
      target_detection: {
        asset_id: det.id,
        label: det.label,
        plate: det.plate,
        status: det.status,
        confidence_softmax: getSoftmaxDistribution(det),
        normalized_tensor_bbox: [ymin, xmin, ymax, xmax],
        spatial_depth_distance_m: 18.2,
        powertrain_specs: det.engine,
        empirical_emissions: {
          instantaneous_burn: det.burn || "0.00 L/min",
          surge_penalty_hourly: det.co2 || "0.00 kg CO2",
          iisc_ramachandra_factor: "567.03 g CO2/km (Table 6)",
          karnataka_cea_v20_baseline: "0.716 kg CO2/kWh"
        }
      }
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    if (playSound) playSound(640, 'triangle', 0.1);
    setTimeout(() => setCopiedJson(false), 2400);
  };

  const handleExportInferenceAuditCsv = (det) => {
    const currentMetrics = PRECISION_MODES[quantizationMode];
    const now = new Date().toISOString();
    const csvHeaders = "Timestamp,Camera,Model,Precision,TargetID,Label,Identifier,Confidence,Latency_ms,FPS,Status,BurnRate,HourlySurge,IISc_EmissionFactor\n";
    const csvRow = `"${now}","${activeCam.code}","${activeCam.inferenceModel}","${currentMetrics.short}","${det.id}","${det.label}","${det.plate}","98.4%","${currentMetrics.latency}","${currentMetrics.fps}","${det.status}","${det.burn || '0.00 L/min'}","${det.co2 || '0.00 kg'}","567.03 g/km (IISc Table 6)"\n`;
    const blob = new Blob([csvHeaders + csvRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dsu_edge_inference_${det.id.toLowerCase()}_audit.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadedCsv(true);
    if (playSound) playSound(520, 'square', 0.12);
    setTimeout(() => setDownloadedCsv(false), 2400);
  };

  const activeSelectedDet = dynamicDetections.find(d => d.id === selectedDetection?.id) || selectedDetection;


  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      overflowY: 'auto'
    }}>
      {/* Top Header: Title & Camera Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={18} color="var(--phosphor)" />
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-pure)', letterSpacing: '-0.02em' }}>
              Metropolis Edge Computer Vision
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Real-time inference tracking fleet tailpipe emissions & AI compute server thermals.
          </p>
        </div>

        {/* Camera Selector Tabs with React Bits Magnet */}
        <div style={{
          display: 'flex',
          gap: '3px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '3px',
          borderRadius: '999px',
          border: '1px solid var(--border-subtle)'
        }}>
          {CAMERAS.map((cam, idx) => {
            const isActive = activeCamIndex === idx;
            return (
              <Magnet key={cam.id} padding={40} magnetStrength={3} maxOffset={6}>
                <button
                  onClick={() => handleCameraChange(idx)}
                  style={{
                    padding: '5px 13px',
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
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Camera size={11} color={isActive ? 'var(--phosphor)' : 'currentColor'} />
                  <span>{cam.name.split(' ')[0]} {cam.code}</span>
                </button>
              </Magnet>
            );
          })}
        </div>
      </div>

      {/* Tactical Edge AI Inference Telemetry Ribbon (neutomni.com + drone.riotters.com inspired) */}
      <div className="hud-corner-box cyan" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: 'rgba(7, 10, 16, 0.85)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '8px',
        padding: '7px 14px',
        backdropFilter: 'blur(16px)',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot cyan" style={{ width: '6px', height: '6px' }} />
            <span className="swiss-label" style={{ color: 'var(--cyan)' }}>[TENSORRT 10.2 ENGINE]</span>
            <span style={{ color: 'var(--text-pure)', fontWeight: 600 }}>{activeCam.inferenceModel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
            <span>•</span>
            <span style={{ color: 'var(--phosphor)' }}>{PRECISION_MODES[quantizationMode].short}</span>
            <span>• LATENCY: <strong style={{ color: 'var(--text-pure)' }}>{PRECISION_MODES[quantizationMode].latency}</strong></span>
            <span>• THROUGHPUT: <strong style={{ color: 'var(--emerald)' }}>{PRECISION_MODES[quantizationMode].fps}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="telemetry-chip active">
            {dynamicDetections.length} TARGETS ACQUIRED
          </span>
          <button
            onClick={() => {
              const target = selectedDetection ? null : dynamicDetections[0];
              setSelectedDetection(target);
              if (playSound) playSound(target ? 640 : 440, 'triangle', 0.08);
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: selectedDetection ? 'rgba(212, 255, 0, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: selectedDetection ? '1px solid var(--border-active)' : '1px solid rgba(255, 255, 255, 0.12)',
              color: selectedDetection ? 'var(--phosphor)' : 'var(--text-secondary)',
              fontSize: '10.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <Cpu size={12} />
            <span>{selectedDetection ? 'CLOSE FORENSICS' : 'INSPECT INFERENCE STACK'}</span>
          </button>

          <button
            onClick={() => {
              setShowArchModal(true);
              if (playSound) playSound(680, 'sine', 0.08);
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: 'var(--cyan)',
              fontSize: '10.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={12} />
            <span>NEURAL PIPELINE FLOW</span>
          </button>
        </div>
      </div>

      {/* Main CCTV Stream Viewport */}
      <div className="tactical-panel hud-corner-box scanlines" style={{
        height: '400px',
        position: 'relative',
        background: visionMode === 'thermal'
          ? 'radial-gradient(circle at 45% 45%, #7f1d1d 0%, #450a0a 35%, #180505 70%, #030712 100%)'
          : (visionMode === 'edge' ? '#020617' : 'linear-gradient(180deg, #090e17 0%, #05080f 100%)'),
        border: (testAlertTriggered && !violationResolved) ? '2px solid var(--thermal)' : '1px solid var(--border-medium)',
        boxShadow: (testAlertTriggered && !violationResolved) ? '0 0 25px rgba(255, 85, 0, 0.4)' : 'none',
        overflow: 'hidden',
        transition: 'border 0.2s, box-shadow 0.2s'
      }}>
        {/* Spatial Atmospheric Vignette & Scanlines */}
        <div className="spatial-vignette" />
        <div className="hud-scanlines" />

        {/* Background Visual Graphics based on active Camera */}
        {activeCam.id === 'cam-01' && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: visionMode === 'edge' ? 0.7 : 0.28 }}>
            <line x1="0" y1="52%" x2="100%" y2="52%" stroke={visionMode === 'edge' ? '#00f0ff' : '#38bdf8'} strokeDasharray="14 12" strokeWidth="2" />
            <line x1="28%" y1="0" x2="28%" y2="100%" stroke={visionMode === 'edge' ? '#d4ff00' : '#475569'} strokeWidth="1" />
            <line x1="72%" y1="0" x2="72%" y2="100%" stroke={visionMode === 'edge' ? '#d4ff00' : '#475569'} strokeWidth="1" />
            {/* Bus Bay Stalls */}
            <rect x="22%" y="30%" width="34%" height="32%" fill="none" stroke="rgba(255, 85, 0, 0.3)" strokeDasharray="6 4" strokeWidth="1" />
            <rect x="58%" y="48%" width="24%" height="26%" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeDasharray="6 4" strokeWidth="1" />
          </svg>
        )}

        {/* Animated Tailpipe Smoke Plume when Bus 12 Idling */}
        {activeCam.id === 'cam-01' && !violationResolved && (testAlertTriggered || simState?.fleetEv <= 50) && (
          <div style={{
            position: 'absolute',
            left: '22%',
            top: '40%',
            pointerEvents: 'none',
            zIndex: 5
          }}>
            <svg width="60" height="60" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              <circle cx="20" cy="50" r="12" fill={visionMode === 'thermal' ? '#f97316' : '#64748b'} opacity="0.45" style={{ animation: 'radarPulse 1.8s infinite' }} />
              <circle cx="35" cy="35" r="18" fill={visionMode === 'thermal' ? '#ef4444' : '#475569'} opacity="0.35" style={{ animation: 'radarPulse 2.2s infinite 0.3s' }} />
              <circle cx="50" cy="18" r="22" fill={visionMode === 'thermal' ? '#dc2626' : '#334155'} opacity="0.25" style={{ animation: 'radarPulse 2.6s infinite 0.6s' }} />
            </svg>
          </div>
        )}

        {activeCam.id === 'cam-02' && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: visionMode === 'edge' ? 0.8 : 0.35 }}>
            <rect x="18%" y="20%" width="32%" height="56%" fill="none" stroke={visionMode === 'edge' ? '#00f0ff' : '#00f0ff'} strokeWidth="1.5" />
            <rect x="52%" y="20%" width="30%" height="56%" fill="none" stroke={visionMode === 'edge' ? '#00f0ff' : '#00f0ff'} strokeWidth="1.5" />
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <line key={i} x1="18%" y1={`${24 + i * 7.5}%`} x2="50%" y2={`${24 + i * 7.5}%`} stroke="rgba(0, 240, 255, 0.3)" strokeWidth="1" />
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <line key={i} x1="52%" y1={`${24 + i * 7.5}%`} x2="82%" y2={`${24 + i * 7.5}%`} stroke="rgba(0, 240, 255, 0.3)" strokeWidth="1" />
            ))}
          </svg>
        )}

        {activeCam.id === 'cam-03' && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: visionMode === 'edge' ? 0.8 : 0.35 }}>
            <rect x="15%" y="24%" width="36%" height="42%" fill="none" stroke={visionMode === 'edge' ? '#d4ff00' : '#10b981'} strokeWidth="1.5" />
            <rect x="52%" y="24%" width="36%" height="42%" fill="none" stroke={visionMode === 'edge' ? '#d4ff00' : '#10b981'} strokeWidth="1.5" />
            <line x1="15%" y1="38%" x2="51%" y2="38%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
            <line x1="15%" y1="52%" x2="51%" y2="52%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
            <line x1="52%" y1="38%" x2="88%" y2="38%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
            <line x1="52%" y1="52%" x2="88%" y2="52%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
          </svg>
        )}

        {/* Top Left: Stream Details */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--cyan)',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          textShadow: '0 0 8px rgba(0, 240, 255, 0.4)',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 800 }}>{activeCam.code}: {activeCam.name.toUpperCase()}</span>
            <span style={{ fontSize: '9px', background: 'rgba(0, 240, 255, 0.15)', padding: '1px 5px', borderRadius: '2px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
              {activeCam.category}
            </span>
          </div>
          <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>STREAM URI: {activeCam.streamUrl}</span>
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>MODEL: {activeCam.inferenceModel}</span>
        </div>

        {/* Top Right: Inference Performance Counter with ShinyText */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          textAlign: 'right',
          color: 'var(--phosphor)',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
            <span className="pulse-dot" style={{ display: 'inline-block' }} />
            <ShinyText
              text="LIVE INFERENCE • 59.9 FPS"
              color="var(--phosphor)"
              shineColor="#ffffff"
              speed={2}
              style={{ fontWeight: 800 }}
            />
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>TENSORRT FP16 • LATENCY 8.4ms</div>
          <div style={{ fontSize: '8.5px', color: 'var(--cyan)', marginTop: '2px' }}>METROPOLIS VISION PIPELINE ACTIVE</div>
        </div>

        {/* Bottom Hardware & Edge Telemetry Bar */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '9.5px',
          color: 'var(--text-muted)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '6px',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="swiss-label" style={{ color: 'var(--cyan)' }}>[EDGE ACCELERATOR]</span>
            <span>NVIDIA JETSON AGX ORIN • 275 TOPS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>FP16 TENSOR CORES</span>
            <span style={{ color: 'var(--phosphor)', fontWeight: 700 }}>0% FRAME DROP</span>
          </div>
        </div>

        {/* Real-time Bounding Boxes Overlay (Clickable to Inspect!) */}
        {dynamicDetections.map((det) => {
          const isAlert = det.alert || (testAlertTriggered && !violationResolved && det.id === 'BUS-12');
          const boxColor = isAlert ? 'var(--thermal)' : (det.isEv ? 'var(--phosphor)' : 'var(--cyan)');
          const isSelected = selectedDetection?.id === det.id;

          return (
            <div
              key={det.id}
              onClick={() => {
                setSelectedDetection(det);
                if (playSound) playSound(640, 'triangle', 0.08);
              }}
              style={{
                position: 'absolute',
                left: `${det.x}%`,
                top: `${det.y}%`,
                width: `${det.w}%`,
                height: `${det.h}%`,
                border: isSelected ? `2.5px solid #ffffff` : `2px solid ${boxColor}`,
                boxShadow: isSelected ? '0 0 20px #ffffff88' : `0 0 16px ${boxColor}44`,
                borderRadius: '3px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '4px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                animation: isAlert ? 'radarPulse 1.2s infinite' : 'none',
                transition: 'border 0.15s, box-shadow 0.15s',
                zIndex: 15
              }}
              title="Click to inspect asset forensics"
            >
              {/* Tactical Corner Bracket Accents (drone.riotters.com inspired) */}
              <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '6px', height: '6px', borderTop: `2px solid ${boxColor}`, borderLeft: `2px solid ${boxColor}` }} />
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '6px', height: '6px', borderBottom: `2px solid ${boxColor}`, borderRight: `2px solid ${boxColor}` }} />
              
              {/* Active Laser Sweep Beam (When Target is Under Scan) */}
              {laserScanningId === det.id && (
                <div className="box-laser-sweep" />
              )}

              {/* Box Top Label */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                fontWeight: 800,
                color: '#05070a',
                background: boxColor,
                padding: '2px 5px',
                borderRadius: '2px',
                width: 'fit-content',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {det.id} • {det.label}
              </div>

              {/* Box Bottom Telemetry */}
              <div style={{
                background: 'rgba(5, 7, 10, 0.88)',
                border: `1px solid ${boxColor}`,
                padding: '4px 6px',
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'var(--text-pure)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <div>STATUS: <strong style={{ color: boxColor }}>{det.status}</strong></div>
                {det.burn && (
                  <div>EMISSION RATE: <strong>{det.burn} ({det.co2})</strong></div>
                )}
                {det.idleTime && (
                  <div>IDLE TIME: <strong style={{ color: isAlert ? 'var(--thermal)' : 'inherit' }}>{det.idleTime}</strong></div>
                )}
                {det.temp && (
                  <div>CORE TEMP: <strong>{det.temp}</strong> • DRAW: <strong style={{ color: 'var(--phosphor)' }}>{det.power}</strong></div>
                )}
                {det.irradiance && (
                  <div>IRRADIANCE: <strong>{det.irradiance}</strong> • YIELD: <strong style={{ color: 'var(--emerald)' }}>{det.yield}</strong></div>
                )}
              </div>
            </div>
          );
        })}

        {/* Simulated Violation Alert Banner Overlay + Dispatch Action Button */}
        {(testAlertTriggered && !violationResolved) && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 85, 0, 0.95)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 0 25px rgba(255, 85, 0, 0.6)',
            animation: 'radarPulse 0.8s infinite',
            zIndex: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} color="#fff" />
              <span>METROPOLIS RULE VIOLATION: SHUTTLE #12 IDLING EXCEEDED 3 MINUTES</span>
            </div>
            <button
              onClick={handleDispatchMarshal}
              style={{
                padding: '5px 10px',
                background: '#ffffff',
                color: '#ff5500',
                border: 'none',
                borderRadius: '3px',
                fontWeight: 900,
                fontSize: '10.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)'
              }}
            >
              <Send size={11} />
              <span>DISPATCH GATE WARNING</span>
            </button>
          </div>
        )}
      </div>

      {/* Selected Asset Neural Inference & Forensics Inspector (neutomni.com + drone.riotters.com inspired) */}
      {activeSelectedDet && (
        <div className="hud-corner-box" style={{ width: '100%' }}>
          <SpotlightCard
            spotlightColor={activeSelectedDet.alert ? 'rgba(255, 85, 0, 0.25)' : 'rgba(212, 255, 0, 0.2)'}
            spotlightSize={400}
            style={{ padding: '20px', borderRadius: '18px', border: '1px solid var(--border-active)' }}
          >
            {/* Header: Title, Identifiers, Softmax Confidence Badge, Close Button */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={15} color="var(--phosphor)" />
                  <span className="swiss-label" style={{ color: 'var(--phosphor)' }}>
                    [NEURAL INFERENCE FORENSICS // TENSORRT 10.2 ENGINE]
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-pure)', letterSpacing: '-0.02em', margin: 0 }}>
                    {activeSelectedDet.label}
                  </h3>
                  <span className="telemetry-chip active">
                    ID: {activeSelectedDet.id}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {activeSelectedDet.plate}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(212, 255, 0, 0.1)',
                  border: '1px solid var(--border-active)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px'
                }}>
                  <Gauge size={13} color="var(--phosphor)" />
                  <span style={{ color: 'var(--phosphor)', fontWeight: 700 }}>98.4% CONFIDENCE</span>
                  <span style={{ color: 'var(--text-muted)' }}>(IoU: 0.89)</span>
                </div>

                <button
                  onClick={() => setSelectedDetection(null)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  title="Close Inspector"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Precision Quantization Switcher & Performance Strip */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={13} color="var(--cyan)" />
                  <span className="swiss-label" style={{ color: 'var(--cyan)' }}>
                    [TENSORRT QUANTIZATION PRECISION ENGINE]
                  </span>
                </div>
                {/* 3 Interactive Precision Buttons */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Object.entries(PRECISION_MODES).map(([key, mode]) => {
                    const isActive = quantizationMode === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setQuantizationMode(key);
                          if (playSound) playSound(isActive ? 500 : 720, 'triangle', 0.08);
                        }}
                        style={{
                          padding: '3px 10px',
                          borderRadius: '4px',
                          background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          border: isActive ? '1px solid var(--cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                          fontSize: '10.5px',
                          fontWeight: isActive ? 700 : 500,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {mode.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hardware Performance Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="swiss-label" style={{ display: 'block', fontSize: '8.5px' }}>PIPELINE LATENCY</span>
                  <span className="mono-nums" style={{ color: 'var(--phosphor)', fontWeight: 800, fontSize: '13px' }}>
                    {PRECISION_MODES[quantizationMode].latency}
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="swiss-label" style={{ display: 'block', fontSize: '8.5px' }}>STREAM THROUGHPUT</span>
                  <span className="mono-nums" style={{ color: 'var(--emerald)', fontWeight: 800, fontSize: '13px' }}>
                    {PRECISION_MODES[quantizationMode].fps}
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="swiss-label" style={{ display: 'block', fontSize: '8.5px' }}>CORE POWER DRAW</span>
                  <span className="mono-nums" style={{ color: 'var(--cyan)', fontWeight: 800, fontSize: '13px' }}>
                    {PRECISION_MODES[quantizationMode].power}
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="swiss-label" style={{ display: 'block', fontSize: '8.5px' }}>mAP FIDELITY</span>
                  <span className="mono-nums" style={{ color: 'var(--text-pure)', fontWeight: 800, fontSize: '13px' }}>
                    {PRECISION_MODES[quantizationMode].mapScore}
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="swiss-label" style={{ display: 'block', fontSize: '8.5px' }}>MEMORY BANDWIDTH</span>
                  <span className="mono-nums" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '13px' }}>
                    {PRECISION_MODES[quantizationMode].memoryBandwidth}
                  </span>
                </div>
              </div>
            </div>

            {/* Neural Stage Latency Waterfall (neutomni.com inspired) */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="swiss-label" style={{ color: 'var(--text-muted)' }}>
                  [EXECUTION PIPELINE WATERFALL // 4 STAGES]
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  TOTAL: {PRECISION_MODES[quantizationMode].latency}
                </span>
              </div>

              {/* Stacked Multi-Color Segment Bar */}
              <div style={{
                height: '8px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                {PRECISION_MODES[quantizationMode].stages.map((stage, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: `${stage.pct}%`,
                      background: stage.color,
                      transition: 'width 0.3s ease'
                    }}
                    title={`${stage.name}: ${stage.duration} (${stage.pct}%)`}
                  />
                ))}
              </div>

              {/* Stage legend items */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                {PRECISION_MODES[quantizationMode].stages.map((stage, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: stage.color }} />
                    <span style={{ color: 'var(--text-muted)' }}>{stage.name}:</span>
                    <strong style={{ color: 'var(--text-pure)' }}>{stage.duration}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Dual Grid: Softmax Distribution & Spatial Tensor Geometry */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              {/* Left: Softmax Multi-Class Probability */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <BarChart2 size={13} color="var(--phosphor)" />
                  <span className="swiss-label" style={{ color: 'var(--phosphor)' }}>
                    [SOFTMAX MULTI-CLASS PROBABILITY]
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {getSoftmaxDistribution(activeSelectedDet).map((item, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                        <span style={{ color: idx === 0 ? 'var(--text-pure)' : 'var(--text-secondary)', fontWeight: idx === 0 ? 700 : 400 }}>
                          {item.class}
                        </span>
                        <span style={{ color: item.color, fontWeight: 700 }}>
                          {item.prob}%
                        </span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.prob}%`, height: '100%', background: item.color, borderRadius: '999px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Spatial Coordinates & Normalized Tensor Matrix */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Crosshair size={13} color="var(--cyan)" />
                  <span className="swiss-label" style={{ color: 'var(--cyan)' }}>
                    [SPATIAL GEOMETRY & BOUNDING TENSOR]
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Normalized Tensor [Ymin, Xmin, Ymax, Xmax]:</span>
                    <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>
                      [{(activeSelectedDet.y/100).toFixed(3)}, {(activeSelectedDet.x/100).toFixed(3)}, {((activeSelectedDet.y+activeSelectedDet.h)/100).toFixed(3)}, {((activeSelectedDet.x+activeSelectedDet.w)/100).toFixed(3)}]
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Sensor Focal Distance:</span>
                    <span style={{ color: 'var(--text-pure)', fontWeight: 600 }}>18.2 m (Calibrated Lidar)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Powertrain Classification:</span>
                    <span style={{ color: activeSelectedDet.isEv ? 'var(--phosphor)' : 'var(--thermal)', fontWeight: 600 }}>
                      {activeSelectedDet.engine}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Active Status / Audit:</span>
                    <span style={{ color: activeSelectedDet.alert ? 'var(--thermal)' : 'var(--phosphor)', fontWeight: 700 }}>
                      {activeSelectedDet.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Empirical Karnataka & IISc Bangalore Environmental Science Linkage */}
            <div style={{
              background: activeSelectedDet.alert ? 'rgba(255, 85, 0, 0.08)' : 'rgba(212, 255, 0, 0.06)',
              border: activeSelectedDet.alert ? '1px solid rgba(255, 85, 0, 0.3)' : '1px solid rgba(212, 255, 0, 0.2)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={13} color={activeSelectedDet.alert ? 'var(--thermal)' : 'var(--phosphor)'} />
                  <span className="swiss-label" style={{ color: activeSelectedDet.alert ? 'var(--thermal)' : 'var(--phosphor)' }}>
                    [EMPIRICAL CARBON & AIR QUALITY TELEMETRY // IISC BANGALORE]
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Ref: Ramachandra et al. (CES, IISc 2021) Table 6
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>Diesel Burn Rate:</span>
                  <span style={{ color: activeSelectedDet.isEv ? 'var(--phosphor)' : 'var(--thermal)', fontWeight: 700 }}>
                    {activeSelectedDet.burn || '0.00 L/min (Zero Fuel)'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>Instantaneous Emission Surge:</span>
                  <span style={{ color: activeSelectedDet.isEv ? 'var(--phosphor)' : 'var(--thermal)', fontWeight: 700 }}>
                    {activeSelectedDet.co2 || activeSelectedDet.power || '0.00 kg CO₂'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>Fleet Emission Factor:</span>
                  <span style={{ color: 'var(--text-pure)', fontWeight: 600 }}>
                    567.03 g CO₂/km (Karnataka Benchmark)
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>Ambient PM2.5 Impact:</span>
                  <span style={{ color: activeSelectedDet.alert ? 'var(--thermal)' : 'var(--text-pure)', fontWeight: 600 }}>
                    {activeSelectedDet.pm25 || '0.0 µg/m³'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Operations Dock */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Trigger Laser Sweep Button */}
                <button
                  onClick={() => handleTriggerLaserSweep(activeSelectedDet.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: laserScanningId === activeSelectedDet.id ? 'rgba(212, 255, 0, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                    border: laserScanningId === activeSelectedDet.id ? '1px solid var(--phosphor)' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: laserScanningId === activeSelectedDet.id ? 'var(--phosphor)' : 'var(--text-pure)',
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Crosshair size={13} />
                  <span>{laserScanningId === activeSelectedDet.id ? 'LASER SWEEP RUNNING...' : 'TRIGGER LASER SWEEP'}</span>
                </button>

                {/* Copy TensorRT JSON */}
                <button
                  onClick={() => handleCopyTensorJson(activeSelectedDet)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: copiedJson ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    border: copiedJson ? '1px solid var(--emerald)' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: copiedJson ? 'var(--emerald)' : 'var(--text-pure)',
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {copiedJson ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedJson ? 'COPIED TO CLIPBOARD' : 'COPY TENSORRT JSON'}</span>
                </button>

                {/* Export Inference Audit CSV */}
                <button
                  onClick={() => handleExportInferenceAuditCsv(activeSelectedDet)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: downloadedCsv ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    border: downloadedCsv ? '1px solid var(--cyan)' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: downloadedCsv ? 'var(--cyan)' : 'var(--text-secondary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Download size={13} />
                  <span>{downloadedCsv ? 'CSV EXPORTED' : 'EXPORT AUDIT CSV'}</span>
                </button>
              </div>

              {/* Action: Dispatch Gate Warning (If Alert) */}
              {(activeSelectedDet.alert || (testAlertTriggered && !violationResolved)) && (
                <button
                  onClick={handleDispatchMarshal}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--thermal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 15px rgba(255, 85, 0, 0.4)'
                  }}
                >
                  <Send size={12} />
                  <span>DISPATCH GATE WARNING</span>
                </button>
              )}
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* Controls Bar: Vision Mode Filter & Interactive Trigger */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(12, 14, 20, 0.75)',
        padding: '10px 16px',
        borderRadius: '999px',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(16px)'
      }}>
        {/* Optical / Thermal / Edge Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Sensor View:
          </span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[
              { id: 'optical', label: 'RGB Video' },
              { id: 'thermal', label: 'Thermal IR' },
              { id: 'edge', label: 'Edge Wireframe' }
            ].map(f => {
              const isActive = visionMode === f.id;
              return (
                <Magnet key={f.id} padding={30} magnetStrength={3} maxOffset={5}>
                  <button
                    onClick={() => handleModeChange(f.id)}
                    style={{
                      padding: '4px 12px',
                      background: isActive ? 'rgba(212, 255, 0, 0.12)' : 'transparent',
                      border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
                      color: isActive ? 'var(--phosphor)' : 'var(--text-secondary)',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {f.label}
                  </button>
                </Magnet>
              );
            })}
          </div>
        </div>

        {/* Live Interactive Action: Trigger Simulated Violation */}
        <Magnet padding={40} magnetStrength={3} maxOffset={6}>
          <button
            onClick={handleTriggerViolation}
            style={{
              padding: '6px 14px',
              background: 'rgba(255, 85, 0, 0.12)',
              border: '1px solid var(--thermal)',
              borderRadius: '999px',
              color: 'var(--thermal)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 14px rgba(255, 85, 0, 0.25)',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
          >
            <ShieldAlert size={13} />
            <span>Simulate Diesel Idling Violation</span>
          </button>
        </Magnet>
      </div>

      {/* Hardware Telemetry Grid with SpotlightCard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        <SpotlightCard
          spotlightColor="rgba(212, 255, 0, 0.12)"
          spotlightSize={240}
          style={{ padding: '16px', borderRadius: '16px' }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            TensorRT Acceleration
          </span>
          <span className="mono-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--phosphor)', display: 'block', marginTop: '4px' }}>
            1,024 Cores Active
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
            FP16 Precision (8.4ms latency)
          </span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(255, 85, 0, 0.12)"
          spotlightSize={240}
          style={{ padding: '16px', borderRadius: '16px' }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Tailpipe Burn Rate
          </span>
          <span className="mono-nums" style={{ fontSize: '18px', fontWeight: 800, color: (simState?.fleetEv > 50 || violationResolved) ? 'var(--phosphor)' : 'var(--thermal)', display: 'block', marginTop: '4px' }}>
            {(simState?.fleetEv > 50 || violationResolved) ? '0.00 kg CO₂/hr' : '+4.82 kg CO₂/hr'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
            {(simState?.fleetEv > 50 || violationResolved) ? 'Emissions Halted' : '2 Diesel Shuttles Flagged'}
          </span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.12)"
          spotlightSize={240}
          style={{ padding: '16px', borderRadius: '16px' }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Inference Accuracy
          </span>
          <span className="mono-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--emerald)', display: 'block', marginTop: '4px' }}>
            99.2% Accuracy
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
            YOLO-v8 Edge Model
          </span>
        </SpotlightCard>
      </div>

      {/* Live Detection Event Log */}
      <SpotlightCard
        spotlightColor="rgba(56, 189, 248, 0.08)"
        spotlightSize={300}
        style={{ padding: '16px', borderRadius: '16px', flex: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-pure)' }}>
            Metropolis Real-Time Inference Stream
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            LIVE WEBSOCKET
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {tickerLogs.map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--cyan)' }}>[{log.time}]</span>
              <span style={{ color: log.text.includes('🚨') ? 'var(--thermal)' : (log.text.includes('✓') ? 'var(--phosphor)' : 'var(--text-secondary)') }}>
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </SpotlightCard>

      {/* Edge AI Neural Inference Architecture Modal (Inspired by neutomni.com + drone.riotters.com) */}
      {showArchModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 10, 0.85)',
          backdropFilter: 'blur(20px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="hud-corner-box cyan" style={{
            width: '800px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            background: 'rgba(9, 12, 18, 0.95)',
            border: '1px solid var(--border-active)',
            borderRadius: '16px',
            padding: '24px',
            overflowY: 'auto',
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.2)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--cyan)" />
                <div>
                  <span className="swiss-label" style={{ color: 'var(--cyan)' }}>
                    [SYSTEM ARCHITECTURE // EDGE CV FORENSICS]
                  </span>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-pure)', margin: '2px 0 0 0' }}>
                    NVIDIA DeepStream 7.0 & TensorRT 10.2 Inference Pipeline
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowArchModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-headline */}
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Full end-to-end hardware-accelerated pipeline processing RTSP video streams on campus NVIDIA Jetson AGX Orin edge nodes. Detections feed directly into the Karnataka CEA v20.0 and IISc Bangalore Ramachandra et al. emissions translation matrix.
            </p>

            {/* 5-Step Pipeline Flow Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                {
                  step: '01',
                  name: 'RTSP Stream Ingestion & NVDEC DMA',
                  tech: 'GStreamer 1.22 + NVMM Zero-Copy Memory',
                  desc: 'H.265 1080p60 RTSP stream decoded directly into unified Jetson LPDDR5 memory without host CPU copying. Latency: 1.2 ms.'
                },
                {
                  step: '02',
                  name: 'TensorRT Multi-Scale Inference Core',
                  tech: 'YOLO-v8x TensorRT Engine (CUDA SM80, FP16/INT8)',
                  desc: 'Letterboxed 640x640 tensor fed into 64 Tensor Cores. Custom fused Conv-BatchNorm kernels execute in 7.4 ms with 98.4% mAP fidelity.'
                },
                {
                  step: '03',
                  name: 'Spatial Multi-Object Tracking',
                  tech: 'ByteTrack Kalman Filter + Hungarian Association',
                  desc: 'Maintains temporal persistent identity across frames, computing instantaneous velocity vectors and stationary idle dwell times.'
                },
                {
                  step: '04',
                  name: 'Empirical IISc Bangalore Emission Translation',
                  tech: 'Ramachandra et al. (CES, IISc 2021) Table 6 Factor Lookup',
                  desc: 'Idling duration (>3 min) automatically translated to diesel fuel burn (0.28 L/min) and +3.72 kg CO₂/hr surge penalty.'
                },
                {
                  step: '05',
                  name: 'Zero-Trust Telemetry & Gate Security Dispatch',
                  tech: 'MQTT over TLS 1.3 -> KPTCL SLDC Twin & Gate Marshal Radio',
                  desc: 'Instant alert dispatched to campus gate marshals to enforce Karnataka Clean Air Action Plan regulations.'
                }
              ].map(tier => (
                <div key={tier.step} style={{
                  display: 'flex',
                  gap: '14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--phosphor)',
                    background: 'rgba(212, 255, 0, 0.1)',
                    border: '1px solid var(--border-active)',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {tier.step}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-pure)' }}>{tier.name}</span>
                      <span className="telemetry-chip" style={{ fontSize: '9.5px', color: 'var(--cyan)' }}>{tier.tech}</span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      {tier.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hardware Precision Benchmark Table */}
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <span className="swiss-label" style={{ display: 'block', color: 'var(--cyan)', marginBottom: '8px' }}>
                [QUANTIZATION BENCHMARK MATRIX // JETSON AGX ORIN 64GB]
              </span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '6px' }}>Precision Mode</th>
                    <th style={{ padding: '6px' }}>Inference Latency</th>
                    <th style={{ padding: '6px' }}>Throughput (FPS)</th>
                    <th style={{ padding: '6px' }}>Power Draw</th>
                    <th style={{ padding: '6px' }}>mAP Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '6px', color: 'var(--phosphor)', fontWeight: 700 }}>FP16 TensorRT (Current)</td>
                    <td style={{ padding: '6px' }}>11.4 ms</td>
                    <td style={{ padding: '6px', color: 'var(--emerald)' }}>87.7 FPS</td>
                    <td style={{ padding: '6px' }}>4.2 W</td>
                    <td style={{ padding: '6px' }}>98.4%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '6px', color: 'var(--cyan)', fontWeight: 700 }}>INT8 Calibrated PTQ</td>
                    <td style={{ padding: '6px' }}>5.2 ms</td>
                    <td style={{ padding: '6px', color: 'var(--emerald)' }}>192.3 FPS</td>
                    <td style={{ padding: '6px' }}>2.1 W</td>
                    <td style={{ padding: '6px' }}>96.8%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px', color: 'var(--text-muted)' }}>FP32 Baseline CUDA</td>
                    <td style={{ padding: '6px' }}>24.6 ms</td>
                    <td style={{ padding: '6px' }}>40.6 FPS</td>
                    <td style={{ padding: '6px' }}>7.8 W</td>
                    <td style={{ padding: '6px' }}>98.7%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowArchModal(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: 'var(--phosphor)',
                  color: '#05070a',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                CLOSE ARCHITECTURE DOSSIER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
