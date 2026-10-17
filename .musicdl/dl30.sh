#!/data/data/com.termux/files/usr/bin/bash
# Descarga las 30 pistas del set (setlist_30.tsv) a ./music/<idx>.ogg
# Verifica tamano (>20KB), duracion (ffprobe) y que no falte trozo (vs. Content-Length).
set -u
cd "$(dirname "$0")"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
OUT="../music"
LIST="setlist_30.tsv"
mkdir -p "$OUT"

remote_size(){
  curl -sIL --max-time 30 -A "$UA" "$1" 2>/dev/null \
    | grep -i '^content-length:' | tail -1 | tr -d '\r' | awk '{print $2}'
}

valid(){
  local f="$1" rsz="$2" lsz
  [ -s "$f" ] || return 1
  lsz=$(stat -c%s "$f" 2>/dev/null) || return 1
  [ "$lsz" -gt 20000 ] || return 1
  [ -n "$rsz" ] && [ "$lsz" -lt "$rsz" ] && return 1
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null | grep -qE '^[0-9]'
}

total=0; done_ok=0
while IFS=$'\t' read -r idx url role; do
  [ -z "$idx" ] && continue
  total=$((total+1))
  out="$OUT/$idx.ogg"
  rsz=$(remote_size "$url")
  if valid "$out" "$rsz"; then
    done_ok=$((done_ok+1))
    printf '[%2d/%2d] %s ya OK (%s)\n' "$done_ok" "$total" "$out" "$role"
    continue
  fi
  printf '[--/ %2d] %s -> %s (%s)\n' "$total" "$role" "$out" "descargando"
  for try in 1 2 3; do
    curl -sL --retry 2 -m 600 -C - -A "$UA" "$url" -o "$out"
    valid "$out" "$rsz" && break
    sleep 3
  done
  if valid "$out" "$rsz"; then
    done_ok=$((done_ok+1))
  else
    echo "  !! FALLO: $out (revizar)"
    rm -f "$out"
  fi
  printf '%d/%d\n' "$done_ok" "$total" > dl_progress.txt
done < "$LIST"

echo "FIN $done_ok/$total" >> dl_progress.txt
echo "=== TERMINADO: $done_ok/$total ==="
