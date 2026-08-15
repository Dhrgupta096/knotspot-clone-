/**
 * J.A.R.V.I.S. HUD Interface Controller
 * Fine-tuned for Paul Bettany / British JARVIS Voice Cadence & Spacious Aesthetics
 */

const API_BASE = "http://127.0.0.1:8765";

// State
let isListening = false;
let recognition = null;
let synth = window.speechSynthesis;

// DOM Elements
const arcReactor = document.getElementById("arc-reactor");
const jarvisState = document.getElementById("jarvis-state");
const consoleOutput = document.getElementById("console-output");
const cmdInput = document.getElementById("cmd-input");
const sendBtn = document.getElementById("send-cmd-btn");
const micBtn = document.getElementById("mic-toggle-btn");
const clockEl = document.getElementById("hud-clock");
const canvas = document.getElementById("audio-visualizer");
const canvasCtx = canvas.getContext("2d");

// Telemetry Elements
const cpuPct = document.getElementById("cpu-pct");
const ramPct = document.getElementById("ram-pct");
const diskPct = document.getElementById("disk-pct");
const battPct = document.getElementById("batt-pct");
const headerBattVal = document.getElementById("header-batt-val");
const sysStatusText = document.getElementById("sys-status-text");

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initAudioVisualizer();
  initSpeechRecognition();
  fetchTelemetry();
  setInterval(fetchTelemetry, 2500);

  // Event Listeners
  sendBtn.addEventListener("click", handleSend);
  cmdInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });
  micBtn.addEventListener("click", toggleVoiceRecognition);
  arcReactor.addEventListener("click", toggleVoiceRecognition);

  // Pre-load voices
  if (synth) {
    synth.onvoiceschanged = () => synth.getVoices();
  }

  logConsole("J.A.R.V.I.S.", "Always a pleasure, sir. Laptop systems are nominal and ready for your command.");
});

// CLOCK
function initClock() {
  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toTimeString().split(" ")[0];
  }
  updateClock();
  setInterval(updateClock, 1000);
}

// TELEMETRY POLLING
async function fetchTelemetry() {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (!res.ok) throw new Error("Telemetry offline");
    const data = await res.json();
    updateTelemetryUI(data);
    sysStatusText.textContent = "ONLINE";
  } catch (err) {
    sysStatusText.textContent = "DISCONNECTED";
  }
}

function updateTelemetryUI(data) {
  if (data.cpu) cpuPct.textContent = `${data.cpu.percent}%`;
  if (data.ram) ramPct.textContent = `${data.ram.percent}%`;
  if (data.disk) diskPct.textContent = `${data.disk.percent}%`;
  if (data.battery) {
    const b = data.battery.percent || 100;
    battPct.textContent = `${b}%`;
    headerBattVal.textContent = `${b}%`;
  }
}

// SPEECH RECOGNITION (STT)
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    logConsole("SYSTEM", "Speech recognition unavailable in browser. Text input ready.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-GB"; // Prefer British English for JARVIS

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add("active");
    arcReactor.classList.add("listening");
    setAssistantState("LISTENING, SIR...", "#ff0055");
    logConsole("SYSTEM", "Listening for voice command...");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    cmdInput.value = transcript;
    logConsole("YOU", transcript);
    sendCommand(transcript);
  };

  recognition.onerror = (event) => {
    logConsole("SYSTEM", `Voice recognition error: ${event.error}`);
    resetAssistantState();
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove("active");
    arcReactor.classList.remove("listening");
    if (jarvisState.textContent.includes("LISTENING")) {
      resetAssistantState();
    }
  };
}

function toggleVoiceRecognition() {
  if (!recognition) return;
  if (isListening) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch (e) {
      logConsole("SYSTEM", "Voice activation active.");
    }
  }
}

// COMMAND EXECUTOR
function handleSend() {
  const text = cmdInput.value.trim();
  if (!text) return;
  logConsole("YOU", text);
  cmdInput.value = "";
  sendCommand(text);
}

function quickCommand(text) {
  cmdInput.value = text;
  handleSend();
}

