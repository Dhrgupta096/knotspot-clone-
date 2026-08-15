#!/usr/bin/env python3
"""
J.A.R.V.I.S. Core Engine - macOS Laptop Automation & AI Telemetry Server
Personalized for Dhruv Gupta
Author: Antigravity AI
"""

import os
import sys
import json
import time
import re
import socket
import datetime
import subprocess
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn

PORT = 8765
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

def get_battery_info():
    try:
        out = subprocess.check_output(['pmset', '-g', 'batt'], stderr=subprocess.DEVNULL).decode('utf-8')
        percent_match = re.search(r'(\d+)%', out)
        is_charging = 'charging' in out.lower() or 'ac power' in out.lower()
        percent = int(percent_match.group(1)) if percent_match else 100
        status_text = "Charging" if 'charging' in out.lower() else ("Plugged In" if 'ac power' in out.lower() else "Discharging")
        return {
            "percent": percent,
            "charging": is_charging,
            "status": status_text,
            "raw": out.strip()
        }
    except Exception as e:
        return {"percent": 100, "charging": True, "status": "Unknown", "raw": str(e)}

def get_ram_info():
    try:
        out = subprocess.check_output(['top', '-l', '1', '-s', '0', '-n', '0'], stderr=subprocess.DEVNULL).decode('utf-8')
        for line in out.split('\n'):
            if 'PhysMem:' in line:
                used_match = re.search(r'PhysMem:\s*([\d\.]+[GMK])\s*used', line)
                unused_match = re.search(r'([\d\.]+[GMK])\s*unused', line)
                used_str = used_match.group(1) if used_match else "N/A"
                unused_str = unused_match.group(1) if unused_match else "N/A"
                
                def to_gb(s):
                    if s.endswith('G'): return float(s[:-1])
                    if s.endswith('M'): return float(s[:-1]) / 1024.0
                    return 0.0
                
                u_gb = to_gb(used_str)
                f_gb = to_gb(unused_str)
                total_gb = max(u_gb + f_gb, 1.0)
                pct = round((u_gb / total_gb) * 100, 1) if total_gb > 0 else 50.0
                return {
                    "used": f"{round(u_gb, 1)} GB",
                    "free": f"{round(f_gb, 1)} GB",
                    "percent": pct,
                    "summary": f"{used_str} used / {unused_str} free"
                }
    except Exception:
        pass
    return {"used": "N/A", "free": "N/A", "percent": 0, "summary": "Memory data unavailable"}

def get_cpu_info():
    try:
        out = subprocess.check_output(['top', '-l', '1', '-n', '0'], stderr=subprocess.DEVNULL).decode('utf-8')
        for line in out.split('\n'):
            if 'CPU usage:' in line:
                user = re.search(r'([\d\.]+)%\s*user', line)
                sys_m = re.search(r'([\d\.]+)%\s*sys', line)
                idle = re.search(r'([\d\.]+)%\s*idle', line)
                
                u_val = float(user.group(1)) if user else 0.0
                s_val = float(sys_m.group(1)) if sys_m else 0.0
                total_cpu = round(u_val + s_val, 1)
                return {
                    "percent": total_cpu,
                    "user": f"{u_val}%",
                    "system": f"{s_val}%",
                    "idle": f"{idle.group(1)}%" if idle else "N/A"
                }
    except Exception:
        pass
    return {"percent": 5.0, "user": "2%", "system": "3%", "idle": "95%"}

def get_disk_info():
    try:
        out = subprocess.check_output(['df', '-h', '/'], stderr=subprocess.DEVNULL).decode('utf-8')
        lines = out.strip().split('\n')
        if len(lines) >= 2:
            parts = lines[1].split()
            size = parts[1]
            used = parts[2]
            avail = parts[3]
            pct_str = parts[4].replace('%', '')
            pct = int(pct_str) if pct_str.isdigit() else 0
            return {
                "total": size,
                "used": used,
                "free": avail,
                "percent": pct
            }
    except Exception:
        pass
    return {"total": "N/A", "used": "N/A", "free": "N/A", "percent": 0}

def get_uptime():
    try:
        out = subprocess.check_output(['uptime'], stderr=subprocess.DEVNULL).decode('utf-8').strip()
        return out
    except Exception:
        return "Unknown Uptime"

