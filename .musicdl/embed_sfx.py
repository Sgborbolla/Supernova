#!/usr/bin/env python3
import os, base64, mimetypes, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX = os.path.join(ROOT, "sfx")
HTML = os.path.join(ROOT, "index.html")

MIME = {"mp3": "audio/mpeg", "wav": "audio/wav", "ogg": "audio/ogg"}
START = "<!--SFXEMBED_START-->"
END = "<!--SFXEMBED_END-->"

def data_uri(path, ext):
    with open(path, "rb") as f:
        b = base64.b64encode(f.read()).decode("ascii")
    return "data:%s;base64,%s" % (MIME.get(ext, "audio/mpeg"), b)

entries = []
names = os.listdir(SFX)
def key(fn):
    return os.path.splitext(fn)[0]
names.sort(key=key)
for fn in names:
    p = os.path.join(SFX, fn)
    if not os.path.isfile(p):
        continue
    ext = fn.rsplit(".", 1)[-1].lower()
    entries.append("%s:'%s'" % (key(fn), data_uri(p, ext)))

block = (START + "\n<script>window.SFX_DATA={" + ",\n".join(entries) + "};</script>\n" + END + "\n")

with open(HTML, "r", encoding="utf-8") as f:
    html = f.read()

html = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n?", "", html, flags=re.S)

anchor = '<script src="lib/peerjs.min.js"></script>\n'
i = html.find(anchor)
if i < 0:
    print("ANCHOR not found")
    sys.exit(1)
i += len(anchor)
html = html[:i] + block + html[i:]

with open(HTML, "w", encoding="utf-8") as f:
    f.write(html)

print("embedded %d sfx -> %s (%.1f MB)" % (len(entries), HTML, os.path.getsize(HTML) / 1048576))
