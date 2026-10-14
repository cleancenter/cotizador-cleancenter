/* ============================================================
   Cotizador Clean Center · lógica
   La configuración se puede sobrescribir desde Webflow (o desde el HTML) con:
     <script>window.CC_CONFIG = { NOTIFY_EMAIL: '...', WEBHOOK_URL: '...' };</script>
   puesto ANTES de cargar este archivo. Así los datos sensibles no viven en el repositorio.
   ============================================================ */
(function () {
  'use strict';

  var SCRIPT = document.currentScript || document.querySelector('script[src*="cotizador"]');
  var BASE = '';
  try { if (SCRIPT && SCRIPT.src) BASE = new URL('./', SCRIPT.src).href; } catch (e) {}

  /* ---------------- CONFIGURACIÓN ---------------- */
  var CONFIG = {
    // Correo que recibe cada cotización (vía FormSubmit.co). La primera solicitud dispara un
    // correo de activación a esa dirección: hay que dar clic en el enlace.
    // Tip: después de activar, FormSubmit da un "alias" aleatorio; puedes ponerlo aquí
    // en lugar del correo para que la dirección no quede visible en el código.
    NOTIFY_EMAIL: '',
    EMAIL_SUBJECT: 'Nueva cotización Clean Center',
    COPY_TO_CLIENT: false,           // true = el prospecto recibe copia en su correo

    // Fase 2 (Pipedrive): webhook de Make / Zapier / n8n. Vacío = no se envía.
    WEBHOOK_URL: '',

    SHOW_HEADER_FOOTER: true,        // false si el sitio (Webflow) ya tiene su propio menú y pie
    LOAD_FONTS: true,                // false si el sitio ya carga Lato y Montserrat

    // Archivos de imagen/video. Por defecto salen de la carpeta "assets" junto a este archivo.
    ASSETS: BASE ? { logo: BASE + 'assets/logo.png', logoWhite: BASE + 'assets/logo-blanco.png', video: BASE + 'assets/hero.mp4', poster: BASE + 'assets/poster.jpg' } : { logo: '', logoWhite: '', video: '', poster: '' },

    LOGOS: [],                       // ['https://.../cliente1.png', ...]  (vacío = no se muestra)
    IMAGES: {}                       // fotos por categoría: { aspiradoras: 'https://.../foto.jpg', ... }
  };
  var USER = window.CC_CONFIG || {};
  Object.keys(USER).forEach(function (k) {
    if ((k === 'ASSETS' || k === 'IMAGES') && USER[k]) { for (var j in USER[k]) CONFIG[k][j] = USER[k][j]; }
    else CONFIG[k] = USER[k];
  });

  /* ---------------- DATOS ---------------- */
  var CATS = [
    { id: 'aspiradoras', name: 'Aspiradoras', ic: 'vac', desc: 'Para polvo y líquidos, en uso ligero o industrial.', subs: ['Verticales', 'Húmedo / seco', 'Canasta', 'Mochila', 'Hombre atrás', 'Hombre a bordo'] },
    { id: 'lava', name: 'Lava Alfombras', ic: 'rug', desc: 'Extracción y lavado profundo de alfombras y tapicería.', subs: ['Desmanchado', 'Encapsulado', 'Extractor mediano', 'Extractor grande', 'Hombre atrás', 'Hombre a bordo'] },
    { id: 'restregadoras', name: 'Restregadoras', ic: 'scrub', desc: 'Lavan y secan pisos duros en una sola pasada.', subs: ['Vertical', 'Áreas reducidas', 'Hombre a bordo', 'Hombre atrás', 'Industriales'] },
    { id: 'rotativos', name: 'Rotativos', ic: 'rot', desc: 'Pulido, abrillantado y mantenimiento de pisos.', subs: ['Pulidoras', 'Burnisher', 'Orbitales'] },
    { id: 'barredoras', name: 'Barredoras', ic: 'sweep', desc: 'Barrido de áreas amplias, interiores y exteriores.', subs: ['Mecánicas', 'Hombre atrás', 'Hombre a bordo', 'Industriales'] },
    { id: 'control', name: 'Control', ic: 'ctrl', desc: 'Equipos de control para tu operación de limpieza.', subs: ['Ctrl. de Humedad', 'Ctrl. de Olores', 'Ctrl. de Chicles'] }
  ];
  var BEN = [
    ['equip', 'Equipos', 'Para cada superficie'], ['prod', 'Productos', 'Para cada limpieza'],
    ['acc', 'Accesorios', 'Complementa tu equipo'], ['refac', 'Refacciones', 'Mantén tu operación'],
    ['shield', 'Garantías', 'Respaldo en tu compra'], ['wrench', 'Servicio técnico', 'Mantenimiento y reparación'],
    ['headset', 'Post venta', 'Seguimiento después de tu compra'], ['chat', 'Asesoría', 'Te ayudamos a elegir'],
    ['grad', 'Capacitación', 'Para tu personal'], ['monitor', 'Capacitación virtual', 'Aprende a distancia']
  ];
  var IC = {
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    equip: '<path d="M6 3l3 9"/><rect x="4" y="12" width="15" height="5" rx="2"/><circle cx="8" cy="19.5" r="1.5"/><circle cx="16" cy="19.5" r="1.5"/>',
    prod: '<path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z"/><path d="M9 14h6"/>',
    acc: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>',
    refac: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22"/>',
    headset: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9 11h6M9 14h4"/>',
    grad: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="m10.5 8.2 4 2-4 2z"/>',
    vac: '<rect x="4" y="9" width="12" height="8" rx="3"/><path d="M16 12c3 0 4-2 4-7"/><circle cx="8" cy="19.5" r="1.5"/><circle cx="14" cy="19.5" r="1.5"/>',
    rug: '<rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M12 3s3.2 3.3 3.2 5.4a3.2 3.2 0 0 1-6.4 0C8.8 6.3 12 3 12 3z"/>',
    scrub: '<path d="M6 3l3 9"/><rect x="4" y="12" width="15" height="5" rx="2"/><circle cx="8" cy="19.5" r="1.5"/><circle cx="16" cy="19.5" r="1.5"/>',
    rot: '<circle cx="12" cy="12" r="3"/><path d="M20 12a8 8 0 0 0-14-5.3M4 12a8 8 0 0 0 14 5.3"/><path d="M6 3v4h4M18 21v-4h-4"/>',
    sweep: '<path d="M15 3l-4 9"/><path d="M6 12h11l2 8H4z"/><path d="M9 16l-.8 4M12 16v4M15 16l.8 4"/>',
    ctrl: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'
  };
  function svg(k, s) {
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[k] + '</svg>';
  }

  /* ---------------- helpers ---------------- */
  var TPL = "<div id=\"cc-app\"> <header class=\"cc-hdr\" id=\"cc-hdr\" data-chrome> <a href=\"#cc-top\" aria-label=\"Clean Center\"><img id=\"cc-logo\" alt=\"Clean Center\"></a> <nav> <a class=\"cc-lnk cc-hide-sm\" href=\"#cc-solucion\">Somos</a> <a class=\"cc-lnk\" href=\"#cc-catalogo\">Equipos</a> <a class=\"cc-btn cc-btn-o cc-sm\" href=\"#cc-cotizar\">Cotizar <span id=\"cc-hcount\"></span></a> </nav> </header> <section class=\"cc-hero\" id=\"cc-top\"> <div class=\"cc-wrap cc-hgrid\"> <div> <span class=\"cc-pill\">Equipos · Catálogo 2026</span> <h1>El equipo <em>correcto</em> para tu limpieza</h1> <p class=\"cc-sub\">Elige los equipos que necesitas, déjanos tus datos y te enviamos tu cotización.</p> <div class=\"cc-cta\"> <a class=\"cc-btn cc-btn-o\" href=\"#cc-catalogo\">Elegir equipos <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></a> <a class=\"cc-btn cc-btn-g\" href=\"#cc-solucion\">Conoce la Solución 360</a> </div> <div class=\"cc-stats\"> <div><b>30</b><span>años en el mercado</span></div> <div><b>6</b><span>categorías de equipos</span></div> <div><b>360°</b><span>solución total de limpieza</span></div> </div> </div> <div class=\"cc-media\"> <div class=\"cc-vframe\"><video id=\"cc-video\" autoplay muted loop playsinline preload=\"metadata\"></video></div> <div class=\"cc-chip-f cc-chip-a\"><i data-ic=\"wrench\" data-s=\"20\"></i><div>Servicio técnico<small>y refacciones</small></div></div> <div class=\"cc-chip-f cc-chip-b\"><i data-ic=\"shield\" data-s=\"20\"></i><div>Garantía<small>en tu equipo</small></div></div> </div> </div> </section> <div class=\"cc-steps cc-rv\"> <ol> <li><i>1</i><div><b>Elige tus equipos</b><span>Una o varias categorías</span></div></li> <li><i>2</i><div><b>Déjanos tus datos</b><span>Nombre, correo y teléfono</span></div></li> <li><i>3</i><div><b>Recibe tu cotización</b><span>Un asesor te contacta</span></div></li> </ol> </div> <section class=\"cc-sec cc-s360\" id=\"cc-solucion\"> <div class=\"cc-wrap\"> <div class=\"cc-s360h cc-rv\"> <div> <span class=\"cc-pill\">Solución 360</span> <h2 class=\"cc-h2\">Mi solución <em>total</em> de limpieza</h2> </div> <div> <p>Un solo proveedor para todo el ciclo de limpieza. Además de equipos, te acompañamos con productos, accesorios, refacciones, garantías, servicio técnico, post venta, asesoría y capacitación. Tú eliges el equipo; nosotros respaldamos tu operación.</p> <a class=\"cc-btn cc-btn-b\" href=\"#cc-catalogo\">Ver equipos</a> </div> </div> <ul class=\"cc-360\" id=\"cc-360\"></ul> <div class=\"cc-logos\" id=\"cc-logos\" hidden></div> </div> </section> <section class=\"cc-sec cc-cat\" id=\"cc-catalogo\"> <div class=\"cc-wrap\"> <span class=\"cc-pill cc-pill-b\">Paso 1</span> <h2 class=\"cc-h2\">Selecciona tus equipos</h2> <p class=\"cc-lead\">Marca uno o varios equipos de cualquier categoría. Puedes combinar los que necesites.</p> <div class=\"cc-cards\" id=\"cc-cards\"></div> </div> </section> <section class=\"cc-sec cc-quote\" id=\"cc-cotizar\"> <div class=\"cc-wrap\"> <span class=\"cc-pill cc-pill-b\">Paso 2</span> <h2 class=\"cc-h2\">Solicita tu cotización</h2> <div class=\"cc-qgrid\"> <aside class=\"cc-sum\" aria-live=\"polite\"> <div class=\"cc-sum-h\"><b>Tu selección</b><span id=\"cc-scount\">0 equipos</span></div> <div class=\"cc-empty\" id=\"cc-empty\"> <svg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 6h15l-1.6 8.2a2 2 0 01-2 1.6H8.6a2 2 0 01-2-1.6L4.4 3H2\"/><circle cx=\"9\" cy=\"20\" r=\"1.4\"/><circle cx=\"18\" cy=\"20\" r=\"1.4\"/></svg> Aún no has elegido equipos.<br><a href=\"#cc-catalogo\">Volver al catálogo</a> </div> <div class=\"cc-sl\" id=\"cc-sl\"></div> </aside> <div class=\"cc-fc\"> <div class=\"cc-ok\" id=\"cc-ok\" hidden tabindex=\"-1\"> <div class=\"cc-tick\"><svg width=\"42\" height=\"42\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"/></svg></div> <h3 id=\"cc-okname\"></h3> <p>Recibimos tu solicitud. Un asesor te contactará con tu cotización.</p> <span class=\"cc-folio\" id=\"cc-okfolio\"></span> <ul class=\"cc-ol\" id=\"cc-ol\"></ul> <button type=\"button\" class=\"cc-btn\" id=\"cc-reset\">Nueva cotización</button> </div> <form class=\"cc-form\" id=\"cc-form\" novalidate> <h3>Tus datos de contacto</h3> <label>Nombre <input name=\"nombre\" autocomplete=\"name\" placeholder=\"Tu nombre completo\"></label> <label>Empresa <input name=\"empresa\" autocomplete=\"organization\" placeholder=\"Nombre de tu empresa\"></label> <div class=\"cc-r2\"> <label>Correo <input name=\"correo\" type=\"email\" autocomplete=\"email\" placeholder=\"correo@empresa.com\"></label> <label>Teléfono <input name=\"telefono\" type=\"tel\" autocomplete=\"tel\" placeholder=\"55 0000 0000\"></label> </div> <label>Comentarios (opcional) <textarea name=\"mensaje\" rows=\"3\" placeholder=\"Cantidad, superficie a limpiar, uso…\"></textarea></label> <div class=\"cc-hp\" aria-hidden=\"true\"><label>No llenar <input name=\"website\" tabindex=\"-1\" autocomplete=\"off\"></label></div> <input type=\"hidden\" name=\"resumen\" id=\"cc-fres\"> <input type=\"hidden\" name=\"folio\" id=\"cc-ffol\"> <div class=\"cc-err\" id=\"cc-err\" role=\"alert\"></div> <button type=\"submit\" class=\"cc-btn cc-btn-o\" id=\"cc-submit\">Solicitar cotización <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></button> </form> </div> </div> </div> </section> <footer class=\"cc-foot\" id=\"cc-foot\" data-chrome> <div class=\"cc-wrap\"> <img id=\"cc-logow\" alt=\"Clean Center\"> <a href=\"https://www.cleancenter.com.mx\" rel=\"noopener\">WWW.CLEANCENTER.COM.MX</a> </div> </footer> <div class=\"cc-bar\" id=\"cc-bar\" hidden> <span id=\"cc-bartext\"></span> <a class=\"cc-btn cc-btn-o\" href=\"#cc-cotizar\">Cotizar</a> </div> </div>";
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, props, kids) {
    var e = document.createElement(tag), k;
    for (k in (props || {})) { if (k === 'class') e.className = props[k]; else if (k === 'text') e.textContent = props[k]; else e.setAttribute(k, props[k]); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function push(o) { (window.dataLayer = window.dataLayer || []).push(o); }
  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  /* ---------------- estado ---------------- */
  var sel = {}, sent = false, refs = {}, app, form, errBox, submitBtn;

  function selected() {
    return CATS.filter(function (c) { return sel[c.id] && sel[c.id].length; })
      .map(function (c) { return { id: c.id, name: c.name, subs: sel[c.id].slice() }; });
  }
  function count() { return selected().reduce(function (t, c) { return t + c.subs.length; }, 0); }
  function toggleSub(cat, label) {
    var cur = sel[cat.id] || [], on = cur.indexOf(label) > -1;
    var nx = on ? cur.filter(function (x) { return x !== label; }) : cur.concat(label);
    nx.sort(function (a, b) { return cat.subs.indexOf(a) - cat.subs.indexOf(b); });
    if (nx.length) sel[cat.id] = nx; else delete sel[cat.id];
    if (!on) push({ event: 'cotizacion_equipo_agregado', categoria: cat.name, subtipo: label });
    update();
  }
  function summaryText(folio, f) {
    var L = [folio ? 'COTIZACIÓN ' + folio : 'COTIZACIÓN'];
    if (f) {
      L.push('Fecha: ' + new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' }));
      L.push('Cliente: ' + f.nombre + (f.empresa ? ' · ' + f.empresa : ''));
      L.push('Correo: ' + f.correo + ' · Tel: ' + f.telefono);
      if (f.mensaje) L.push('Comentarios: ' + f.mensaje);
    }
    L.push('', 'Equipos solicitados (' + count() + '):');
    selected().forEach(function (c) { L.push('• ' + c.name + ': ' + c.subs.join(', ')); });
    return L.join('\n');
  }

  /* ---------------- construcción ---------------- */
  function reveal(node) { node.classList.add('cc-rv'); }

  function buildBenefits() {
    var ul = $('cc-360');
    BEN.forEach(function (b) {
      var li = el('li'); reveal(li);
      li.innerHTML = '<i>' + svg(b[0], 24) + '</i><b>' + b[1] + '</b><span>' + b[2] + '</span>';
      ul.appendChild(li);
    });
  }

  function buildCatalog() {
    var host = $('cc-cards');
    CATS.forEach(function (cat, i) {
      var r = { subs: {} }, photo = CONFIG.IMAGES[cat.id];
      var head = el('div', { 'class': 'cc-ch' + (photo ? ' ph' : '') });
      if (photo) head.appendChild(el('img', { src: photo, alt: cat.name, loading: 'lazy' }));
      var ico = el('div', { 'class': 'cc-ico' }); ico.innerHTML = svg(cat.ic, 34);
      r.badge = el('span', { 'class': 'cc-bdg' });
      head.appendChild(ico); head.appendChild(el('span', { 'class': 'cc-num', text: ('0' + (i + 1)).slice(-2) })); head.appendChild(r.badge);

      var chips = el('div', { 'class': 'cc-chips' });
      cat.subs.forEach(function (label) {
        var mark = el('i', { 'aria-hidden': 'true', text: '+' });
        var b = el('button', { type: 'button', 'class': 'cc-chip', 'aria-pressed': 'false' }, [mark, label]);
        b.addEventListener('click', function () { toggleSub(cat, label); });
        r.subs[label] = { b: b, mark: mark };
        chips.appendChild(b);
      });
      r.card = el('article', { 'class': 'cc-card' }, [head,
        el('div', { 'class': 'cc-cb' }, [el('h3', { text: cat.name }), el('p', { text: cat.desc }), chips])]);
      reveal(r.card);
      refs[cat.id] = r; host.appendChild(r.card);
    });
  }

  function update() {
    var n = count(), sl = selected();
    CATS.forEach(function (cat) {
      var r = refs[cat.id], k = (sel[cat.id] || []).length;
      r.card.classList.toggle('on', k > 0);
      r.badge.textContent = '✓ ' + k + (k === 1 ? ' elegido' : ' elegidos');
      cat.subs.forEach(function (label) {
        var on = (sel[cat.id] || []).indexOf(label) > -1, s = r.subs[label];
        s.b.classList.toggle('on', on); s.b.setAttribute('aria-pressed', on ? 'true' : 'false'); s.mark.textContent = on ? '✓' : '+';
      });
    });
    $('cc-hcount').textContent = n ? '(' + n + ')' : '';
    $('cc-scount').textContent = n + (n === 1 ? ' equipo' : ' equipos');
    $('cc-bartext').textContent = n + (n === 1 ? ' equipo seleccionado' : ' equipos seleccionados');
    $('cc-empty').hidden = n > 0;
    var list = $('cc-sl'); list.innerHTML = '';
    sl.forEach(function (c) {
      var rm = el('button', { type: 'button', 'aria-label': 'Quitar ' + c.name, text: '×' });
      rm.addEventListener('click', function () { delete sel[c.id]; update(); });
      list.appendChild(el('div', { 'class': 'cc-sr' }, [el('div', null, [el('b', { text: c.name }), el('span', { text: c.subs.join(' · ') })]), rm]));
    });
    $('cc-fres').value = summaryText('', null);
    refreshBar();
  }

  var formInView = false;
  function refreshBar() { $('cc-bar').hidden = !(count() > 0 && !sent && !formInView); }

  /* ---------------- envío ---------------- */
  function emailConfigured() { var e = CONFIG.NOTIFY_EMAIL || ''; return EMAIL_RE.test(e) || /^[a-f0-9]{32}$/i.test(e); }
  function makeFolio() {
    var d = new Date(), p = function (x) { return ('0' + x).slice(-2); };
    return 'CC-' + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }
  function utm() {
    var o = {}, q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) { if (q.get(k)) o[k] = q.get(k); });
    return o;
  }
  function sendEmail(d, folio, text) {
    var body = {
      _subject: CONFIG.EMAIL_SUBJECT + ' · ' + folio + ' · ' + (d.empresa || d.nombre), _template: 'table', _captcha: 'false', _replyto: d.correo,
      Folio: folio, Nombre: d.nombre, Empresa: d.empresa || '—', Correo: d.correo, 'Teléfono': d.telefono, Comentarios: d.mensaje || '—',
      'Resumen de la cotización': text, 'Página': location.href
    };
    if (CONFIG.COPY_TO_CLIENT) body._cc = d.correo;
    return fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CONFIG.NOTIFY_EMAIL), {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body)
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || 'email'); }); });
  }
  function sendWebhook(d, folio, text) {
    var p = new URLSearchParams(), k;
    var base = { folio: folio, fecha: new Date().toISOString(), nombre: d.nombre, empresa: d.empresa, correo: d.correo, telefono: d.telefono,
      comentarios: d.mensaje, resumen: text, equipos: JSON.stringify(selected()),
      equipos_texto: selected().map(function (c) { return c.name + ': ' + c.subs.join(', '); }).join(' | '), pagina: location.href };
    var u = utm();
    for (k in base) p.append(k, base[k] || '');
    for (k in u) p.append(k, u[k]);
    return fetch(CONFIG.WEBHOOK_URL, { method: 'POST', mode: 'no-cors', body: p });
  }
  function showErr(m) { errBox.textContent = m; errBox.classList.toggle('show', !!m); }

  function onSubmit(e) {
    e.preventDefault();
    var f = {}; ['nombre', 'empresa', 'correo', 'telefono', 'mensaje', 'website'].forEach(function (k) { f[k] = (form.elements[k].value || '').trim(); });
    showErr('');
    if (!count()) return showErr('Selecciona al menos un equipo.');
    if (!f.nombre || !f.correo || !f.telefono) return showErr('Completa nombre, correo y teléfono.');
    if (!EMAIL_RE.test(f.correo)) return showErr('Revisa tu correo: parece incompleto.');
    var folio = makeFolio(), text = summaryText(folio, f);
    $('cc-ffol').value = folio; $('cc-fres').value = text;
    if (f.website) return finish(f, folio);                       // honeypot: bot

    var jobs = [];
    if (emailConfigured()) jobs.push(sendEmail(f, folio, text));
    if (CONFIG.WEBHOOK_URL) jobs.push(sendWebhook(f, folio, text));
    if (!jobs.length) return showErr('El envío aún no está configurado. Avisa al administrador del sitio.');

    var label = submitBtn.innerHTML;
    submitBtn.disabled = true; submitBtn.textContent = 'Enviando…';
    Promise.allSettled(jobs).then(function (rs) {
      submitBtn.disabled = false; submitBtn.innerHTML = label;
      if (rs.some(function (r) { return r.status === 'fulfilled'; })) {
        push({ event: 'cotizacion_enviada', folio: folio, equipos_total: count(), categorias: selected().map(function (c) { return c.name; }) });
        push({ event: 'generate_lead', value: count(), currency: 'MXN' });
        finish(f, folio);
      } else showErr('No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.');
    });
  }
  function finish(f, folio) {
    sent = true; app.classList.add('cc-sent');
    $('cc-okname').textContent = 'Gracias, ' + f.nombre;
    $('cc-okfolio').textContent = 'Folio ' + folio;
    var ol = $('cc-ol'); ol.innerHTML = '';
    selected().forEach(function (c) { var li = el('li'); li.appendChild(el('b', { text: c.name + ': ' })); li.appendChild(document.createTextNode(c.subs.join(', '))); ol.appendChild(li); });
    form.hidden = true; $('cc-ok').hidden = false; $('cc-ok').focus({ preventScroll: true });
    $('cc-ok').scrollIntoView({ behavior: 'smooth', block: 'center' });
    refreshBar();
  }

  /* ---------------- arranque ---------------- */
  function init() {
    var mount = $('cc-mount');
    if (!mount) {
      mount = el('div', { id: 'cc-mount' });
      if (SCRIPT && SCRIPT.parentNode) SCRIPT.parentNode.insertBefore(mount, SCRIPT); else document.body.appendChild(mount);
    }
    if (CONFIG.LOAD_FONTS && !$('cc-fonts')) {
      document.head.appendChild(el('link', { id: 'cc-fonts', rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@600;700;800&display=swap' }));
    }
    mount.innerHTML = TPL;
    app = $('cc-app'); app.classList.add('cc-js');
    form = $('cc-form'); errBox = $('cc-err'); submitBtn = $('cc-submit');

    // iconos sueltos
    [].forEach.call(app.querySelectorAll('[data-ic]'), function (n) { n.innerHTML = svg(n.getAttribute('data-ic'), +n.getAttribute('data-s') || 22); });
    // logos, video, header/footer
    var A = CONFIG.ASSETS;
    if (A.logo) $('cc-logo').src = A.logo; if (A.logoWhite) $('cc-logow').src = A.logoWhite;
    var v = $('cc-video');
    if (A.poster) v.poster = A.poster;
    if (A.video) { v.src = A.video; v.muted = true; var pr = v.play && v.play(); if (pr && pr.catch) pr.catch(function () {}); } else if (!A.poster) v.remove();
    if (!CONFIG.SHOW_HEADER_FOOTER) [].forEach.call(app.querySelectorAll('[data-chrome]'), function (n) { n.hidden = true; });
    if (CONFIG.LOGOS.length) { var lg = $('cc-logos'); CONFIG.LOGOS.forEach(function (s) { lg.appendChild(el('img', { src: s, alt: '', loading: 'lazy' })); }); lg.hidden = false; }

    buildBenefits(); buildCatalog(); update();

    form.addEventListener('submit', onSubmit);
    $('cc-reset').addEventListener('click', function () {
      sel = {}; sent = false; app.classList.remove('cc-sent'); form.reset(); showErr(''); $('cc-ok').hidden = true; form.hidden = false; update();
      $('cc-catalogo').scrollIntoView({ behavior: 'smooth' });
    });
    app.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#cc-"]'); if (!a) return;
      var t = $(a.getAttribute('href').slice(1)); if (!t) return;
      e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { formInView = es[0].isIntersecting; refreshBar(); }, { threshold: 0.2 }).observe(form.parentNode);
      var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('cc-in'); io.unobserve(x.target); } }); }, { threshold: 0.12 });
      [].forEach.call(app.querySelectorAll('.cc-rv'), function (n) { io.observe(n); });
    } else { [].forEach.call(app.querySelectorAll('.cc-rv'), function (n) { n.classList.add('cc-in'); }); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
