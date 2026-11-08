# Pokreni um — radni projekat

- `STRUKTURA_PLATFORME.md` — struktura platforme i dogovorene odluke.
- `data/elementi.json` — **katalog elemenata** (ćirilica; izvor istine, menja se ručno).
- `data/planovi.json` — godišnji planovi 1–4. godine, svaki čas povezan sa elementima (generisano).
- `data/katalog-data.js` — katalog + planovi u jednom fajlu za stranicu (generisano).
- `src/translit.js` — ćirilica ↔ latinica.
- `katalog.html` — pregled kataloga i planova, prekidač Ћир/Lat (otvara se dvoklikom).
- `data/zadaci.json` — **banka misaonih zadataka** (ćirilica; izvor istine). `data/zadaci-data.js` je generisan.
- `src/generator.js` — 11 šablona koji prave zadatak za bilo koju zadatu cifru + generator šifre.
- `zadaci.html` — banka zadataka (filteri) i generator šifre sa štampom kartica i ključem za nastavnika.

## Posle izmene `zadaci.json` ili `generator.js`

```bash
python -I tools/build_zadaci.py
```

```bash
node tools/test_generator.js
```

- `cas.html` — **graditelj časa** u 6 koraka: odeljenje → čas iz plana → priča → grupe i vreme →
  stanice (element, vežba, kapija, zadatak) → provera, rotacija i štampa (vodič za nastavnika,
  kartice stanica sa delom za kovertu, listovi timova). Časovi se čuvaju u pregledaču; izvoz/uvoz .json.
- `uzivo.html` — **čas uživo** (telefon/tablet nastavnika): tajmer po delovima časa i krugovima,
  signal za rotaciju (zvuk, vibracija, ceo ekran), gde je koji tim, kapija/rešeno/nagoveštaj, bodovi,
  provera završne šifre i redosled pobednika, prikaz za projektor bez rešenja. Stanje preživi osvežavanje.
- `data/igre.json` — **biblioteka igara** (24 igre iz Gemini kataloga, prerađene; ćirilica). Povezane su sa
  elementima i zadacima; graditelj ih nudi kao igru na stanici, kapiju (mini-izazov/timski izazov) i igru za
  pripremni/završni deo. Posle izmene: `python -I tools/build_igre.py` (proverava i pomešana pisma u svim podacima).
- `data/igre-moje.json` — **tvoje igre** (44) iz „Atletika – modeli časova“, „Zabavne igre“, „Igre Kameleona“ i
  „Stanice“. Build ih spaja sa Gemini igrama (tvoje prve, označene ★); igre koje postoje u oba izvora su označene kao zajedničke.
- `src/price.js` — 5 priča (Украдени пехар, Лабораторија доктора Кинетика, Свемирска мисија,
  Изгубљени град, Олимпијска бакља).

## Aplikacija (rad bez interneta)

- `index.html` — početna: meni, „Moji časovi“ (uredi / ▶ uživo), instalacija, stanje rada bez interneta,
  rezervna kopija svih časova i bodova (izvoz/uvoz .json).
- `manifest.webmanifest`, `sw.js`, `src/pwa.js`, `ikone/` — instalacija na telefon/tablet i rad bez interneta.
  Kad se doda NOV fajl u aplikaciju, dodati ga u listu `FAJLOVI` u `sw.js` i povećati `VERZIJA`.
  Izmene postojećih fajlova stižu same pri sledećem otvaranju sa mrežom.
- Ikonice: `python -I tools/make_icons.py`.
- Rad bez interneta i instalacija rade samo kada se aplikacija otvara sa **https** adrese
  (ili `localhost` na istom računaru) — ne kao fajl dvoklikom.

## Posle izmene `elementi.json` ili planova

```bash
python -I tools/build_katalog.py "G:/Fizička Kultura/планови прва година.docx" "G:/Fizička Kultura/планови друга година.docx" "G:/Fizička Kultura/планови трећа година.docx" "G:/Fizička Kultura/планови четврта година.docx"
```

Skripta prijavi svaki red plana koji ne ume da poveže sa elementom (tada dodati pravilo u `PRAVILA`
ili novi element u katalog).
