#!/data/data/com.termux/files/usr/bin/bash
set -u
cd ~/supernova
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
mapfile -t LINES < <(node -e '
const fs=require("fs");const p=JSON.parse(fs.readFileSync(".musicdl/extra20.json","utf8"));
p.forEach((r,i)=>{const b=decodeURIComponent(r.url.split("/").pop());console.log((30+i)+"\t"+r.url+"\t"+b);});')
: > .musicdl/extra20_manifest.json
echo "[" > .musicdl/extra20_manifest.json
first=1
idx=30
for line in "${LINES[@]}"; do
  IFS=$'\t' read -r n url b <<< "$line"
  ext="${b##*.}"; out="music/$n.$ext"
  curl -sL --retry 3 -m 300 -C - -A "$UA" "$url" -o "$out"
  sz=$(stat -c%s "$out" 2>/dev/null || echo 0)
  magic=$(head -c4 "$out" 2>/dev/null | tr -d '\0')
  printf "[%2d] %-40s %8s bytes  hdr=%s\n" "$n" "$(echo "$b" | cut -c1-38)" "$sz" "$(head -c3 "$out" | tr -d '\0')"
  [ $first -eq 1 ] || printf ",\n" >> .musicdl/extra20_manifest.json
  first=0
  printf ' {"idx":%d,"file":"music/%d.%s","src":"%s","name":"%s"}' "$n" "$n" "$ext" "$(echo "$url" | sed 's/"/\\"/g')" "$(echo "$b" | sed 's/"/\\"/g')" >> .musicdl/extra20_manifest.json
  idx=$((idx+1))
done
printf "\n]\n" >> .musicdl/extra20_manifest.json
echo "=== fin ==="
