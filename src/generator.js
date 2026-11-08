// Generator misaonih zadataka po šablonu.
// Svaki šablon pravi zadatak čiji je odgovor TAČNO zadata cifra (0–9),
// pa trag stanice ostaje isti bez obzira na težinu zadatka.
(function (global) {
  const Translit = global.Translit || (typeof require !== 'undefined' ? require('./translit.js') : null);

  // --- pomoćno --------------------------------------------------------------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const ceo = (rnd, od, doo) => od + Math.floor(rnd() * (doo - od + 1));
  const izaberi = (rnd, niz) => niz[Math.floor(rnd() * niz.length)];
  function promesaj(rnd, niz) {
    const a = niz.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  const BROJEVI = ['НУЛА', 'ЈЕДАН', 'ДВА', 'ТРИ', 'ЧЕТИРИ', 'ПЕТ', 'ШЕСТ', 'СЕДАМ', 'ОСАМ', 'ДЕВЕТ'];
  const AZBUKA = 'А Б В Г Д Ђ Е Ж З И Ј К Л Љ М Н Њ О П Р С Т Ћ У Ф Х Ц Ч Џ Ш'.split(' ');
  const ABECEDA = 'A B C Č Ć D DŽ Đ E F G H I J K L LJ M N NJ O P R S Š T U V Z Ž'.split(' ');

  // reč kao niz slova izabranog pisma (digrafi LJ, NJ, DŽ su jedno slovo)
  function slova(recCir, pismo) {
    if (pismo !== 'lat') return [...recCir];
    return Translit.uLatinicu(recCir).match(/DŽ|LJ|NJ|./g);
  }

  function rimski(n) {
    const t = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let s = '';
    for (const [v, r] of t) while (n >= v) { s += r; n -= v; }
    return s;
  }

  // --- šabloni --------------------------------------------------------------
  // generisi(d, nivo 1–3, rnd, pismo) → { tekst, odgovor, objasnjenje, nagovestaji, [sifra] }
  // Tekst je na ćirilici; deo koji ne sme da se transliteruje (šifra) ide u polje `sifra`
  // i ubacuje se na mesto {ŠИФРА}.
  const SABLONI = [
    {
      id: 'jednacina', naziv: 'Једначина', tip: 'matematika',
      podrzava: () => true,
      generisi(d, nivo, rnd) {
        if (nivo === 1) {
          const a = ceo(rnd, 2, 9);
          return { tekst: `Реши: x + ${a} = ${d + a}. Колико је x?`, objasnjenje: `x = ${d + a} − ${a} = ${d}`,
            nagovestaji: ['Одузми исти број са обе стране.'] };
        }
        if (nivo === 2) {
          const a = ceo(rnd, 2, 6), b = ceo(rnd, 1, 9);
          return { tekst: `Реши: ${a}x + ${b} = ${a * d + b}. Колико је x?`,
            objasnjenje: `${a}x = ${a * d}, x = ${d}`, nagovestaji: [`Прво одузми ${b}.`] };
        }
        const a = ceo(rnd, 2, 5), b = ceo(rnd, 1, 6);
        return { tekst: `Реши: ${a}·(x + ${b}) = ${a * (d + b)}. Колико је x?`,
          objasnjenje: `x + ${b} = ${d + b}, x = ${d}`, nagovestaji: [`Подели обе стране са ${a}.`] };
      }
    },
    {
      id: 'brzina', naziv: 'Брзина и убрзање', tip: 'fizika',
      podrzava: d => d >= 1,
      generisi(d, nivo, rnd) {
        if (nivo === 1) {
          const t = ceo(rnd, 2, 10);
          return { tekst: `Тркач претрчи ${d * t} м за ${t} с. Колика је његова брзина у m/s?`,
            objasnjenje: `${d * t} : ${t} = ${d} m/s`, nagovestaji: ['Брзина = пут : време.'] };
        }
        if (nivo === 2) {
          const kmh = String(+(d * 3.6).toFixed(1)).replace('.', ',');
          return { tekst: `Лопта лети брзином од ${kmh} km/h. Колико је то m/s?`,
            objasnjenje: `${kmh} : 3,6 = ${d} m/s`, nagovestaji: ['1 m/s = 3,6 km/h.'] };
        }
        const t = izaberi(rnd, [2, 4]);
        return { tekst: `Спринтер креће из мировања и равномерно убрзава. За ${t} с пређе ${d * t * t / 2} м. Колико је његово убрзање у m/s²?`,
          objasnjenje: `s = a·t²/2 → a = 2·${d * t * t / 2} : ${t * t} = ${d} m/s²`, nagovestaji: ['s = a·t² / 2'] };
      }
    },
    {
      id: 'niz', naziv: 'Низ бројева', tip: 'matematika',
      podrzava: (d, nivo) => nivo !== 2 || d >= 1,
      generisi(d, nivo, rnd) {
        let clanovi, pravilo;
        if (nivo === 1) {
          const k = ceo(rnd, 2, 5);
          clanovi = [d + k, d + 2 * k, d + 3 * k, d + 4 * k]; pravilo = `сваки следећи је већи за ${k}`;
        } else if (nivo === 2) {
          const q = izaberi(rnd, [2, 3]);
          clanovi = [d * q, d * q * q, d * q ** 3]; pravilo = `сваки следећи је ${q} пута већи`;
        } else {
          clanovi = [d + 1, d + 3, d + 6, d + 10]; pravilo = 'разлике су 1, 2, 3, 4';
        }
        return { tekst: `Који број недостаје на почетку низа: ?, ${clanovi.join(', ')}`,
          objasnjenje: `Правило: ${pravilo}. Први број је ${d}.`, nagovestaji: ['Погледај разлику (или однос) суседних бројева.'] };
      }
    },
    {
      id: 'procenat', naziv: 'Проценти и делови', tip: 'matematika',
      podrzava: d => d >= 1,
      generisi(d, nivo, rnd) {
        if (nivo === 1) return { tekst: `Колико је половина од ${2 * d}?`, objasnjenje: `${2 * d} : 2 = ${d}`, nagovestaji: ['Подели на два једнака дела.'] };
        const [p, k] = izaberi(rnd, nivo === 2 ? [[50, 2], [25, 4], [10, 10]] : [[20, 5], [25, 4], [5, 20]]);
        return { tekst: `Тим је шутирао ${d * k} пута на гол и погодио ${p}% шутева. Колико голова је постигао?`,
          objasnjenje: `${p}% од ${d * k} = ${d * k} : ${k} = ${d}`, nagovestaji: [`${p}% је један ${k === 2 ? 'други' : k + '.'} део.`] };
      }
    },
    {
      id: 'cezar', naziv: 'Цезарова шифра', tip: 'jezik',
      podrzava: () => true,
      generisi(d, nivo, rnd, pismo) {
        const k = nivo;
        const az = pismo === 'lat' ? ABECEDA : AZBUKA;
        const sifra = slova(BROJEVI[d], pismo).map(s => az[(az.indexOf(s) + k) % az.length]).join(' ');
        const red = nivo < 3 ? `\n${pismo === 'lat' ? 'Abeceda' : 'Азбука'}: ${az.join(' ')}` : '';
        return { tekst: `Дешифруј: свако слово замени оним које је ${k} ${k === 1 ? 'место' : 'места'} РАНИЈЕ у ${pismo === 'lat' ? 'абецеди' : 'азбуци'} (ка почетку).\n{ŠИФРА}`,
          sifra: sifra + red, objasnjenje: `${sifra} → ${BROJEVI[d]} = ${d}`,
          nagovestaji: ['Решење је један број написан словима.'] };
      }
    },
    {
      id: 'anagram', naziv: 'Анаграм', tip: 'jezik',
      podrzava: (d, nivo) => nivo < 3 || d <= 8,
      generisi(d, nivo, rnd, pismo) {
        const cilj = nivo === 3 ? d + 1 : d;
        const s = slova(BROJEVI[cilj], pismo);
        let m = s;
        for (let i = 0; i < 20 && m.join('') === s.join(''); i++) m = promesaj(rnd, s);
        const dodatak = nivo === 3 ? ' Од добијеног броја одузми 1.' : '';
        return { tekst: `Премести слова тако да добијеш број: {ŠИФРА}.${dodatak}`, sifra: m.join(' '),
          objasnjenje: `${BROJEVI[cilj]}${nivo === 3 ? ` = ${cilj}; ${cilj} − 1` : ''} = ${d}`,
          nagovestaji: [`Реч има ${s.length} слова.`] };
      }
    },
    {
      id: 'rimski', naziv: 'Римски бројеви', tip: 'istorija',
      podrzava: d => d >= 1,
      generisi(d, nivo, rnd) {
        if (nivo === 1) return { tekst: 'Који број је записан римским цифрама: {ŠИФРА}?', sifra: rimski(d), objasnjenje: `${rimski(d)} = ${d}`, nagovestaji: ['I = 1, V = 5, X = 10'] };
        const a = d + ceo(rnd, 2, 12), b = a - d;
        if (nivo === 2) return { tekst: 'Израчунај и напиши резултат арапским цифрама: {ŠИФРА}', sifra: `${rimski(a)} − ${rimski(b)}`,
          objasnjenje: `${a} − ${b} = ${d}`, nagovestaji: ['Прво преведи оба броја.'] };
        const c = ceo(rnd, 2, 9);
        return { tekst: 'Израчунај и напиши резултат арапским цифрама: {ŠИФРА}', sifra: `${rimski(a)} + ${rimski(c)} − ${rimski(b + c)}`,
          objasnjenje: `${a} + ${c} − ${b + c} = ${d}`, nagovestaji: ['I = 1, V = 5, X = 10, L = 50'] };
      }
    },
    {
      id: 'binarni', naziv: 'Бинарни бројеви', tip: 'matematika',
      podrzava: () => true,
      generisi(d, nivo, rnd) {
        const bin = n => n.toString(2).padStart(4, '0');
        if (nivo < 3) return { tekst: 'Број је записан у бинарном систему (само 0 и 1). Који је то број: {ŠИФРА}?', sifra: bin(d),
          objasnjenje: `${bin(d)}₂ = ${d}`, nagovestaji: ['Места вреде 8, 4, 2, 1 (с лева на десно).'] };
        const a = ceo(rnd, 0, d);
        return { tekst: 'Саберите бинарне бројеве и резултат напишите као обичан број: {ŠИФРА}', sifra: `${bin(a)} + ${bin(d - a)}`,
          objasnjenje: `${a} + ${d - a} = ${d}`, nagovestaji: ['Места вреде 8, 4, 2, 1.'] };
      }
    },
    {
      id: 'kosarka-poeni', naziv: 'Кошаркашки поени', tip: 'sport',
      podrzava: () => true,
      generisi(d, nivo, rnd) {
        const a = ceo(rnd, 2, 3 + 2 * nivo), b = ceo(rnd, 1, 1 + 2 * nivo);
        const ukupno = 2 * a + 3 * b + d;
        return { tekst: `Кошаркаш је постигао укупно ${ukupno} поена. Погођене двојке: ${a}. Погођене тројке: ${b}. Остатак су слободна бацања. Колико слободних бацања је погодио?`,
          objasnjenje: `${ukupno} − ${2 * a} − ${3 * b} = ${d}`, nagovestaji: ['Двојка = 2, тројка = 3, слободно бацање = 1 поен.'] };
      }
    },
    {
      id: 'pravougaonik', naziv: 'Површина и обим', tip: 'prostorno',
      podrzava: d => d >= 1,
      generisi(d, nivo, rnd) {
        const a = ceo(rnd, 2, 9);
        if (nivo === 1) return { tekst: `Правоугаона зона на терену има површину ${a * d} м², а једна страница је ${a} м. Колика је друга страница (у метрима)?`,
          objasnjenje: `${a * d} : ${a} = ${d} м`, nagovestaji: ['P = a · b'] };
        if (nivo === 2) return { tekst: `Правоугаона зона има обим ${2 * (a + d)} м, а једна страница је ${a} м. Колика је друга страница?`,
          objasnjenje: `${2 * (a + d)} : 2 − ${a} = ${d} м`, nagovestaji: ['O = 2 · (a + b)'] };
        return { tekst: `Квадрат од чуњева има површину ${d * d} м². Колика му је страница у метрима?`,
          objasnjenje: `√${d * d} = ${d} м`, nagovestaji: ['Који број помножен самим собом даје површину?'] };
      }
    },
    {
      id: 'sat', naziv: 'Сат и време', tip: 'logika',
      podrzava: d => d >= 1,
      generisi(d, nivo, rnd) {
        const n = d + 12 * ceo(rnd, nivo, nivo + 1);
        return { tekst: `Казаљке сата показују тачно 12 сати. Колико ће показивати мала казаљка после ${n} сати? (одговор: број од 1 до 12)`,
          objasnjenje: `${n} = 12·${(n - d) / 12} + ${d} → ${d}`, nagovestaji: ['На сату је после сваких 12 сати исто.'] };
      }
    }
  ];

  // --- Pigpen („masonska“) šifra: znakovi se crtaju kao SVG ------------------
  const PIG_REC = ['NULA', 'JEDAN', 'DVA', 'TRI', 'CETIRI', 'PET', 'SEST', 'SEDAM', 'OSAM', 'DEVET'];
  function pigZnak(l, x, y) {
    const i = l.charCodeAt(0) - 65, L = [], P = (a, b, c, d) => L.push(`M${x + a} ${y + b}L${x + c} ${y + d}`);
    let tacka = null;
    if (i < 18) {                       // A–I mreža, J–R mreža sa tačkom
      const k = i % 9, r = Math.floor(k / 3), c = k % 3;
      if (r > 0) P(3, 3, 21, 3); if (r < 2) P(3, 21, 21, 21);
      if (c > 0) P(3, 3, 3, 21); if (c < 2) P(21, 3, 21, 21);
      if (i >= 9) tacka = [12, 12];
    } else {                            // S–V iks, W–Z iks sa tačkom (gore, levo, desno, dole)
      const k = (i - 18) % 4;
      const oblik = [[3, 3, 12, 15, 21, 3], [3, 3, 15, 12, 3, 21], [21, 3, 9, 12, 21, 21], [3, 21, 12, 9, 21, 21]][k];
      L.push(`M${x + oblik[0]} ${y + oblik[1]}L${x + oblik[2]} ${y + oblik[3]}L${x + oblik[4]} ${y + oblik[5]}`);
      if (i >= 22) tacka = [[12, 7], [7, 12], [17, 12], [12, 17]][k];
    }
    return `<g data-l="${l}"><path d="${L.join('')}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>${
      tacka ? `<circle cx="${x + tacka[0]}" cy="${y + tacka[1]}" r="2.2" fill="currentColor"/>` : ''}</g>`;
  }
  function pigpenSvg(rec) {
    const w = rec.length * 32;
    return `<svg class="pigpen" viewBox="0 0 ${w} 26" width="${w * 1.6}" height="${26 * 1.6}" role="img" aria-label="Pigpen">${
      [...rec].map((l, i) => pigZnak(l, i * 32, 1)).join('')}</svg>`;
  }
  function pigpenKljuc() {
    const slova = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const cell = (l, i) => { const x = (i % 13) * 30, y = Math.floor(i / 13) * 44;
      return pigZnak(l, x + 3, y) + `<text x="${x + 15}" y="${y + 38}" text-anchor="middle" font-size="11" fill="currentColor">${l}</text>`; };
    return `<svg class="pigpen-kljuc" viewBox="0 0 390 88" width="390" height="88" role="img" aria-label="Kljuc">${slova.map(cell).join('')}</svg>`;
  }
  SABLONI.push({
    id: 'pigpen', naziv: 'Пигпен шифра', tip: 'jezik',
    podrzava: (d, nivo) => nivo < 3 || d <= 8,
    generisi(d, nivo) {
      const cilj = nivo === 3 ? d + 1 : d;
      return {
        tekst: `Дешифруј знакове помоћу кључа (латиница, слова без квачица). Добићеш број написан речју.${nivo === 3 ? ' Од тог броја одузми 1.' : ''}`,
        slika: pigpenSvg(PIG_REC[cilj]) + '<br>' + pigpenKljuc(),
        objasnjenje: `${PIG_REC[cilj]}${nivo === 3 ? ` = ${cilj}; ${cilj} − 1` : ''} = ${d}`,
        nagovestaji: ['Облик знака показује положај слова у мрежи; тачка значи другу мрежу.']
      };
    }
  });

  // --- javni API ------------------------------------------------------------
  function nivoZaRazred(razred) { return razred <= 6 ? 1 : razred <= 10 ? 2 : 3; }

  function zavrsi(z, d, pismo, sablon) {
    const T = s => Translit.pismo(s, pismo);
    const tekst = T(z.tekst).replace(/\{(ŠИФРА|ŠIFRA)\}/, z.sifra ?? '');
    return {
      izvor: 'sablon', sablon: sablon.id, tip: sablon.tip, naziv: T(sablon.naziv),
      tekst, odgovor: String(d), cifra: d, slika: z.slika || '',
      objasnjenje: T(z.objasnjenje), nagovestaji: (z.nagovestaji || []).map(T)
    };
  }

  function generisi(sablonId, d, { nivo = 2, pismo = 'cir', seed = Date.now() } = {}) {
    const s = SABLONI.find(x => x.id === sablonId);
    if (!s || !s.podrzava(d, nivo)) return null;
    return zavrsi(s.generisi(d, nivo, mulberry32(seed + d * 7919), pismo), d, pismo, s);
  }

  // Za šifru (npr. "9487") pravi po jedan zadatak za svaku cifru, različitih tipova.
  // banka: niz zadataka iz data/zadaci.json (sa poljem `cifra`), koristi se ako uzrast odgovara.
  function sifra(cifre, { razred = 10, pismo = 'cir', seed = Date.now(), banka = [], udeoBanke = 0.4, tipovi = null } = {}) {
    const rnd = mulberry32(seed);
    const nivo = nivoZaRazred(razred);
    const T = s => Translit.pismo(s, pismo);
    const korisceni = new Set(), koriscenTip = new Set(), koriscenSablon = new Set();
    const sabloni = promesaj(rnd, SABLONI.filter(s => !tipovi || tipovi.includes(s.id)));
    const niz = [...String(cifre)].filter(c => /\d/.test(c)).map(Number);
    // najpre cifre sa najmanje mogućih šablona (npr. 0), da im ostanu slobodni tipovi
    const broj = d => sabloni.filter(s => s.podrzava(d, nivo)).length;
    const redosled = niz.map((d, i) => i).sort((a, b) => broj(niz[a]) - broj(niz[b]) || a - b);
    const rezultat = [];
    for (const i of redosled) rezultat[i] = jedna(niz[i], i);
    return rezultat;

    function jedna(d, i) {
      const izBanke = banka.filter(z => z.cifra === d && !korisceni.has(z.id) && !koriscenTip.has(z.tip)
        && razred >= z.razredi[0] && razred <= z.razredi[1]);
      if (izBanke.length && rnd() < udeoBanke) {
        const z = izaberi(rnd, izBanke);
        korisceni.add(z.id); koriscenTip.add(z.tip);
        return { stanica: i + 1, izvor: 'banka', id: z.id, tip: z.tip, tekst: T(z.tekst), odgovor: T(z.odgovor), cifra: d,
          objasnjenje: T(z.objasnjenje || ''), nagovestaji: (z.nagovestaji || []).map(T) };
      }
      const moguci = sabloni.filter(s => s.podrzava(d, nivo));
      const s = moguci.find(s => !koriscenTip.has(s.tip) && !koriscenSablon.has(s.id))
        || moguci.find(s => !koriscenSablon.has(s.id)) || izaberi(rnd, moguci);
      koriscenTip.add(s.tip); koriscenSablon.add(s.id);
      const seedStanice = Math.floor(rnd() * 1e9);
      return { stanica: i + 1, seed: seedStanice, nivo, ...generisi(s.id, d, { nivo, pismo, seed: seedStanice }) };
    }
  }

  const api = { SABLONI: SABLONI.map(({ id, naziv, tip }) => ({ id, naziv, tip })), generisi, sifra, nivoZaRazred };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.Generator = api;
})(typeof window !== 'undefined' ? window : globalThis);
