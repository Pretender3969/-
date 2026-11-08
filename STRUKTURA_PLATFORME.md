# Platforma „Pokreni um" — struktura (radna verzija 0.1)

> Radni naziv. Alat za profesore fizičkog vaspitanja kojim se nastavna jedinica iz plana
> (npr. *Tehnika šutiranja lopte gornjim delom stopala*) pretvara u čas-avanturu:
> grupe prolaze poligon/stanice, na kraju svake rešavaju misaoni zadatak, dobijaju trag,
> a na kraju časa ceo tim sastavlja tragove i „otključava" završni izazov.

Izvori: tvoji godišnji planovi (1–4. godina), `Stanice.docx`, `ZABAVNE IGRE FIZICKO.docx`,
`Igre Kameleona ODABRANO.docx`, `Metodički vodič.docx`. NotebookLM beleška još nije uključena
(traži Google prijavu).

---

## 1. Osnovna ideja u jednoj rečenici

**Element iz plana → Stanica (kretanje) → Kapija (uslov kvaliteta) → Misaoni zadatak → Trag → Završna zagonetka.**

Svaki čas ima tri sloja koja se uvek slažu:

| Sloj | Šta je | Primer |
|---|---|---|
| **Motorički** | element iz plana koji se uči/uvežbava | šut ristom, dvokorak, sklonka |
| **Kognitivni** | zadatak koji traži razmišljanje | Cezarova šifra, brzina = put/vreme |
| **Narativni** | priča koja povezuje stanice | „Ukradeni pehar", „Laboratorija doktora X" |

Pedagoška osnova (za obrazloženje direktoru/aktivu): dvojni zadaci (*dual-task*, kognitivno-motorički
trening), aktivno učenje kroz kretanje, edukativne „escape room" igre, model *Sport Education*
(timovi, uloge, sezona), međupredmetne kompetencije i korelacija iz Zakona o osnovama sistema obrazovanja.

---

## 2. Korisnici i uloge

