import http.server, socketserver, urllib.parse, datetime, os, traceback

PORT = 8000
BIND = '127.0.0.1'
LOGS = ['/sdcard/Download/supernova_error.txt',
        '/data/data/com.termux/files/home/supernova/errores.txt']

os.chdir(os.path.dirname(os.path.abspath(__file__)))


def write_log(line):
    for path in LOGS:
        try:
            with open(path, 'a', encoding='utf-8') as f:
                f.write(line)
        except Exception as e:
            print('LOGFAIL', path, e)


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/__err'):
            q = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(q)
            msg = params.get('m', [''])[0]
            line = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') + '  ' + msg + '\n'
            print('ERR>', msg)
            write_log(line)
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'ok')
            return
        return super().do_GET()

    def log_message(self, fmt, *args):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer((BIND, PORT), Handler) as httpd:
    print('SUPERNOVA server en http://%s:%d' % (BIND, PORT))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
