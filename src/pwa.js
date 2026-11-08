// Zajedničko za sve stranice: registracija service workera i trajno čuvanje podataka.
(function () {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
    // traži od pregledača da ne briše sačuvane časove kad ponestane prostora
    try { navigator.storage?.persist?.(); } catch (e) {}
  });
})();