| Uloga | Šta radi |
|---|---|
| **Profesor (autor)** | dodaje sportove/elemente, pravi zadatke, sklapa časove, štampa, vodi čas uživo |
| **Učenik / tim** | (opciono) skenira QR na stanici, unosi odgovor, vidi napredak tima |
| **Škola / aktiv** | deli biblioteku časova među profesorima iste škole |
| **Zajednica** | javna biblioteka gotovih časova i zadataka (ocene, preuzimanja, „kloniraj i prilagodi") |
| **Administrator** | održava osnovni katalog sportova i elemenata po programu |

---

## 3. Model podataka (srce platforme)

```
Sport ─┬─ Celina (Atletika: Skokovi, Bacanja…)
       └─ Element (Tehnika skoka u dalj – koračna)
             ├─ razred/uzrast, ishodi, metodski koraci, tipične greške
             ├─ vežbe (doziranje, organizacija, rekviziti, prostor)
             └─ nivo: obučavanje / uvežbavanje / ocenjivanje

Godišnji plan ── Čas iz plana (redni broj, nedelja) ── povezan sa 1+ Elementom

Misaoni zadatak (banka)
   ├─ tip: zagonetka, šifra, matematika, fizika, hemija, biologija, geografija,
   │        istorija, jezik, logika, memorija, prostorno, sport-kviz
   ├─ uzrast, težina (1–5), procenjeno vreme rešavanja
   ├─ tekst, slika, tačan odgovor (+ prihvatljive varijante), 1–3 nagoveštaja
   └─ izlaz (TRAG): cifra, slovo, reč, deo slagalice, koordinata, boja…

Stanica = Element + Vežba + Kapija + Misaoni zadatak + Trag
   Kapija = uslov za dobijanje zadatka: „3 pogotka u zonu", „cela grupa prošla",
            ili REZULTAT vežbe ulazi u zadatak (broj ponavljanja → broj u računu)

Avantura (čas) = Priča + Grupe + Stanice + Rotacija + Završna zagonetka + Bodovanje
   └─ struktura časa: uvodni / pripremni / glavni / završni deo (minuti)
```

Ključna ideja: **trag nije vezan za zadatak nego za stanicu**, pa profesor može da zameni zadatak
(lakši za 1. godinu, teži za 4.) a da završna šifra ostane ista.

---

## 4. Tri režima igre (isti sadržaj, tri oblika)

1. **Avantura / Escape** — grupe kruže po stanicama, skupljaju tragove, otvaraju „bravu" na kraju.
   Kooperativno unutar tima, opciono trka između timova.
2. **Takmičenje** — bodovi za kvalitet izvođenja + tačnost + vreme; rang lista časa, odeljenja,
   škole; „sezona" kroz celo polugodište (veza sa *Sport Education* modelom).
3. **Kartaška igra** — sve se može odštampati kao karte: *karta stanice*, *karta zadatka*,
   *karta traga*, *karta događaja* („Žuti karton: ceo tim 10 čučnjeva", „Bonus: preskoči nagoveštaj").
   Čas radi i bez telefona i interneta.

---

## 5. Moduli i funkcije

### 5.1 Biblioteka sportova i elemenata
- Unapred učitani elementi iz tvojih planova (1–4. godina srednje: atletika, fudbal, gimnastika,
  odbojka, košarka, plesovi, vežbe oblikovanja i snage); kasnije osnovna škola po razredima.
- Profesor dodaje svoj sport/element (npr. rukomet, stoni tenis, orijentiring).
- Uz element: ishodi, metodski koraci, greške, slike/video link, vežbe sa doziranjem.

### 5.2 Banka misaonih zadataka
- Filteri: tip, predmet, uzrast, težina, trajanje, tip traga.
- **Šabloni zadataka** (profesor samo menja brojeve/reči): Cezarova šifra, anagram, niz brojeva,
  sudoku 4×4, „ko laže, ko govori istinu", kretanje = put/vreme, procenti, površina terena,
  memorija (parovi karata), mapa/koordinate, kvizno pitanje iz sporta.
- **Generator završne zagonetke**: iz tragova stanica pravi bravu (4-cifrena šifra, reč, slagalica,
  mapa sa „X" na mestu blaga u sali).
- Kasnije: AI predlog zadataka po temi i uzrastu, uz obaveznu proveru profesora.

### 5.3 Graditelj časa (čarobnjak u 6 koraka)
1. Razred i odeljenje → 2. Čas iz godišnjeg plana (elementi se sami povlače) →
3. Priča/tema (izbor ili sopstvena) → 4. Broj grupa i učenika, prostor, raspoloživi rekviziti →
5. Platforma predloži stanice i zadatke, profesor menja → 6. Provera: vreme, bezbednost, balans
   težine između grupa → gotovo.
- Automatski raspored rotacije (svaka grupa kreće sa druge stanice, bez gužve).
- Proračun vremena: 45 min, glavni deo ≈ 25–30 min → koliko stanica i koliko minuta po stanici.

### 5.4 Štampa / izvoz (PDF)
- Karta stanice (A5): crtež postavke, opis vežbe, kapija.
- Koverta sa zadatkom i kartica traga.
- List tima (upis tragova, bodova).
- **Profesorski vodič**: rešenja, nagoveštaji, raspored, spisak rekvizita, napomene o bezbednosti.
- QR kodovi na kartama (za digitalni režim).

### 5.5 Čas uživo (tablet/telefon profesora)
- Tajmer po stanici i signal za rotaciju.
- Unos odgovora (profesor ili tim preko QR), automatska provera.
- Nagoveštaj „košta" bodove ili vežbu (npr. 10 skokova).
- Tabla rezultata na projektoru/telefonu.
- **Rad bez interneta** (sala često nema signal) — sinhronizacija posle.

### 5.6 Praćenje i ocenjivanje
- Beleška po učeniku: izvođenje elementa (formativno), saradnja, uloga u timu.
- Veza sa tvojom pedagoškom sveskom / kartonima učenika (izvoz).
- Izveštaj: koji ishodi su obrađeni, koji časovi održani (za dnevnik).

### 5.7 Inkluzija i prilagođavanje (IOP)
- Za svaku vežbu alternativa (lakša, bez skoka, sedeća…).
- Uloge u timu za učenike oslobođene vežbanja: „šifrant", „sudija", „merač vremena" — i dalje
  učestvuju kroz misaoni deo.
- Težina zadatka po grupi (diferencijacija bez obeležavanja).

### 5.8 Inventar rekvizita i prostora
- Profesor jednom unese šta škola ima (čunjevi, strunjače, švedski sanduk…) i prostor (sala, teren).
- Graditelj predlaže samo stanice koje se mogu postaviti.

### 5.9 Deljenje i zajednica
- „Kloniraj i prilagodi" tuđi čas; ocene i komentari; oznake (razred, sport, element).

---

## 6. Primer: jedan čas napravljen na platformi

**2. godina · Fudbal · Tehnika šutiranja lopte gornjim delom stopala**
**Priča: „Ukradeni pehar"** — pehar je zaključan u sefu sa šifrom od 4 cifre.
4 grupe × 6–8 učenika, 4 stanice po ~6 min, rotacija u smeru kazaljke.

| # | Stanica (kretanje) | Kapija | Misaoni zadatak | Trag |
|---|---|---|---|---|
| 1 | Vođenje kroz slalom + šut ristom na gol sa zonama | svaki član pogodi zonu bar jednom | Lopta pređe 18 m za 2 s. Kolika je brzina u m/s? | **9** |
| 2 | Šut ristom iz mesta na niski gol (čunjevi) sa 9 m | tim skupi 6 pogodaka | Koliko komora ima ljudsko srce? | **4** |
| 3 | Dodavanje u paru pa šut ristom posle prijema | 5 uzastopnih tačnih dodavanja | Tim ima 11 igrača. Dva dobiju crveni karton, golman se povredi, a izmene su potrošene. Koliko ih ostaje na terenu? | **8** |
| 4 | Šut ristom u „kuglanje" (čunjevi) | srušiti sve čunjeve | Cezarova šifra, svako slovo jedno mesto unazad: **TFEBN** | **7** (SEDAM) |

**Završni zadatak:** grupa poređa tragove po broju stanice → **9-4-8-7** → otvara katanac/kovertu sa
„peharom" (bodovi, bonus, pravo izbora igre na sledećem času…).
Profesor za 1. godinu menja zadatke na lakše, za 4. godinu na teže — šifra ostaje ista.

---

## 7. Tehnički predlog (za kasnije, kad se dogovorimo o obimu)

- **Web aplikacija (PWA)**: radi na računaru, tabletu i telefonu, instalira se kao aplikacija,
  radi bez interneta u sali.
- Podaci: korisnički nalozi + baza (sportovi, elementi, zadaci, časovi) u oblaku, lokalna kopija
  na uređaju.
- PDF generator za karte i vodiče.
- Ceo interfejs na srpskom od prvog dana, ali tekstovi odvojeni od koda (lako dodati ćirilicu/latinicu
  ili drugi jezik kasnije).

## 7a. Dogovorene odluke (8. 11. 2026)

- Prva verzija: **web aplikacija (PWA, radi bez interneta) + PDF štampa**.
- Pismo: **ćirilica i latinica sa prekidačem** (sadržaj se čuva jednom, pismo se menja automatski).
- Korisnici: **prvo samo autor**, zatim kolege (nalozi i deljenje u kasnijoj fazi).
- Učenici: **samo papirne karte** (koverte, tragovi, list tima); tablet/telefon koristi samo profesor.

## 8. Faze razvoja (predlog)

| Faza | Sadržaj |
|---|---|
| **0 – Sadržaj** | katalog elemenata iz planova, 50–100 zadataka u banci, 5 gotovih avantura |
| **1 – MVP** | biblioteka + banka + graditelj časa + PDF štampa (sve bez interneta, jedan profesor) |
| **2 – Čas uživo** | tajmer, rotacija, unos odgovora, tabla rezultata, QR |
| **3 – Takmičenje i praćenje** | sezone, rang liste, beleške po učeniku, izveštaji |
| **4 – Zajednica i AI** | deljenje, ocene, AI predlog zadataka i priča |
