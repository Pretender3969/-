"""Gradi data/planovi.json i data/katalog-data.js iz godišnjih planova (.docx) i data/elementi.json.

Upotreba:
    python -I tools/build_katalog.py <plan1.docx> <plan2.docx> <plan3.docx> <plan4.docx>

Godina se čita iz naslova dokumenta (ПРВА/ДРУГА/ТРЕЋА/ЧЕТВРТА ГОДИНА).
Svaki red plana mora da se poveže sa bar jednim elementom; inače skripta prijavi grešku.
"""
import json
import re
import sys
import zipfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent

GODINE = {"ПРВА": 1, "ДРУГА": 2, "ТРЕЋА": 3, "ЧЕТВРТА": 4}
SEKCIJE = {"АТЛЕТИКА": "atletika", "ФУДБАЛ": "fudbal", "ГИМНАСТИКА": "gimnastika",
           "ОДБОЈКА": "odbojka", "КОШАРКА": "kosarka", "ПЛЕСОВИ": "ples"}

# latinična slova koja izgledaju kao ćirilična (greške pri kucanju u izvornim planovima)
LIKOVI = str.maketrans("aeopcxyAEOPCXTMHKB", "аеорсхуАЕОРСХТМНКВ")

# (sport ili None za sve, uzorak, id-jevi). Za jedan red se skupljaju SVA poklapanja unutar sporta.
PRAVILA = [
    (None, r"упознавање", ["org-uvod"]),
    (None, r"вежбе обликовања", ["kon-oblikovanje"]),
    (None, r"вежбе снаге", ["kon-snaga"]),
    ("kondicija", r"^трчање на (800|1000)", ["kon-izdrzljivost"]),
    (None, r"зак(љ|њ)учивање", ["org-zakljucivanje"]),
    (None, r"^оцењивање$", ["org-ocenjivanje"]),
    (None, r"спортска игра по избору", ["org-igra-izbor"]),

    ("atletika", r"кратке стазе", ["atl-sprint"]),
    ("atletika", r"дуге стазе", ["atl-dugo"]),
    ("atletika", r"штафете", ["atl-stafeta"]),
    ("atletika", r"даљ.*корачна", ["atl-dalj-koracna"]),
    ("atletika", r"даљ.*одабран", ["atl-dalj-izbor"]),
    ("atletika", r"кугле.*ротацион", ["atl-kugla-rot"]),
    ("atletika", r"кугле.*(brien|вriеn)", ["atl-kugla-obrajen"]),
    ("atletika", r"кугле.*одабран", ["atl-kugla-izbor"]),

    ("fudbal", r"вођења.*праволин", ["fud-vodjenje-pravo"]),
    ("fudbal", r"вођења.*промен", ["fud-vodjenje-promena"]),
    ("fudbal", r"додавања", ["fud-dodavanje"]),
    ("fudbal", r"пријема", ["fud-prijem"]),
    ("fudbal", r"правила футсала", ["fud-pravila-futsal"]),
    ("fudbal", r"шутирања.*горњим делом", ["fud-sut-rist"]),
    ("fudbal", r"шутирања.*унутрашњом", ["fud-sut-unutr-spolj"]),
    ("fudbal", r"главом", ["fud-sut-glava"]),
    ("fudbal", r"дриблинга", ["fud-dribling"]),
    ("fudbal", r"увежбавање", ["fud-uvezbavanje"]),
    ("fudbal", r"^групна тактика напада", ["fud-taktika-napad"]),
    ("fudbal", r"^групна тактика одбране", ["fud-taktika-odbrana"]),

    ("gimnastika", r"вага.*одразом", ["gim-vaga-kolut"]),
    ("gimnastika", r"став на шакама", ["gim-stav-sake"]),
    ("gimnastika", r"колут напред и спојено усправом", ["gim-kolut-vaga"]),
    ("gimnastika", r"премета", ["gim-premet-strance"]),
    ("gimnastika", r"разношка", ["gim-preskok-raznoska"]),
    ("gimnastika", r"згрчка", ["gim-preskok-zgrcka"]),
    ("gimnastika", r"склонка", ["gim-preskok-sklonka"]),
    ("gimnastika", r"њих у упору", ["gim-razboj-njih"]),
    ("gimnastika", r"саскок са окретом за 180", ["gim-razboj-saskok"]),
    ("gimnastika", r"премах", ["gim-konj-sastav"]),

    ("ples", r"моравац", ["ples-moravac"]),
    ("ples", r"гружанка", ["ples-gruzanka"]),
    ("ples", r"валцер", ["ples-becki-valcer"]),

    ("odbojka", r"прстима", ["odb-prsti"]),
    ("odbojka", r"чекићем", ["odb-cekic"]),
    ("odbojka", r"доњи сервис", ["odb-servis-donji"]),
    ("odbojka", r"лелујави", ["odb-servis-lelujavi"]),
    ("odbojka", r"ротацијом", ["odb-servis-rotacija"]),
    ("odbojka", r"правила", ["odb-pravila"]),
    ("odbojka", r"смеча", ["odb-smec"]),
    ("odbojka", r"блока", ["odb-blok"]),
    ("odbojka", r"увежбавање", ["odb-uvezbavanje"]),
    ("odbojka", r"првог темпа", ["odb-prvi-tempo"]),
    ("odbojka", r"алме", ["odb-alma"]),

    ("kosarka", r"^техника дриблинга$", ["kos-dribling-visoki", "kos-promena-prednja", "kos-promena-zadnja"]),
    ("kosarka", r"дриблинга-доњи", ["kos-dribling-niski"]),
    ("kosarka", r"дриблинга-горњи", ["kos-dribling-visoki"]),
    ("kosarka", r"предња", ["kos-promena-prednja"]),
    ("kosarka", r"задња", ["kos-promena-zadnja"]),
    ("kosarka", r"заустављања", ["kos-zaustavljanje-pivot"]),
    ("kosarka", r"левог.*двокорка", ["kos-dvokorak-levi"]),
    ("kosarka", r"десног двокорка", ["kos-dvokorak-desni"]),
    ("kosarka", r"додавања", ["kos-dodavanje-grudi"]),
    ("kosarka", r"скок шута", ["kos-skok-sut"]),
    ("kosarka", r"шута из дриблинга", ["kos-sut-iz-driblinga"]),
    ("kosarka", r"pick and roll|рiск аnd rоll", ["kos-blokada-pnr"]),
    ("kosarka", r"back door|васк dооr", ["kos-backdoor"]),
    ("kosarka", r"front door|frоnt dооr", ["kos-frontdoor"]),
    ("kosarka", r"увежбавање", ["kos-uvezbavanje"]),
    ("kosarka", r"^групна тактика напада", ["kos-taktika-napad"]),
    ("kosarka", r"^групна тактика одбране", ["kos-taktika-odbrana"]),
]


