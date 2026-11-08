// Service worker: cela aplikacija radi bez interneta.
// Strategija: odmah iz keša, a u pozadini se proverava nova verzija (stale-while-revalidate).
// Kada se doda NOV fajl u listu, povećati VERZIJA.
const VERZIJA = 'pokreni-um-v1';
const FAJLOVI = [
  './', 'index.html', 'cas.html', 'uzivo.html', 'katalog.html', 'zadaci.html',
  'manifest.webmanifest',
  'src/translit.js', 'src/generator.js', 'src/price.js', 'src/pwa.js',
  'data/katalog-data.js', 'data/zadaci-data.js', 'data/igre-data.js',
  'ikone/ikona.svg', 'ikone/ikona-192.png', 'ikone/ikona-512.png', 'ikone/ikona-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERZIJA).then(c => c.addAll(FAJLOVI)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(kljucevi => Promise.all(kljucevi.filter(k => k !== VERZIJA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERZIJA).then(async cache => {
    // ?id=... ne sme da promaši keš (uzivo.html?id=c123 → uzivo.html)
    const izKesa = await cache.match(req, { ignoreSearch: true });
    const saMreze = fetch(req).then(res => {
      if (res.ok) cache.put(req.url.split('?')[0], res.clone());
      return res;
    }).catch(() => null);
    if (izKesa) { e.waitUntil(saMreze); return izKesa; }
    return (await saMreze) || new Response('Нема интернета, а ова страница још није сачувана.', {
      status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
