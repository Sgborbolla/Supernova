#!/data/data/com.termux/files/usr/bin/bash
set -u
cd ~/supernova
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
mapfile -t LINES < <(node -e '
const fs=require("fs");const p=JSON.parse(fs.readFileSync(".musicdl/extra23.json","utf8"));
p.forEach((r,i)=>{const b=decodeURIComponent(r.url.split("/").pop());console.log((50+i)+"\t"+r.url+"\t"+b);});')
echo "[" > .musicdl/extra23_manifest.json
first=1
for line in "${LINES[@]}"; do
  IFS=$'\t' read -r n url b <<< "$line"
  ext="${b##*.}"; out="music/$n.$ext"
  curl -sL --retry 3 -m 300 -C - -A "$UA" "$url" -o "$out"
  sz=$(stat -c%s "$out" 2>/dev/null || echo 0)
  printf "[%2d] %-40s %8s bytes\n" "$n" "$(echo "$b" | cut -c1-38)" "$sz"
  [ $first -eq 1 ] || printf ",\n" >> .musicdl/extra23_manifest.json
  first=0
  printf ' {"idx":%d,"file":"music/%d.%s","name":"%s"}' "$n" "$n" "$ext" "$(echo "$b" | sed 's/"/\\"/g')" >> .musicdl/extra23_manifest.json
done
printf "\n]\n" >> .musicdl/extra23_manifest.json
echo "=== fin ==="