def popravi(t):
    """Latinične „lažne" ćirilice menja samo u rečima koje već sadrže ćirilicu."""
    return re.sub(r"\S+", lambda m: m.group(0).translate(LIKOVI)
                  if re.search("[а-яђјљњћџА-ЯЂЈЉЊЋЏ]", m.group(0)) else m.group(0), t)


def redovi(docx):
    xml = zipfile.ZipFile(docx).read("word/document.xml").decode("utf8")
    for p in re.findall(r"<w:p[ >].*?</w:p>", xml, re.S):
        t = "".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", p))
        t = re.sub(r"\s+", " ", t).strip()
        t = re.sub(r"(\w)“(\w)", r"\1 „\2", t)  # „леђа“back door“ → „леђа „back door“
        if "„" not in t:
            t = t.rstrip("“”\"").strip()
        if t:
            yield t


def obradi(docx):
    linije = list(redovi(docx))
    naslov = linije[0]
    godina = GODINE[naslov.split()[0].upper()]
    sport, casovi, greske = "kondicija", [], []
    for t in linije[1:]:
        m = re.match(r"^\d+\.\s*([А-ЯЂЈЉЊЋЏ]+)\s*$", t)
        if m and m.group(1) in SEKCIJE:
            sport = SEKCIJE[m.group(1)]
            continue
        sirovo = t.lower()
        norm = popravi(t).lower()
        ids = []
        for s, uzorak, cilj in PRAVILA:
            if s not in (None, sport):
                continue
            if re.search(uzorak, norm) or re.search(uzorak, sirovo):
                ids += [i for i in cilj if i not in ids]
        if not ids:
            greske.append(t)
        casovi.append({"rb": len(casovi) + 1, "tema": popravi(t),
                       "sport": sport, "elementi": ids})
    return {"godina": godina, "naziv": naslov.title(), "casovi": casovi}, greske


def main(putanje):
    katalog = json.loads((ROOT / "data/elementi.json").read_text(encoding="utf8"))
    poznati = {e["id"] for e in katalog["elementi"]}
    planovi, sve_greske = [], []
    for p in putanje:
        plan, greske = obradi(p)
        planovi.append(plan)
        sve_greske += [f"{plan['godina']}. година: {g}" for g in greske]
    planovi.sort(key=lambda p: p["godina"])

    nepoznati = {i for p in planovi for c in p["casovi"] for i in c["elementi"]} - poznati
    if sve_greske or nepoznati:
        print("NEPOVEZANI REDOVI:", *sve_greske, sep="\n  ")
        print("NEPOZNATI ID:", nepoznati)
        sys.exit(1)

    # koliko časova svaki element ima po godini
    for e in katalog["elementi"]:
        e["godine"] = {}
    po_id = {e["id"]: e for e in katalog["elementi"]}
    for p in planovi:
        for c in p["casovi"]:
            for i in c["elementi"]:
                g = po_id[i]["godine"]
                g[str(p["godina"])] = g.get(str(p["godina"]), 0) + 1

    (ROOT / "data/planovi.json").write_text(
        json.dumps({"verzija": 1, "planovi": planovi}, ensure_ascii=False, indent=1), encoding="utf8")
    katalog["planovi"] = planovi
    (ROOT / "data/katalog-data.js").write_text(
        "// Generisano iz tools/build_katalog.py — ne menjati ručno.\nwindow.KATALOG = "
        + json.dumps(katalog, ensure_ascii=False) + ";\n", encoding="utf8")

    nekorisceni = [e["id"] for e in katalog["elementi"] if not e["godine"]]
    for p in planovi:
        print(f"{p['godina']}. година: {len(p['casovi'])} часова")
    print("Elementi bez časa u planu:", nekorisceni or "nema")


if __name__ == "__main__":
    main(sys.argv[1:])
