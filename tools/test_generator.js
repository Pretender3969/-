// Proverava da svaki šablon za svaku cifru, nivo i pismo daje zadatak čiji je odgovor tačan.
// Upotreba: node tools/test_generator.js
const T = require('../src/translit.js');
globalThis.Translit = T;
const G = require('../src/generator.js');

const BROJEVI = ['НУЛА', 'ЈЕДАН', 'ДВА', 'ТРИ', 'ЧЕТИРИ', 'ПЕТ', 'ШЕСТ', 'СЕДАМ', 'ОСАМ', 'ДЕВЕТ'];
const AZ = 'А Б В Г Д Ђ Е Ж З И Ј К Л Љ М Н Њ О П Р С Т Ћ У Ф Х Ц Ч Џ Ш'.split(' ');
const AB = 'A B C Č Ć D DŽ Đ E F G H I J K L LJ M N NJ O P R S Š T U V Z Ž'.split(' ');
const rim = s => { const v = { I: 1, V: 5, X: 10, L: 50 }; let n = 0;
  for (let i = 0; i < s.length; i++) n += v[s[i]] < (v[s[i + 1]] || 0) ? -v[s[i]] : v[s[i]]; return n; };
const brojevi = t => (t.match(/\d+(,\d+)?/g) || []).map(x => +x.replace(',', '.'));

// nezavisno rešavanje iz teksta zadatka
const resi = {
  jednacina(z, nivo) {
    const n = brojevi(z.tekst);
    if (nivo === 1) return n[1] - n[0];
    if (nivo === 2) return (n[2] - n[1]) / n[0];
    return n[2] / n[0] - n[1];
  },
  brzina(z, nivo) {
    const n = brojevi(z.tekst);
    if (nivo === 1) return n[0] / n[1];
    if (nivo === 2) return Math.round(n[0] / 3.6 * 1000) / 1000;
    return 2 * n[1] / n[0] ** 2;
  },
  niz(z, nivo) {
    const n = brojevi(z.tekst);
    if (nivo === 1) return n[0] - (n[1] - n[0]);
    if (nivo === 2) return n[0] / (n[1] / n[0]);
    return n[0] - 1;
  },
  procenat(z, nivo) { const n = brojevi(z.tekst); return nivo === 1 ? n[0] / 2 : n[0] * n[1] / 100; },
  cezar(z, nivo, pismo) {
    const az = pismo === 'lat' ? AB : AZ;
    const red = z.tekst.split('\n')[1];
    const sl = red.split(' ');
    const rec = sl.map(s => az[(az.indexOf(s) - nivo + az.length) % az.length]).join('');
    const cir = pismo === 'lat' ? T.uCirilicu(rec) : rec;
    return BROJEVI.indexOf(cir);
  },
  anagram(z, nivo, pismo) {
    const deo = z.tekst.match(/: (.+?)\./)[1].split(' ').sort().join('');
    const n = BROJEVI.findIndex(b => [...(pismo === 'lat' ? T.uLatinicu(b).match(/DŽ|LJ|NJ|./g) : b)].sort().join('') === deo);
    return nivo === 3 ? n - 1 : n;
  },
  rimski(z) { const izraz = z.tekst.match(/(?:: )([IVXL]+(?: [+−] [IVXL]+)*)/)[1];
    return izraz.split(' ').reduce((acc, tok, i, a) => i === 0 ? rim(tok) : (tok === '+' || tok === '−') ? acc : (a[i - 1] === '+' ? acc + rim(tok) : acc - rim(tok)), 0); },
  binarni(z) { return (z.tekst.match(/[01]{4}/g)).reduce((s, b) => s + parseInt(b, 2), 0); },
  'kosarka-poeni'(z) { const n = brojevi(z.tekst); return n[0] - 2 * n[1] - 3 * n[2]; },
  pravougaonik(z, nivo) { const n = brojevi(z.tekst);
    if (nivo === 1) return n[0] / n[1]; if (nivo === 2) return n[0] / 2 - n[1]; return Math.sqrt(n[0]); },
  sat(z) { const n = brojevi(z.tekst); return n[1] % 12; },
  pigpen(z, nivo) {
    const rec = [...z.slika.split('<br>')[0].matchAll(/data-l="(\w)"/g)].map(m => m[1]).join('');
    const n = ['NULA', 'JEDAN', 'DVA', 'TRI', 'CETIRI', 'PET', 'SEST', 'SEDAM', 'OSAM', 'DEVET'].indexOf(rec);
    return nivo === 3 ? n - 1 : n;
  }
};

let ok = 0, lose = 0, preskoceno = 0;
for (const s of G.SABLONI) for (const pismo of ['cir', 'lat']) for (const nivo of [1, 2, 3]) for (let d = 0; d <= 9; d++) for (const seed of [1, 2, 3]) {
  const z = G.generisi(s.id, d, { nivo, pismo, seed });
  if (!z) { preskoceno++; continue; }
  const r = resi[s.id](z, nivo, pismo);
  if (Math.abs(r - d) < 1e-9 && /[^{}]/.test(z.tekst) && !/\{/.test(z.tekst)) ok++;
  else { lose++; if (lose < 10) console.log('GREŠKA', s.id, pismo, nivo, d, '→', r, '\n ', z.tekst); }
}
console.log(`ispravno: ${ok}, pogrešno: ${lose}, nije podržano (cifra/nivo): ${preskoceno}`);

// šifra: 4 cifre, različiti tipovi
const sif = G.sifra('9487', { razred: 10, seed: 42 });
console.log(sif.map(z => `${z.stanica}. [${z.sablon || z.id}] ${z.tekst.split('\n')[0]} → ${z.odgovor}`).join('\n'));
process.exit(lose ? 1 : 0);