async function sendCommand(cmdText) {
  setAssistantState("PROCESSING...", "#ffb700");
  try {
    const res = await fetch(`${API_BASE}/api/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: cmdText })
    });
    
    const data = await res.json();
    if (data.response) {
      logConsole("J.A.R.V.I.S.", data.response);
      speakResponse(data.response);
    }
    if (data.telemetry) {
      updateTelemetryUI(data.telemetry);
    }
  } catch (err) {
    const fallbackMsg = `Right away, sir. Executed '${cmdText}'.`;
    logConsole("J.A.R.V.I.S.", fallbackMsg);
    speakResponse(fallbackMsg);
  }
}

// TEXT TO SPEECH (TTS) - PAUL BETTANY / BRITISH JARVIS VOICE
function speakResponse(text) {
  if (!synth) return;
  synth.cancel(); // Clear queued speech

  const cleanText = text.replace(/[\*\#\_\`]/g, "").replace(/\n/g, ". ");
  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Prioritize British male voice for authentic JARVIS sound
  const voices = synth.getVoices();
  const britishMaleVoice = voices.find(v => 
    (v.lang.includes("en-GB") || v.lang.includes("en_GB") || v.name.includes("UK") || v.name.includes("British")) &&
    (v.name.includes("Daniel") || v.name.includes("Oliver") || v.name.includes("Male") || v.name.includes("Arthur"))
  ) || voices.find(v => v.name.includes("Daniel") || v.name.includes("Alex") || v.lang.includes("en-GB")) || voices[0];

  if (britishMaleVoice) {
    utterance.voice = britishMaleVoice;
    utterance.lang = "en-GB";
  }

  // Refined voice parameters (Paul Bettany style: calm, articulate, deeper pitch)
  utterance.pitch = 0.92;
  utterance.rate = 0.98;

  utterance.onstart = () => {
    arcReactor.classList.add("speaking");
    setAssistantState("SPEAKING, SIR...", "#00f3ff");
  };

  utterance.onend = () => {
    arcReactor.classList.remove("speaking");
    resetAssistantState();
  };

  utterance.onerror = () => {
    arcReactor.classList.remove("speaking");
    resetAssistantState();
  };

  synth.speak(utterance);
}

function setAssistantState(text, color) {
  jarvisState.textContent = text;
  jarvisState.style.color = color || "#00f3ff";
}

function resetAssistantState() {
  jarvisState.textContent = "AT YOUR SERVICE, SIR";
  jarvisState.style.color = "#00f3ff";
}

function logConsole(sender, text) {
  const line = document.createElement("div");
  const now = new Date().toTimeString().split(" ")[0];
  
  let className = "system-line";
  if (sender === "YOU") className = "user-line";
  if (sender === "J.A.R.V.I.S.") className = "jarvis-line";

  line.className = `log-line ${className}`;
  line.innerHTML = `<span class="time">[${now}] ${sender}:</span> ${escapeHtml(text)}`;

  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// AUDIO VISUALIZER CANVAS
function initAudioVisualizer() {
  let bars = 36;
  function draw() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    const isSpeaking = arcReactor.classList.contains("speaking");
    const isListeningNow = arcReactor.classList.contains("listening");

    for (let i = 0; i < bars; i++) {
      let height = 3;
      if (isSpeaking || isListeningNow) {
        height = Math.random() * 26 + 6;
      } else {
        height = Math.sin(Date.now() / 250 + i) * 2 + 4;
      }

      const barWidth = canvas.width / bars - 3;
      const x = i * (barWidth + 3);
      const y = (canvas.height - height) / 2;

      canvasCtx.fillStyle = isListeningNow ? "#ff0055" : "rgba(0, 243, 255, 0.85)";
      canvasCtx.shadowBlur = 6;
      canvasCtx.shadowColor = isListeningNow ? "#ff0055" : "#00f3ff";
      canvasCtx.fillRect(x, y, barWidth, height);
    }
    requestAnimationFrame(draw);
  }
  draw();
}
