"""Local account-only origin. Never serve game HTML or arbitrary files here."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
FILES = {
    '/': ('secure-account.html', 'text/html; charset=utf-8'),
    '/secure-account.js': ('secure-account.js', 'text/javascript; charset=utf-8'),
    '/secure-account.css': ('secure-account.css', 'text/css; charset=utf-8'),
    '/firebase-config.js': ('firebase-config.js', 'text/javascript; charset=utf-8'),
}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.headers.get('Host') != 'localhost:8001':
            self.send_error(403)
            return
        item = FILES.get(urlsplit(self.path).path)
        if not item:
            self.send_error(404)
            return
        data = (ROOT / item[0]).read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', item[1])
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Content-Security-Policy', "default-src 'none'; script-src 'self' https://www.gstatic.com https://apis.google.com; style-src 'self'; connect-src https://*.googleapis.com https://*.firebaseapp.com https://*.gstatic.com; frame-src https://kermit-web.firebaseapp.com https://accounts.google.com; img-src 'self' https://*.googleusercontent.com; base-uri 'none'; form-action 'none'; frame-ancestors http://127.0.0.1:8000 http://localhost:8000")
        self.end_headers()
        self.wfile.write(data)

if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 8001), Handler).serve_forever()
