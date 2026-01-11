import http.server
import socketserver
import os
import webbrowser
from urllib.parse import urlparse

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

PORT = 3000
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    print(f"Admin dashboard: http://localhost:{PORT}/admin-orders.html")
    print(f"Checkout: http://localhost:{PORT}/checkout-professional.html")
    
    # Open browser automatically
    webbrowser.open(f'http://localhost:{PORT}/checkout-professional.html')
    
    httpd.serve_forever()
