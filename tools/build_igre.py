"""Proverava data/igre.json i pravi data/igre-data.js.

Upotreba:  python -I tools/build_igre.py
Proverava i reči sa pomešanom ćirilicom i latinicom (česta greška pri kucanju) u SVIM izvornim fajlovima.
"""
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
MESANO = re.compile(r"\b(?=\w*[а-яђјљњћџА-ЯЂЈЉЊЋЏ])(?=\w*[a-zA-Z])\w+\b")


def main():
    greske = []
    for f in ["elementi.json", "zadaci.json", "igre.json", "igre-moje.json"]:
        for i, red in enumerate((ROOT / "data" / f).read_text(encoding="utf8").splitlines(), 1):
            for m in MESANO.findall(red):
                greske.append(f"{f}:{i}: pomešana pisma u reči „{m}“")

    d = json.loads((ROOT / "data/igre.json").read_text(encoding="utf8"))
    moje = json.loads((ROOT / "data/igre-moje.json").read_text(encoding="utf8"))
    for g in moje["igre"]:
        g["izvor"] = ["moje"]
    # tvoje igre prve, pa Gemini
    d["igre"] = moje["igre"] + d["igre"]
    elementi = {e["id"] for e in json.loads((ROOT / "data/elementi.json").read_text(encoding="utf8"))["elementi"]}
    zadaci = {z["id"] for z in json.loads((ROOT / "data/zadaci.json").read_text(encoding="utf8"))["zadaci"]}
    kategorije = {k["id"] for k in d["kategorije"]}
    ids = set()
    for g in d["igre"]:
        gid = g.get("id", "?")
        for k in ["id", "naziv", "kategorija", "elementi", "trajanje", "prostor", "rekviziti", "cilj", "pravila"]:
            if k not in g:
                greske.append(f"{gid}: nedostaje '{k}'")
        if gid in ids:
            greske.append(f"{gid}: dupli id")
        ids.add(gid)
        if g.get("kategorija") not in kategorije:
            greske.append(f"{gid}: nepoznata kategorija")
        greske += [f"{gid}: nepoznat element {e}" for e in g.get("elementi", []) if e not in elementi]
        greske += [f"{gid}: nepoznat zadatak {z}" for z in g.get("zadaci", []) if z not in zadaci]
    if greske:
        print("GREŠKE:", *greske, sep="\n  ")
        sys.exit(1)
    (ROOT / "data/igre-data.js").write_text(
        "// Generisano iz tools/build_igre.py — ne menjati ručno.\nwindow.IGRE = "
        + json.dumps(d, ensure_ascii=False) + ";\n", encoding="utf8")
    po = {}
    for g in d["igre"]:
        po[g["kategorija"]] = po.get(g["kategorija"], 0) + 1
    print(f"{len(moje['igre'])} tvojih + {len(d['igre']) - len(moje['igre'])} Gemini;", ", ".join(f"{k}: {v}" for k, v in po.items()))
    pokriveno = sorted({e for g in d["igre"] for e in g["elementi"]})
    print(f"Elemenata sa bar jednom igrom: {len(pokriveno)}")


if __name__ == "__main__":
    main()
