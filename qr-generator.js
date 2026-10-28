(() => {
  'use strict';
  const count = 27;
  const input = document.getElementById('base-url');
  const generateButton = document.getElementById('generate');
  const printButton = document.getElementById('print');
  const status = document.getElementById('status');
  const grid = document.getElementById('qr-grid');
  let qrInstances = [];

  function normalizeBase(raw) {
    if (!raw.trim()) throw new Error('Pega primero la dirección pública de tu sitio de GitHub Pages.');
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('Usa una dirección web que empiece por https:// o http://.');
    }
    url.search = '';
    url.hash = '';
    if (/\/(generar-codigos|index)\.html$/i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/(generar-codigos|index)\.html$/i, '');
    }
    if (!url.pathname.endsWith('/')) url.pathname += '/';
    return url.href;
  }

  function makeQr(target, container, number) {
    if (typeof window.QRCodeStyling !== 'function') {
      throw new Error('No se cargó el generador de QR. Comprueba que tienes internet, recarga la página y vuelve a intentarlo.');
    }
    const qr = new window.QRCodeStyling({
      width: 260,
      height: 260,
      type: 'canvas',
      data: target,
      margin: 12,
      qrOptions: { errorCorrectionLevel: 'H', typeNumber: 0 },
      dotsOptions: { color: '#a9475e', type: 'dots' },
      cornersSquareOptions: { color: '#783247', type: 'extra-rounded' },
      cornersDotOptions: { color: '#783247', type: 'dot' },
      backgroundOptions: { color: '#ffffff' }
    });
    qr.append(container);
    qrInstances[number] = qr;
    return qr;
  }

  function makeCards(base) {
    grid.replaceChildren();
    qrInstances = [];
    const cards = [];
    for (let number = 1; number <= count; number += 1) {
      const page = `razon-${String(number).padStart(2, '0')}.html`;
      const target = new URL(page, base).href;
      const card = document.createElement('article');
      card.className = 'qr-card';
      const heading = document.createElement('h3');
      heading.textContent = `Razón ${String(number).padStart(2, '0')} ♡`;
      const qr = document.createElement('div');
      qr.className = 'qr-code';
      const anchor = document.createElement('a');
      anchor.href = target;
      anchor.textContent = target;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      const button = document.createElement('button');
      button.className = 'btn secondary';
      button.type = 'button';
      button.textContent = 'Descargar QR PNG';
      button.addEventListener('click', () => {
        const instance = qrInstances[number];
        if (!instance) {
          status.textContent = 'Este QR aún no está listo. Vuelve a generarlo.';
          return;
        }
        instance.download({ name: `QR-Habibi-${String(number).padStart(2, '0')}`, extension: 'png' });
      });
      card.append(heading, qr, anchor, document.createElement('br'), button);
      grid.appendChild(card);
      cards.push({ target, qr, number });
    }
    // Build QR images only after all cards are attached to the document.
    cards.forEach(({ target, qr, number }) => makeQr(target, qr, number));
    printButton.disabled = false;
    status.textContent = '¡Listo! Se crearon 27 QR con puntos redondos y esquinas suaves. Prueba varios con la cámara antes de imprimir.';
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
