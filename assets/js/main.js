/* Zeus Mining — landing */
(function () {
  'use strict';

  // ---------- Configuración ----------
  var ZEUS = {
    whatsapp: '56998830615',               // WhatsApp comercial (no se muestra en la página)
    email: 'contacto@zeusmin.cl',
    // Si se configura un endpoint (Formspree, función de Supabase, etc.), el formulario
    // envía un POST JSON ahí. Vacío = abre el cliente de correo con la solicitud armada.
    formEndpoint: ''
  };

  var WA_MSG = {
    general:  'Hola Zeus Mining, quiero información sobre sus servicios.',
    arriendo: 'Hola Zeus Mining, quiero cotizar el arriendo de equipos vulcanizadores.',
    kits:     'Hola Zeus Mining, quiero cotizar kits de empalme / polímeros.',
    aseo:     'Hola Zeus Mining, quiero información sobre el servicio de aseo industrial.',
    equipo:   'Hola Zeus Mining, quiero cotizar el arriendo de: '
  };

  var SERVICIO_LABEL = {
    arriendo: 'Arriendo de equipos vulcanizadores',
    kits: 'Kits de empalme y polímeros',
    aseo: 'Aseo industrial',
    otro: 'Otro'
  };

  function waUrl(text) {
    return 'https://wa.me/' + ZEUS.whatsapp + '?text=' + encodeURIComponent(text);
  }

  // ---------- Links de WhatsApp ----------
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    var key = el.getAttribute('data-wa');
    var text = WA_MSG[key] || WA_MSG.general;
    if (key === 'equipo') text += el.getAttribute('data-wa-item') || '';
    el.setAttribute('href', waUrl(text));
  });

  // ---------- Íconos ----------
  // Lucide carga después de este script para no retrasar el resto de la página
  function drawIcons() { if (window.lucide) window.lucide.createIcons(); }
  var lucideTag = document.getElementById('lucide-js');
  if (window.lucide) drawIcons();
  else if (lucideTag) lucideTag.addEventListener('load', drawIcons);

  // ---------- Año ----------
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Header al hacer scroll ----------
  var hdr = document.querySelector('.hdr');
  function onScroll() { hdr.classList.toggle('is-scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Menú móvil ----------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
    hdr.classList.toggle('menu-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  // ---------- Animación de entrada ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ---------- Formulario ----------
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var select = document.getElementById('f-servicio');

  // Los botones "Solicitar por formulario" dejan preseleccionado el servicio
  document.querySelectorAll('[data-service]').forEach(function (el) {
    el.addEventListener('click', function () { select.value = el.getAttribute('data-service'); });
  });

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  function clearErrors() {
    form.querySelectorAll('.field.is-invalid').forEach(function (f) {
      f.classList.remove('is-invalid');
      var err = f.querySelector('.field-err');
      if (err) err.remove();
    });
  }

  function validate(names) {
    clearErrors();
    var firstBad = null;
    names.forEach(function (name) {
      var input = form.elements[name];
      var value = input.value.trim();
      var msg = '';
      if (input.required && !value) msg = 'Este campo es obligatorio.';
      else if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = 'Revisa el formato del correo.';
      if (msg) {
        var field = input.closest('.field');
        field.classList.add('is-invalid');
        var err = document.createElement('span');
        err.className = 'field-err';
        err.textContent = msg;
        field.appendChild(err);
        input.setAttribute('aria-invalid', 'true');
        if (!firstBad) firstBad = input;
      } else {
        input.removeAttribute('aria-invalid');
      }
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function readForm() {
    var d = {};
    ['nombre', 'empresa', 'email', 'telefono', 'servicio', 'faena', 'mensaje'].forEach(function (k) {
      d[k] = form.elements[k].value.trim();
    });
    d.servicioLabel = SERVICIO_LABEL[d.servicio] || d.servicio;
    return d;
  }

  function summary(d) {
    var lines = [
      'Nombre: ' + d.nombre,
      'Empresa: ' + d.empresa,
      'Correo: ' + d.email
    ];
    if (d.telefono) lines.push('Teléfono: ' + d.telefono);
    lines.push('Servicio: ' + d.servicioLabel);
    if (d.faena) lines.push('Faena / ubicación: ' + d.faena);
    lines.push('', 'Mensaje:', d.mensaje);
    return lines.join('\n');
  }

  var ALL = ['nombre', 'empresa', 'email', 'telefono', 'servicio', 'faena', 'mensaje'];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(ALL)) { setStatus('Revisa los campos marcados.', 'err'); return; }
    var d = readForm();

    if (ZEUS.formEndpoint) {
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      setStatus('Enviando…');
      fetch(ZEUS.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(d)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        setStatus('¡Gracias! Recibimos tu solicitud y te contactaremos a la brevedad.', 'ok');
      }).catch(function () {
        setStatus('No pudimos enviar la solicitud. Escríbenos por WhatsApp o a ' + ZEUS.email + '.', 'err');
      }).then(function () { btn.disabled = false; });
      return;
    }

    var subject = 'Solicitud web · ' + d.servicioLabel + ' · ' + d.empresa;
    window.location.href = 'mailto:' + ZEUS.email +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(summary(d));
    setStatus('Abrimos tu correo con la solicitud lista. Solo falta que presiones enviar.', 'ok');
  });

  document.getElementById('form-wa').addEventListener('click', function () {
    if (!validate(['nombre', 'servicio', 'mensaje'])) { setStatus('Completa nombre, servicio y mensaje para enviarlo por WhatsApp.', 'err'); return; }
    var d = readForm();
    var text = 'Hola Zeus Mining, les escribo desde la web.\n\n' + summary(d)
      .split('\n')
      .filter(function (l) { return !/: $/.test(l); }) // quita campos opcionales vacíos
      .join('\n');
    window.open(waUrl(text), '_blank', 'noopener');
    setStatus('Abrimos WhatsApp con tu mensaje listo para enviar.', 'ok');
  });
})();
