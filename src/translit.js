// Transliteracija srpskog: ćirilica ↔ latinica.
// Sadržaj se čuva na ćirilici; latinica se prikazuje automatski.
(function (global) {
  const CYR = {
    а:'a',б:'b',в:'v',г:'g',д:'d',ђ:'đ',е:'e',ж:'ž',з:'z',и:'i',ј:'j',к:'k',л:'l',љ:'lj',м:'m',
    н:'n',њ:'nj',о:'o',п:'p',р:'r',с:'s',т:'t',ћ:'ć',у:'u',ф:'f',х:'h',ц:'c',ч:'č',џ:'dž',ш:'š'
  };

  function caseLike(src, out) {
    if (src === src.toLowerCase()) return out;
    return out.charAt(0).toUpperCase() + out.slice(1);
  }

  // Ćirilica → latinica. Digrafi (Љ, Њ, Џ) u reči pisanoj VELIKIM slovima postaju LJ, NJ, DŽ.
  function uLatinicu(text) {
    if (!text) return text;
    return String(text).replace(/[Ѐ-ӿ]+/g, word => {
      const allCaps = word.length > 1 && word === word.toUpperCase();
      let out = '';
      for (const ch of word) {
        const lat = CYR[ch.toLowerCase()];
        if (lat === undefined) { out += ch; continue; }
        out += allCaps ? lat.toUpperCase() : caseLike(ch, lat);
      }
      return out;
    });
  }

  // Latinica → ćirilica (za tekst koji profesor unese latinicom).
  const LAT = Object.fromEntries(Object.entries(CYR).map(([c, l]) => [l, c]));
  const LAT_RE = /dž|lj|nj|[a-zčćđšž]/gi;
  function uCirilicu(text) {
    if (!text) return text;
    return String(text).replace(LAT_RE, m => {
      const c = LAT[m.toLowerCase()];
      if (!c) return m;
      if (m === m.toUpperCase()) return c.toUpperCase();
      if (m[0] === m[0].toUpperCase()) return c.toUpperCase();
      return c;
    });
  }

  // Prikaz u izabranom pismu: 'cir' ili 'lat'.
  function pismo(text, izbor) {
    return izbor === 'lat' ? uLatinicu(text) : text;
  }

  const api = { uLatinicu, uCirilicu, pismo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.Translit = api;
})(typeof window !== 'undefined' ? window : globalThis);