def get_system_telemetry():
    user_name = os.getenv("USER", "Dhruv")
    if user_name.lower() == "dhruvgupta":
        user_name = "Dhruv"

    return {
        "battery": get_battery_info(),
        "cpu": get_cpu_info(),
        "ram": get_ram_info(),
        "disk": get_disk_info(),
        "uptime": get_uptime(),
        "hostname": socket.gethostname(),
        "user": user_name,
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S")
    }

def process_command(cmd_text):
    cmd_lower = cmd_text.strip().lower()
    
    # 1. Open App or Web
    if cmd_lower.startswith(("open ", "launch ", "start ", "run ")):
        target = re.sub(r'^(open|launch|start|run)\s+', '', cmd_text, flags=re.IGNORECASE).strip()
        
        # Check if URL
        if target.startswith(("http://", "https://", "www.")) or target.endswith((".com", ".org", ".io", ".net", ".edu")):
            url = target if target.startswith("http") else f"https://{target}"
            subprocess.Popen(['open', url])
            return f"Right away, sir. Opening web page {url}."
        
        aliases = {
            "chrome": "Google Chrome",
            "browser": "Safari",
            "vscode": "Visual Studio Code",
            "code": "Visual Studio Code",
            "terminal": "Terminal",
            "finder": "Finder",
            "spotify": "Spotify",
            "calculator": "Calculator",
            "notes": "Notes",
            "calendar": "Calendar",
            "photos": "Photos"
        }
        app_name = aliases.get(target.lower(), target)
        try:
            res = subprocess.run(['open', '-a', app_name], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
            if res.returncode == 0:
                return f"Right away, sir. Launching {app_name} now."
            else:
                subprocess.Popen(['open', '-a', target])
                return f"Initiating launch protocol for {target}, sir."
        except Exception as e:
            return f"My apologies, sir. I encountered an issue launching {target}."
            
    # 2. Search
    if cmd_lower.startswith(("search ", "google ", "find ")):
        query = re.sub(r'^(search|google|find)\s+', '', cmd_text, flags=re.IGNORECASE).strip()
        encoded = urllib.parse.quote(query)
        url = f"https://www.google.com/search?q={encoded}"
        subprocess.Popen(['open', url])
        return f"Searching the global network for '{query}', sir."

    # 3. YouTube Search
    if cmd_lower.startswith(("youtube ", "play ")):
        query = re.sub(r'^(youtube|play)\s+', '', cmd_text, flags=re.IGNORECASE).strip()
        encoded = urllib.parse.quote(query)
        url = f"https://www.youtube.com/results?search_query={encoded}"
        subprocess.Popen(['open', url])
        return f"Playing media for '{query}' on YouTube, sir."

    # 4. Volume Control
    if "volume" in cmd_lower:
        vol_match = re.search(r'\d+', cmd_lower)
        if vol_match:
            vol_val = min(max(int(vol_match.group(0)), 0), 100)
            subprocess.run(['osascript', '-e', f'set volume output volume {vol_val}'])
            return f"Audio output calibrated to {vol_val} percent, sir."
        if "max" in cmd_lower or "full" in cmd_lower:
            subprocess.run(['osascript', '-e', 'set volume output volume 100'])
            return "Volume set to maximum, sir."
        if "up" in cmd_lower or "increase" in cmd_lower:
            subprocess.run(['osascript', '-e', 'set volume output volume ((output volume of (get volume settings)) + 15)'])
            return "Increasing audio volume, sir."
        if "down" in cmd_lower or "decrease" in cmd_lower:
            subprocess.run(['osascript', '-e', 'set volume output volume ((output volume of (get volume settings)) - 15)'])
            return "Decreasing audio volume, sir."

    # 5. Mute / Unmute
    if cmd_lower in ["mute", "silence", "turn off audio"]:
        subprocess.run(['osascript', '-e', 'set volume output muted true'])
        return "Audio output muted, sir."
    if cmd_lower in ["unmute", "enable audio", "turn on audio"]:
        subprocess.run(['osascript', '-e', 'set volume output muted false'])
        return "Audio restored, sir."

    # 6. Screenshot
    if "screenshot" in cmd_lower or "snap screen" in cmd_lower:
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.expanduser(f"~/Desktop/JARVIS_Screenshot_{ts}.png")
        try:
            subprocess.run(['screencapture', '-x', filepath])
            subprocess.Popen(['open', filepath])
            return f"Screen captured and saved to your desktop, sir."
        except Exception as e:
            return f"Failed to capture screen: {str(e)}"

    # 7. System Stats / Battery / Uptime
    if "battery" in cmd_lower or "power" in cmd_lower:
        b = get_battery_info()
        return f"Battery capacity is currently at {b['percent']} percent and {b['status'].lower()}, sir."
    
    if any(k in cmd_lower for k in ["cpu", "ram", "memory", "system status", "telemetry", "diagnostic", "diagnostics"]):
        c = get_cpu_info()
        r = get_ram_info()
        b = get_battery_info()
        return f"Diagnostic report, sir: CPU load is at {c['percent']}%, memory utilization is {r['used']} used, and battery power is at {b['percent']}%."

    if "lock" in cmd_lower or "sleep" in cmd_lower:
        try:
            subprocess.Popen(['pmset', 'displaysleepnow'])
            return "Locking system display, sir. Have a pleasant rest."
        except Exception as e:
            return f"Unable to lock display: {str(e)}"

    # 8. Notifications / Voice Say
    if cmd_lower.startswith("say "):
        msg = cmd_text[4:].strip()
        subprocess.Popen(['say', '-v', 'Daniel', msg])
        return f"Vocalizing message: '{msg}'"

    # 9. Authentic JARVIS Conversational Persona & Greetings
    if any(k in cmd_lower for k in ["who are you", "what is your name", "identify yourself"]):
        return "I am J.A.R.V.I.S. - Just A Rather Very Intelligent System. Dedicated exclusively to managing your laptop and assisting you, sir."

    if any(k in cmd_lower for k in ["hello", "hi", "hey", "greetings", "good morning", "good evening", "good afternoon", "jarvis"]):
        b = get_battery_info()
        return f"Always a pleasure, sir. All core systems are nominal. Battery is at {b['percent']}%. How may I assist you today?"

    if "time" in cmd_lower or "clock" in cmd_lower:
        now = datetime.datetime.now().strftime("%I:%M %p")
        return f"The time is currently {now}, sir."

    if "weather" in cmd_lower:
        try:
            res = urllib.request.urlopen("https://wttr.in?format=%C+%t+%w", timeout=3)
            w_text = res.read().decode('utf-8').strip()
            return f"Current weather report, sir: {w_text}."
        except Exception:
            return "I am unable to reach the weather server at present, sir."

    return generate_jarvis_ai_response(cmd_text)

def generate_jarvis_ai_response(prompt):
    p_lower = prompt.lower()
    
    if "thank" in p_lower:
        return "You are most welcome, sir. Always at your service."

    if "how are you" in p_lower or "status" in p_lower:
        return "All systems are functioning at peak efficiency, sir. Ready for your instructions."

    if "python" in p_lower or "code" in p_lower or "script" in p_lower:
        return f"I have analyzed your programming query regarding '{prompt[:40]}...'. All development tools are ready on your Mac. Shall I open VS Code or Terminal for you, sir?"

    if re.search(r'[\d\+\-\*\/\^\=]', prompt) and len(prompt) < 30:
        try:
            clean_expr = re.sub(r'[^0-9\+\-\*\/\(\)\.]', '', prompt)
            if clean_expr:
                result = eval(clean_expr)
                return f"The result of the calculation is {result}, sir."
        except Exception:
            pass

    return f"Processing your command, sir: '{prompt}'. Systems are fully standing by."

class JarvisRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            data = get_system_telemetry()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            return
        
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/command':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                payload = json.loads(body)
                cmd = payload.get('command', '')
            except Exception:
                cmd = body
            
            response_text = process_command(cmd)
            telemetry = get_system_telemetry()
            
            result = {
                "success": True,
                "command": cmd,
                "response": response_text,
                "telemetry": telemetry
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            return
        
        self.send_error(404, "Endpoint not found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def main():
    port = PORT
    server = None
    for try_port in [8765, 8000, 8080, 8888]:
        try:
            server = ThreadedHTTPServer(('127.0.0.1', try_port), JarvisRequestHandler)
            port = try_port
            break
        except OSError:
            continue
            
    if not server:
        print("[!] Error: Could not bind to any port.")
        sys.exit(1)

    print(f"⚡ J.A.R.V.I.S. Core Engine initialized for Dhruv on http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] J.A.R.V.I.S. Core Engine shutting down.")

if __name__ == '__main__':
    main()
