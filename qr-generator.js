(() => {
  const count = 27;
  const input = document.getElementById('base-url');
  const generateButton = document.getElementById('generate');
  const printButton = document.getElementById('print');
  const status = document.getElementById('status');
  const grid = document.getElementById('qr-grid');
  const remoteQrEndpoint = 'https://api.qrserver.com/v1/create-qr-code/';
  let remoteTotal = 0;
  let remoteLoaded = 0;
  let remoteFailed = 0;

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

  function updateRemoteStatus() {
    if (remoteFailed > 0) {
      status.textContent = `Se prepararon los enlaces, pero ${remoteFailed} imagen(es) QR no cargaron. Comprueba que tienes conexión a internet y vuelve a generarlos.`;
    } else if (remoteTotal > 0 && remoteLoaded === remoteTotal) {
      status.textContent = `¡Listo! Se cargaron los 27 códigos QR. Prueba los enlaces antes de imprimir.`;
    }
  }

  function makeRemoteQr(container, target, number) {
    remoteTotal += 1;
    const img = document.createElement('img');
    img.alt = `Código QR ${String(number).padStart(2, '0')}`;
    img.width = 180;
    img.height = 180;
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      remoteLoaded += 1;
      updateRemoteStatus();
    };
    img.onerror = () => {
      remoteFailed += 1;
      const error = document.createElement('p');
      error.className = 'smallnote';
      error.textContent = 'No se pudo cargar este QR. Revisa tu conexión y vuelve a pulsar Crear los 27 QR.';
      container.replaceChildren(error);
      updateRemoteStatus();
    };
    img.src = `${remoteQrEndpoint}?size=180x180&format=png&data=${encodeURIComponent(target)}`;
    container.replaceChildren(img);
  }

  function downloadQr(card, number) {
    const img = card.querySelector('.qr-code img');
    const canvas = card.querySelector('.qr-code canvas');
    let data = '';
    try {
      if (img?.src?.startsWith('data:')) data = img.src;
      if (!data && canvas) data = canvas.toDataURL('image/png');
    } catch (_) {
      data = '';
    }
    if (data) {
      const link = document.createElement('a');
      link.href = data;
      link.download = `QR-Habibi-${String(number).padStart(2, '0')}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }
    if (img?.src && img.complete && img.naturalWidth > 0) {
      window.open(img.src, '_blank', 'noopener');
      status.textContent = `Se abrió la imagen del QR ${String(number).padStart(2, '0')} en otra pestaña. Si necesitas guardarla, haz clic derecho en la imagen y elige “Guardar imagen como…”.`;
      return;
    }
    status.textContent = 'Este QR todavía no está listo. Espera a que cargue y vuelve a intentarlo.';
  }

  function makeCards(base) {
    grid.replaceChildren();
    remoteTotal = 0;
    remoteLoaded = 0;
    remoteFailed = 0;
    let usingLocalLibrary = typeof window.QRCode !== 'undefined';

    for (let number = 1; number <= count; number += 1) {
      const page = `razon-${String(number).padStart(2, '0')}.html`;
      const target = new URL(page, base).href;
      const card = document.createElement('article');
      card.className = 'qr-card';
      const heading = document.createElement('h3');
      heading.textContent = `Razón ${String(number).padStart(2, '0')} ♡`;
      const qr = document.createElement('div');
      qr.className = 'qr-code';
      if (usingLocalLibrary) {
        try {
          new window.QRCode(qr, {
            text: target,
            width: 180,
            height: 180,
            correctLevel: window.QRCode.CorrectLevel.H
          });
        } catch (_) {
          usingLocalLibrary = false;
          makeRemoteQr(qr, target, number);
        }
      } else {
        makeRemoteQr(qr, target, number);
      }
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
    if (remoteTotal > 0) {
      status.textContent = 'La librería QR no se cargó; se están preparando los códigos con el método alternativo. Espera a que aparezcan las imágenes.';
      updateRemoteStatus();
    } else {
      status.textContent = '¡Listo! Se crearon 27 códigos únicos. Prueba los enlaces antes de imprimir.';
    }
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
