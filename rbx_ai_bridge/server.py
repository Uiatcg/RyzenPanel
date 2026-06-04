"""
Ryzen AI Bridge Server
Runs in your terminal. I send code to it, your Roblox plugin picks it up.
"""

import json
import http.server
import socketserver
import sys
import datetime
import urllib.parse

PORT = 8765

latest_code = ""
latest_explanation = "No code sent yet."
last_updated = "Never"


class BridgeHandler(http.server.BaseHTTPRequestHandler):

    def do_POST(self):
        global latest_code, latest_explanation, last_updated
        parsed = urllib.parse.urlparse(self.path)
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode()

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            data = {}

        if parsed.path == "/update":
            latest_code = data.get("code", "")
            latest_explanation = data.get("explanation", "")
            last_updated = datetime.datetime.now().strftime("%H:%M:%S")
            print(f"[RyzenBridge] New code received! Type 'latest' in terminal to see it.")
            self.send_json({"success": True})
        else:
            self.send_json({"success": False, "error": "Unknown endpoint"})

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/latest":
            self.send_json({
                "success": True,
                "code": latest_code,
                "explanation": latest_explanation,
                "last_updated": last_updated,
            })
        elif parsed.path == "/health":
            self.send_json({"status": "running", "port": PORT})
        else:
            self.send_json({"success": False, "error": "Not found"})

    def send_json(self, obj):
        data = json.dumps(obj).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format, *args):
        pass


def main():
    print("=" * 50)
    print("  RYZEN AI BRIDGE SERVER")
    print("=" * 50)
    print(f"  Server running on: http://127.0.0.1:{PORT}")
    print()
    print("  Commands:")
    print("    latest    - Show the latest code stored")
    print("    help      - Show this menu")
    print("    exit      - Stop the server")
    print()
    print("  How it works:")
    print("  1. I (the AI) will send code to this server")
    print("  2. You click 'Get Code' in your Roblox Studio plugin")
    print("  3. The plugin inserts the code into your game")
    print("=" * 50)

    server = socketserver.TCPServer(("", PORT), BridgeHandler)
    server.timeout = 1.0  # check for keyboard input every second

    try:
        while True:
            server.handle_request()

            # Check for terminal input without blocking
            import select
            if sys.stdin in select.select([sys.stdin], [], [], 0)[0]:
                cmd = sys.stdin.readline().strip().lower()
                if cmd == "latest":
                    print(f"\n--- Latest Code (updated: {last_updated}) ---")
                    print(latest_code if latest_code else "(none)")
                    print(f"---\nExplanation: {latest_explanation}")
                    print("---\n")
                elif cmd == "help":
                    print("Commands: latest, help, exit")
                elif cmd == "exit":
                    print("Shutting down.")
                    break
    except KeyboardInterrupt:
        print("\nShutting down.")


if __name__ == "__main__":
    main()
