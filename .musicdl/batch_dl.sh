#!/data/data/com.termux/files/usr/bin/bash
cd /data/data/com.termux/files/home/supernova/.musicdl
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
valid(){
  [ -s "$1" ] || return 1
  [ "$(stat -c%s "$1" 2>/dev/null)" -gt 20000 ] || return 1
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$1" 2>/dev/null | grep -qE '^[0-9]'
}
count_valid(){ local c=0; for i in $(seq 0 63); do valid "music_raw/$i.ogg" && c=$((c+1)); done; echo $c; }

mapfile -t lines < download_list.tsv
total=${#lines[@]}
MAX=${MAX:-30}
[ $MAX -gt 0 ] && [ $MAX -lt $total ] && total=$MAX
echo "$(count_valid)/$total" > dl_progress.txt
start=0
while [ $start -lt $total ]; do
  end=$((start+20)); [ $end -gt $total ] && end=$total
  for ((k=start;k<end;k++)); do
    IFS=$'\t' read -r i url slot <<< "${lines[$k]}"
    out="music_raw/$i.ogg"
    valid "$out" && continue
    (
      for try in 1 2 3; do
        curl -s -L -m 300 -A "$UA" "$url" -o "$out"
        valid "$out" && break
        sleep 2
      done
    ) &
  done
  wait
  echo "$(count_valid)/$total" > dl_progress.txt
  start=$end
done
echo "FIN $(count_valid)/$total" >> dl_progress.txt
