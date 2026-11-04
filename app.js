(function () {
  'use strict';

  var WA = '595987660000';
  var LEAD_URL = 'https://espocrm-production-f5c4.up.railway.app/api/v1/LeadCapture/969b8835738efb510401f6532a4d2f64';
  var PRICE = 10000;
  var ORDER = ['gourmet', 'superior', 'tradicional'];
  var METHODS = {
    espresso: ['gourmet', 'superior'],
    v60: ['gourmet', 'superior'],
    prensa: ['gourmet', 'superior'],
    chemex: ['gourmet'],
    moka: ['superior', 'tradicional'],
    filtro: ['tradicional'],
    colador: ['tradicional']
  };

  var DICT = window.KNQ_I18N;
  var UI = window.KNQ_UI;
  var state = { lang: 'es', cart: {}, method: 'espresso', pending: { gourmet: 1, superior: 1, tradicional: 1 } };

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage may be blocked */ } }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function fmt(n) { return 'Gs. ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* Language: Spanish is captured from the page so it is written only once */
  var base = {};
  $$('[data-t]').forEach(function (n) { base[n.dataset.t] = n.textContent; });
  $$('[data-t-alt]').forEach(function (n) { base[n.dataset.tAlt] = n.alt; });
  $$('[data-t-aria]').forEach(function (n) { base[n.dataset.tAria] = n.getAttribute('aria-label'); });

  function tr(key) {
    if (state.lang === 'es') return base[key];
    var v = DICT[state.lang][key];
    return v === undefined ? base[key] : v;
  }

  function applyLang() {
    document.documentElement.lang = state.lang;
    document.title = UI[state.lang].title;
    $$('[data-t]').forEach(function (n) { n.textContent = tr(n.dataset.t); });
    $$('[data-t-alt]').forEach(function (n) { n.alt = tr(n.dataset.tAlt); });
    $$('[data-t-aria]').forEach(function (n) { n.setAttribute('aria-label', tr(n.dataset.tAria)); });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)); });
    renderBuy();
    renderChooser();
    renderCart();
  }

  /* Cart */
  function saveCart() { store('knq-cart', JSON.stringify(state.cart)); }
  function setQty(id, qty) {
    if (qty <= 0) delete state.cart[id]; else state.cart[id] = Math.min(99, qty);
    saveCart();
    renderCart();
  }
  function add(id, qty) {
    setQty(id, (state.cart[id] || 0) + qty);
    toast(UI[state.lang].toast + ' · ' + UI[state.lang].products[id].name);
  }

  var toastTimer;
  function toast(text) {
    var t = $('#toast');
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function qtyControl(value, onChange, s) {
    var box = el('div', { class: 'qty', role: 'group', 'aria-label': s.qty });
    var less = el('button', { type: 'button', 'aria-label': s.less }, '−');
    var out = el('output', {}, String(value));
    var more = el('button', { type: 'button', 'aria-label': s.more }, '+');
    less.addEventListener('click', function () { onChange(-1, out); });
    more.addEventListener('click', function () { onChange(1, out); });
    box.append(less, out, more);
    return box;
  }

  function renderBuy() {
    var s = UI[state.lang];
    $$('[data-product]').forEach(function (art) {
      var id = art.dataset.product;
      var buy = $('[data-buy]', art);
      buy.textContent = '';
      var price = el('p', { class: 'price' });
      price.append(el('strong', {}, fmt(PRICE)), el('span', {}, s.ref));
      var qty = qtyControl(state.pending[id], function (d, out) {
        state.pending[id] = Math.max(1, Math.min(99, state.pending[id] + d));
        out.textContent = state.pending[id];
      }, s);
      var btn = el('button', { type: 'button', class: 'btn' }, s.add);
      btn.addEventListener('click', function () { add(id, state.pending[id]); });
      buy.append(price, qty, btn);
    });
  }

  function message(lines, subtotal) {
    var s = UI[state.lang];
    return [s.wa.hello, ''].concat(lines.map(function (l) {
      return '• ' + l.qty + ' × ' + s.products[l.id].name + ' — ' + fmt(l.qty * PRICE);
    }), ['', s.subtotal + ': ' + fmt(subtotal), s.wa.shipping + ': ' + s.wa.shippingVal, s.wa.total + ': ' + fmt(subtotal), '', s.wa.bye]).join('\n');
  }

  function renderCart() {
    var s = UI[state.lang];
    var lines = ORDER.filter(function (id) { return state.cart[id] > 0; }).map(function (id) { return { id: id, qty: state.cart[id] }; });
    var count = lines.reduce(function (a, l) { return a + l.qty; }, 0);
    var subtotal = count * PRICE;

    var badge = $('#cartCount');
    badge.textContent = count;
    badge.hidden = count === 0;
    $('#cartEmpty').hidden = count > 0;
    $('#cartFull').hidden = count === 0;
    if (!count) return;

    var list = $('#cartLines');
    list.textContent = '';
    lines.forEach(function (l) {
      var li = el('li', { class: 'line' });
      var actions = el('div', { class: 'line-actions' });
      var qty = qtyControl(l.qty, function (d) { setQty(l.id, Math.max(1, state.cart[l.id] + d)); }, s);
      var remove = el('button', { type: 'button', class: 'text-link' }, s.remove);
      remove.addEventListener('click', function () { setQty(l.id, 0); });
      actions.append(qty, remove);
      li.append(
        el('span', { class: 'line-name' }, s.products[l.id].name),
        el('span', { class: 'line-total' }, fmt(l.qty * PRICE)),
        el('span', { class: 'line-unit' }, fmt(PRICE) + ' ' + s.each),
        actions
      );
      list.append(li);
    });

    $('#subtotalLabel').textContent = s.subtotal + ' (' + s.items(count) + ')';
    $('#subtotal').textContent = fmt(subtotal);
    $('#total').textContent = fmt(subtotal);
    var msg = message(lines, subtotal);
    $('#waPreview').textContent = msg;
    $('#waLink').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }

  /* Live element: pick how you brew and see the coffees that suit it */
  function renderChooser() {
    var s = UI[state.lang];
    var box = $('#methods');
    box.setAttribute('aria-label', s.chooseAria);
    box.textContent = '';
    Object.keys(s.methods).forEach(function (m) {
      var b = el('button', { type: 'button', 'aria-pressed': String(m === state.method) }, s.methods[m]);
      b.addEventListener('click', function () {
        state.method = m;
        renderChooser();
        var again = $$('#methods button').filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; })[0];
        if (again) again.focus();
      });
      box.append(b);
    });
    var out = $('#matches');
    out.textContent = '';
    METHODS[state.method].forEach(function (id) {
      var p = s.products[id];
      var li = el('li', { class: 'match' });
      var name = el('a', { href: '#p-' + id }, p.label);
      var btn = el('button', { type: 'button', class: 'btn' }, s.add);
      btn.addEventListener('click', function () { add(id, 1); });
      li.append(name, el('p', { class: 'meta' }, p.format + ' · ' + fmt(PRICE)), el('p', {}, p.short), btn);
      out.append(li);
    });
  }

  /* Lead form: same payload as the current site */
  function bindForm() {
    var form = $('#leadForm');
    var ok = $('#formOk');
    var err = $('#formErr');
    var submit = $('#leadSubmit');
    var sending = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      var val = function (n) { return (form.elements[n].value || '').trim(); };
      var reasonEl = form.elements.reason;
      var reason = reasonEl.options[reasonEl.selectedIndex].textContent;
      var payload = {
        firstName: val('firstName'),
        lastName: val('lastName'),
        emailAddress: val('email'),
        phoneNumber: val('phone'),
        description: '[' + reason + '] ' + val('message') + "\n\n— Web Kings'n Queens (" + state.lang.toUpperCase() + ')'
      };
      sending = true;
      submit.disabled = true;
      submit.textContent = UI[state.lang].sending;
      ok.hidden = true;
      err.hidden = true;
      fetch(LEAD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          ok.hidden = false;
        })
        .catch(function () { err.hidden = false; })
        .then(function () {
          sending = false;
          submit.disabled = false;
          submit.textContent = tr('f.submit');
        });
    });
    $('#wholesale').addEventListener('click', function () {
      form.elements.reason.value = 'mayorista';
      ok.hidden = true;
    });
  }

  /* The bar takes the colour of the chapter beneath it */
  function bindBar() {
    var bar = $('#bar');
    var fields = $$('[data-field]');
    var fab = $('#waFab');
    var cart = $('#carrito');
    var ticking = false;
    function update() {
      ticking = false;
      var probe = bar.offsetHeight / 2;
      var current = fields.filter(function (f) {
        var r = f.getBoundingClientRect();
        return r.top <= probe && r.bottom > probe;
      })[0];
      if (current) {
        var style = getComputedStyle(current);
        bar.style.setProperty('--bar-bg', style.getPropertyValue('--field'));
        bar.style.setProperty('--bar-on', style.getPropertyValue('--on'));
        bar.classList.toggle('on-mustard', current.classList.contains('f-mustard'));
      }
      var c = cart.getBoundingClientRect();
      fab.classList.toggle('away', c.top < innerHeight * 0.7 && c.bottom > innerHeight * 0.3);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();
  }

  /* Entrances: staggered within each section, once */
  function bindRise() {
    var items = $$('[data-rise]');
    items.forEach(function (n) {
      var group = $$('[data-rise]', n.closest('section, article') || document.body);
      n.style.setProperty('--d', Math.min(group.indexOf(n), 6) * 70 + 'ms');
    });
    // Anything at or above the fold shows, so jumping past a section never leaves it hidden.
    var pending = items.slice();
    var ticking = false;
    function reveal() {
      ticking = false;
      var fold = innerHeight * 0.92;
      pending = pending.filter(function (n) {
        if (n.getBoundingClientRect().top > fold) return true;
        n.classList.add('in');
        return false;
      });
      if (!pending.length) {
        removeEventListener('scroll', onChange);
        removeEventListener('resize', onChange);
      }
    }
    function onChange() { if (!ticking) { ticking = true; requestAnimationFrame(reveal); } }
    addEventListener('scroll', onChange, { passive: true });
    addEventListener('resize', onChange);
    reveal();
  }

  /* Boot */
  try {
    var saved = JSON.parse(read('knq-cart') || '{}');
    if (saved && typeof saved === 'object') {
      ORDER.forEach(function (id) {
        var q = Number(saved[id]);
        if (q > 0) state.cart[id] = Math.min(99, Math.floor(q));
      });
    }
  } catch (e) { /* ignore a corrupted cart */ }
  var savedLang = read('knq-lang');
  if (UI[savedLang]) state.lang = savedLang;

  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.lang = b.dataset.lang;
      store('knq-lang', state.lang);
      applyLang();
    });
  });
  $('#cartClear').addEventListener('click', function () {
    state.cart = {};
    saveCart();
    renderCart();
  });
  $('#chooser').hidden = false;
  applyLang();
  bindForm();
  bindBar();
  bindRise();
})();
