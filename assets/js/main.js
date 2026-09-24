/* Zeus Mining — landing */
(function () {
  'use strict';

  // ---------- Configuración ----------
  var ZEUS = {
    whatsapp: '56998830615' // WhatsApp comercial (no se muestra en la página)
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
      'Empresa: ' + d.empresa
    ];
    if (d.email) lines.push('Correo: ' + d.email);
    if (d.telefono) lines.push('Teléfono: ' + d.telefono);
    lines.push('Servicio: ' + d.servicioLabel);
    if (d.faena) lines.push('Faena / ubicación: ' + d.faena);
    lines.push('', 'Mensaje:', d.mensaje);
    return lines.join('\n');
  }

  var ALL = ['nombre', 'empresa', 'email', 'telefono', 'servicio', 'faena', 'mensaje'];

  // El formulario arma la solicitud y la envía por WhatsApp (sin correo por ahora)
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(ALL)) { setStatus('Revisa los campos marcados.', 'err'); return; }
    var d = readForm();
    var text = 'Hola Zeus Mining, les escribo desde la web.\n\n' + summary(d)
      .split('\n')
      .filter(function (l) { return !/: $/.test(l); }) // quita campos opcionales vacíos
      .join('\n');
    window.open(waUrl(text), '_blank', 'noopener');
    setStatus('Abrimos WhatsApp con tu solicitud lista. Solo falta que presiones enviar.', 'ok');
  });

  // ---------- Catálogo de productos (PDF en modal) ----------
  //
  // El PDF pesa 2 MB. El visor se arma recién al abrir el modal y se desarma al
  // cerrarlo, así que quien nunca lo abre no lo descarga, y quien lo cierra deja
  // de tener un iframe vivo consumiendo memoria.
  (function () {
    var abrir = document.getElementById('ver-catalogo');
    var modal = document.getElementById('cat-modal');
    if (!abrir || !modal || typeof modal.showModal !== 'function') return;

    var visor = document.getElementById('cat-viewer');
    var cerrar = document.getElementById('cat-close');
    var RUTA = 'assets/Cat_ZEUS_2026.pdf';

    /**
     * Si conviene intentar el visor embebido.
     *
     * iOS y la mayoria de los navegadores moviles NO renderizan un PDF dentro de
     * un iframe: muestran un recuadro en blanco, o la primera pagina sin poder
     * scrollear. Un recuadro vacio se lee como "esto esta roto", asi que ahi se
     * muestra directamente el plan B, que ademas es lo que la gente hace en un
     * telefono: abrirlo en el visor del sistema o descargarlo.
     *
     * Se mira el puntero y no el user agent: un user agent se falsea y ademas se
     * desactualiza, y lo que importa aca es la clase de dispositivo.
     */
    function puedeIncrustar() {
      return window.matchMedia('(min-width: 701px) and (pointer: fine)').matches;
    }

    function armarVisor() {
      if (puedeIncrustar()) {
        var iframe = document.createElement('iframe');
        iframe.src = RUTA;
        iframe.title = 'Catálogo de productos Zeus Mining 2026';
        visor.appendChild(iframe);
        return;
      }
      var caja = document.createElement('div');
      caja.className = 'cat-fallback';
      caja.innerHTML =
        '<i data-lucide="file-text" width="40" height="40"></i>' +
        '<p>El catálogo tiene 17 páginas en PDF. Ábrelo en tu visor o descárgalo para verlo con calma.</p>' +
        '<a class="btn btn--gold" href="' + RUTA + '" target="_blank" rel="noopener">' +
        'Abrir el catálogo <i data-lucide="external-link"></i></a>';
      visor.appendChild(caja);
      drawIcons();
    }

    abrir.addEventListener('click', function () {
      if (!visor.firstChild) armarVisor();
      modal.showModal();
    });

    cerrar.addEventListener('click', function () { modal.close(); });

    // Clic en el fondo. El <dialog> recibe el evento del backdrop como si fuera
    // suyo, asi que se compara el target: si es el propio dialog y no algo de
    // adentro, el clic fue afuera.
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.close();
    });

    // Al cerrar (boton, Esc o backdrop) se desmonta el visor: un iframe con un
    // PDF sigue vivo aunque no se vea.
    modal.addEventListener('close', function () { visor.innerHTML = ''; });
  })();


  // ---------- Un solo manejador de scroll ----------
  //
  // Todo lo que reacciona al scroll —el botón de volver arriba, la barra de
  // lectura y la sección activa del menú— se suscribe acá. Con un listener por
  // efecto, los tres corren en el mismo cuadro peleándose los milisegundos, y
  // cada uno que lea getBoundingClientRect obliga al navegador a recalcular el
  // layout otra vez.
  //
  // requestAnimationFrame: el navegador dispara scroll muchas más veces por
  // segundo de las que puede pintar. Sin esto se hace trabajo que nadie ve.
  var suscritos = [];
  var pendiente = false;

  function correrSuscritos() {
    pendiente = false;
    for (var i = 0; i < suscritos.length; i++) suscritos[i]();
  }

  function alBajar(fn) {
    suscritos.push(fn);
    fn(); // estado inicial: puede entrarse con la página ya scrolleada
  }

  // passive: true porque ninguno de estos llama preventDefault, y decírselo al
  // navegador le deja hacer el scroll sin esperar a que terminen.
  window.addEventListener('scroll', function () {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(correrSuscritos);
  }, { passive: true });

  window.addEventListener('resize', correrSuscritos);

  // ---------- Barra de lectura ----------
  (function () {
    var barra = document.getElementById('progreso');
    if (!barra) return;
    alBajar(function () {
      var recorrible = document.documentElement.scrollHeight - window.innerHeight;
      // Una página más corta que la ventana no tiene recorrido: sin la guarda,
      // la división daría Infinity y la barra quedaría llena de entrada.
      var avance = recorrible > 0 ? Math.min(1, window.scrollY / recorrible) : 0;
      barra.style.transform = 'scaleX(' + avance + ')';
    });
  })();

  // ---------- Sección actual en el menú ----------
  (function () {
    var hdrEl = document.querySelector('.hdr');
    var pares = [];
    document.querySelectorAll('.nav > a[href^="#"]:not(.btn)').forEach(function (a) {
      var sec = document.getElementById(a.getAttribute('href').slice(1));
      if (sec) pares.push({ enlace: a, seccion: sec });
    });
    if (pares.length === 0) return;

    alBajar(function () {
      // La ÚLTIMA sección cuyo borde superior ya pasó por debajo del encabezado.
      // Se recorre entero en vez de cortar en la primera que cruza: así no hay
      // huecos entre secciones donde ninguna quede marcada.
      var limite = (hdrEl ? hdrEl.offsetHeight : 76) + 12;
      var actual = null;
      for (var i = 0; i < pares.length; i++) {
        if (pares[i].seccion.getBoundingClientRect().top <= limite) actual = pares[i];
      }

      // Al fondo del todo gana la última, siempre. La sección de contacto es más
      // baja que la ventana, así que su borde superior nunca llega a cruzar el
      // límite y sin esto el menú se quedaría marcando la anterior.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        actual = pares[pares.length - 1];
      }

      for (var j = 0; j < pares.length; j++) {
        var esta = pares[j] === actual;
        pares[j].enlace.classList.toggle('is-active', esta);
        // aria-current le dice a un lector de pantalla cuál es la sección en la
        // que se está, que es la misma información que el subrayado da a la vista.
        if (esta) pares[j].enlace.setAttribute('aria-current', 'true');
        else pares[j].enlace.removeAttribute('aria-current');
      }
    });
  })();

  // ---------- Volver arriba ----------
  (function () {
    var boton = document.getElementById('up-float');
    if (!boton) return;

    // Aparece pasada una pantalla: antes de eso el encabezado sigue a la vista y
    // el botón no resuelve nada, solo tapa contenido.
    function alScroll() {
      boton.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.9);
    }

    // Se cuelga del manejador unificado de abajo en vez de poner su propio
    // listener: tres listeners de scroll separados compiten por el mismo cuadro.
    alBajar(alScroll);

    boton.addEventListener('click', function () {
      // 'smooth' explicito y no un href="#top": el enlace deja una entrada en el
      // historial y el boton "atras" del navegador termina devolviendo a la mitad
      // de la pagina en vez de al sitio anterior.
      //
      // Se respeta prefers-reduced-motion igual que el resto del sitio (el CSS ya
      // apaga el scroll-behavior suave ahi): con la animacion desactivada, un
      // salto largo marea a quien la tiene puesta justamente por eso.
      // El foco va PRIMERO y el scroll despues, porque mover el foco puede
      // cancelar un scroll suave ya en curso. Con este orden no hay nada que
      // cancelar.
      //
      // El foco vuelve al principio del documento porque sin esto quien navega
      // con teclado sigue parado donde estaba, y el siguiente Tab lo manda de
      // vuelta al pie. preventScroll evita que el propio focus salte de golpe,
      // que es justo lo que le sacaria el efecto al scroll suave de abajo.
      var inicio = document.getElementById('top');
      if (inicio) {
        inicio.setAttribute('tabindex', '-1');
        inicio.focus({ preventScroll: true });
      }

      var suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' });
    });
  })();
})();
