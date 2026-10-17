#!/usr/bin/env python3
# Genera el set de 30 canciones para Supernova:
#  - 4 fijas y unicas: intro, select, credits, boss   (indices 0..3)
#  - 26 de pool repartidas entre los 60 niveles, con repeticiones
#  - pausa reutiliza la pista del nivel actual (sin fichero propio)
#  - TODOS los 60 niveles tienen jefe (LEVELS.forEach L.boss=true):
#      * fase normal del nivel  -> pista de pool
#      * pelea con el jefe      -> pista fija 'boss'
import json, random, re, os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                     # ~/supernova
INDEX = os.path.join(ROOT, "index.html")

# --- candidatos de descarga ---
rows = []
with open(os.path.join(HERE, "download_list.tsv"), encoding="utf-8") as f:
    for line in f:
        line = line.rstrip("\n")
        if not line:
            continue
        p = line.split("\t")
        if len(p) >= 3:
            rows.append((int(p[0]), p[1], p[2]))
by_idx = {i: (u, s) for (i, u, s) in rows}

FIXED = {"intro": 0, "select": 1, "credits": 2, "boss": 3}
POOL = list(range(4, 30))          # 26 pistas de pool

# --- contar niveles desde index.html ---
try:
    txt = open(INDEX, encoding="utf-8", errors="ignore").read()
    block = re.search(r"const LEVELS\s*=\s*\[(.*?)\n\];", txt, re.S).group(1)
    N_LEVELS = sum(1 for line in block.splitlines() if "name:" in line)
except Exception as e:
    print("AVISO: no se pudo leer index.html, uso 60 niveles:", e)
    N_LEVELS = 60

random.seed(20261016)              # semilla fija => reproducible

# pool repartido entre TODOS los niveles (cada pista al menos una vez)
assign = {}
order = list(range(N_LEVELS))
random.shuffle(order)
for pos, pidx in enumerate(random.sample(POOL, len(POOL))):
    assign[order[pos]] = pidx
for i in range(N_LEVELS):
    if i not in assign:
        assign[i] = random.choice(POOL)

# ---- setlist de descarga (30 ficheros unicos) ----
setlist_path = os.path.join(HERE, "setlist_30.tsv")
role_of = {v: k for k, v in FIXED.items()}
with open(setlist_path, "w", encoding="utf-8") as f:
    for i in range(30):
        url, slot = by_idx[i]
        f.write(f"{i}\t{url}\t{role_of.get(i, 'pool')}\n")

# ---- mapa de slots del juego -> fichero ----
mapping = {}
mapping["intro"] = FIXED["intro"]
mapping["select"] = FIXED["select"]
mapping["credits"] = FIXED["credits"]
mapping["boss"] = FIXED["boss"]     # pelea de jefe en los 60 niveles
mapping["pause"] = "level"
mapping["victory"] = 4
mapping["win"] = 5
mapping["lose"] = 6
for i in range(N_LEVELS):
    mapping[f"lvl{i}"] = assign[i]

map_path = os.path.join(HERE, "music_map.json")
with open(map_path, "w", encoding="utf-8") as f:
    json.dump(mapping, f, indent=1, ensure_ascii=False)

# ---- resumen ----
c = Counter(assign.values())
print("Ficheros: 30 (indices 0..29)   Niveles:", N_LEVELS)
print("Fijos:", {k: f"{v}.ogg" for k, v in FIXED.items()})
print("Pool (%d): indices %d..%d" % (len(POOL), POOL[0], POOL[-1]))
print("Pool por nivel: min %d, max %d usos" % (min(c.values()), max(c.values())))
print("Todos los niveles con pista:", all(i in assign for i in range(N_LEVELS)))
print("Escritos:", os.path.basename(setlist_path), "y", os.path.basename(map_path))
