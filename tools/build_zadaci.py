"""Proverava data/zadaci.json i pravi data/zadaci-data.js za stranice.

Upotreba:  python -I tools/build_zadaci.py
"""
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
OBAVEZNO = ["id", "tip", "razredi", "tezina", "minuta", "tekst", "odgovor"]


def main():
    d = json.loads((ROOT / "data/zadaci.json").read_text(encoding="utf8"))
    tipovi = {t["id"] for t in d["tipovi"]}
    sportovi = {s["id"] for s in json.loads((ROOT / "data/elementi.json").read_text(encoding="utf8"))["sportovi"]}
    greske, ids = [], set()
    for z in d["zadaci"]:
        zid = z.get("id", "?")
        greske += [f"{zid}: nedostaje '{k}'" for k in OBAVEZNO if k not in z]
        if zid in ids:
            greske.append(f"{zid}: dupli id")
        ids.add(zid)
        if z.get("tip") not in tipovi:
            greske.append(f"{zid}: nepoznat tip {z.get('tip')}")
        if "sport" in z and z["sport"] not in sportovi:
            greske.append(f"{zid}: nepoznat sport {z['sport']}")
        r = z.get("razredi", [0, 0])
        if not (1 <= r[0] <= r[1] <= 12):
            greske.append(f"{zid}: razredi van 1–12")
        if not 1 <= z.get("tezina", 0) <= 5:
            greske.append(f"{zid}: tezina van 1–5")
        # cifra za trag: odgovor je tačno jedna cifra
        z.pop("cifra", None)
        if re.fullmatch(r"\d", str(z.get("odgovor", "")).strip()):
            z["cifra"] = int(z["odgovor"])
    if greske:
        print("GREŠKE:", *greske, sep="\n  ")
        sys.exit(1)

    (ROOT / "data/zadaci-data.js").write_text(
        "// Generisano iz tools/build_zadaci.py — ne menjati ručno.\nwindow.ZADACI = "
        + json.dumps(d, ensure_ascii=False) + ";\n", encoding="utf8")
    po_tipu = {}
    for z in d["zadaci"]:
        po_tipu[z["tip"]] = po_tipu.get(z["tip"], 0) + 1
    cifre = sorted({z["cifra"] for z in d["zadaci"] if "cifra" in z})
    print(f"{len(d['zadaci'])} zadataka;", ", ".join(f"{k}: {v}" for k, v in po_tipu.items()))
    print("Cifre pokrivene bankom:", cifre)


if __name__ == "__main__":
    main()
