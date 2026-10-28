(() => {
  const count = 27;
  const input = document.getElementById('base-url');
  const generateButton = document.getElementById('generate');
  const printButton = document.getElementById('print');
  const status = document.getElementById('status');
  const grid = document.getElementById('qr-grid');

  function normalizeBase(raw) {
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('Usa una dirección web que empiece por https:// o http://.');
    }
    url.search = '';
    url.hash = '';
    if (!url.pathname.endsWith('/')) url.pathname += '/';
    return url.href;
  }

  function downloadQr(card, number) {
    const img = card.querySelector('.qr-code img');
    const canvas = card.querySelector('.qr-code canvas');
    const data = img?.src || canvas?.toDataURL('image/png');
    if (!data) {
      status.textContent = 'No se encontró la imagen del QR. Vuelve a generarlos con conexión a internet.';
      return;
    }
    const link = document.createElement('a');
    link.href = data;
    link.download = `QR-Habibi-${String(number).padStart(2, '0')}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function makeCards(base) {
    if (typeof QRCode === 'undefined') {
      throw new Error('No se cargó la librería de QR. Comprueba tu conexión a internet y recarga la página.');
    }
    grid.replaceChildren();
    for (let number = 1; number <= count; number += 1) {
      const page = `razon-${String(number).padStart(2, '0')}.html`;
      const target = new URL(page, base).href;
      const card = document.createElement('article');
      card.className = 'qr-card';
      const heading = document.createElement('h3');
      heading.textContent = `Razón ${String(number).padStart(2, '0')} ♡`;
      const qr = document.createElement('div');
      qr.className = 'qr-code';
      new QRCode(qr, { text: target, width: 180, height: 180, correctLevel: QRCode.CorrectLevel.H });
      const anchor = document.createElement('a');
      anchor.href = target;
      anchor.textContent = target;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      const button = document.createElement('button');
      button.className = 'btn secondary';
      button.type = 'button';
      button.textContent = 'Descargar QR PNG';
      button.addEventListener('click', () => downloadQr(card, number));
      card.append(heading, qr, anchor, document.createElement('br'), button);
      grid.appendChild(card);
    }
    printButton.disabled = false;
    status.textContent = '¡Listo! Se crearon 27 códigos únicos. Prueba los enlaces antes de imprimir.';
  }

  generateButton.addEventListener('click', () => {
    try {
      makeCards(normalizeBase(input.value));
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'No pudimos generar los códigos. Revisa la dirección e inténtalo de nuevo.';
      printButton.disabled = true;
    }
  });
  printButton.addEventListener('click', () => window.print());
})();
