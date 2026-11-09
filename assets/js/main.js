/* HPR Hidráulica — site JS (vanilla, no libs) */
'use strict';

/* ONE swappable business constant */
const BUSINESS = {
  name: 'HPR Hidráulica',
  phoneDisplay: '(19) 3887-4757',
  phoneWa: '551938874757', /* telefone verificado da oficina; WhatsApp a confirmar */
  email: 'hidraulicaramos@bol.com.br',
  address: 'Rua Emiliano Sanches, Hortolândia/SP — CEP 13186-484',
  hours: 'Segunda a sexta, 08:00 às 17:30'
};

/* Apply the business name everywhere it is marked swappable */
document.querySelectorAll('[data-business]').forEach(function (el) {
  el.textContent = BUSINESS.name;
});

/* ---- mobile nav ---- */
var burger = document.querySelector('.burger');
var nav = document.querySelector('nav.main');
if (burger && nav) {
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); });
  });
}

/* ---- reveal on scroll ---- */
var revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(function (el) { io.observe(el); });
} else {
  revealEls.forEach(function (el) { el.classList.add('in'); });
}

/* ---- FAQ accordion (collapsed by default) ---- */
document.querySelectorAll('.faq-item').forEach(function (item) {
  var btn = item.querySelector('.faq-q');
  var ans = item.querySelector('.faq-a');
  if (!btn || !ans) return;
  btn.addEventListener('click', function () {
    var open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    ans.hidden = !open;
  });
});

/* ---- Como Funciona checklist ---- */
var checkItems = document.querySelectorAll('.check-item input[type="checkbox"]');
var doneCount = document.querySelector('.done-count');
function updateChecklist() {
  var done = 0;
  checkItems.forEach(function (cb) {
    done += cb.checked ? 1 : 0;
    cb.closest('.check-item').classList.toggle('checked', cb.checked);
  });
  if (doneCount) doneCount.textContent = done + '/4 PRONTO';
}
checkItems.forEach(function (cb) { cb.addEventListener('change', updateChecklist); });
updateChecklist();

/* ---- WhatsApp quote bot (orcamento.html + home mini-mock) ---- */
var bot = document.getElementById('quote-bot');
if (bot) {
  var state = { equip: null, problem: null, photoName: null, photoSize: null, urgency: null, name: '', whatsapp: '' };
  var steps = Array.prototype.slice.call(bot.querySelectorAll('.bot-step[data-step]'));
  var summaryBox = document.getElementById('bot-summary');
  var waBtn = document.getElementById('bot-send-wa');
  var mailBtn = document.getElementById('bot-send-mail');
  var consent = document.getElementById('bot-consent');
  var sendErr = document.getElementById('bot-send-err');

  function currentStepIndex() {
    for (var i = 0; i < steps.length; i++) {
      if (!steps[i].classList.contains('done')) return i;
    }
    return steps.length;
  }
  function refreshLocks() {
    var idx = currentStepIndex();
    steps.forEach(function (s, i) {
      s.classList.toggle('locked', i > idx);
      s.classList.toggle('done', i < idx);
    });
    var summary = document.getElementById('bot-summary-wrap');
    if (summary) summary.style.display = idx >= steps.length ? 'block' : 'none';
    if (idx >= steps.length) buildSummary();
  }
  function setStepDone(n) {
    var s = bot.querySelector('.bot-step[data-step="' + n + '"]');
    if (s) s.classList.add('done');
    refreshLocks();
  }
  function showErr(stepEl, msg) {
    var e = stepEl.querySelector('.bot-err');
    if (e) { e.textContent = msg; e.classList.add('show'); }
  }
  function clearErr(stepEl) {
    var e = stepEl.querySelector('.bot-err');
    if (e) e.classList.remove('show');
  }

  /* option buttons (steps 1, 2, 4) */
  bot.querySelectorAll('.opt[data-value]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var stepEl = btn.closest('.bot-step');
      var n = parseInt(stepEl.getAttribute('data-step'), 10);
      stepEl.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('selected'); });
      btn.classList.add('selected');
      clearErr(stepEl);
      if (n === 1) state.equip = btn.getAttribute('data-value');
      if (n === 2) state.problem = btn.getAttribute('data-value');
      if (n === 4) state.urgency = btn.getAttribute('data-value');
      setStepDone(n);
    });
  });

  /* step 3 — photo upload */
  var fileInput = document.getElementById('bot-photo');
  var preview = document.getElementById('photo-preview');
  var previewImg = document.getElementById('photo-preview-img');
  var previewName = document.getElementById('photo-preview-name');
  var previewSize = document.getElementById('photo-preview-size');
  var noPhotoBtn = document.getElementById('bot-no-photo');
  var removePhotoBtn = document.getElementById('photo-remove');
  if (fileInput) {
    fileInput.addEventListener('change', function () {
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      if (!f.type || f.type.indexOf('image/') !== 0) {
        showErr(fileInput.closest('.bot-step'), 'O arquivo precisa ser uma imagem (JPG ou PNG).');
        fileInput.value = '';
        return;
      }
      state.photoName = f.name;
      state.photoSize = (f.size / 1024).toFixed(0) + ' KB';
      previewImg.src = URL.createObjectURL(f);
      previewName.textContent = f.name;
      previewSize.textContent = state.photoSize;
      preview.classList.add('show');
      clearErr(fileInput.closest('.bot-step'));
      setStepDone(3);
    });
  }
  if (noPhotoBtn) {
    noPhotoBtn.addEventListener('click', function () {
      state.photoName = null;
      preview.classList.remove('show');
      fileInput.value = '';
      clearErr(noPhotoBtn.closest('.bot-step'));
      setStepDone(3);
    });
  }
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', function () {
      state.photoName = null;
      preview.classList.remove('show');
      fileInput.value = '';
      var s = bot.querySelector('.bot-step[data-step="3"]');
      s.classList.remove('done');
      refreshLocks();
    });
  }

  /* step 5 — name + WhatsApp */
  var nameInput = document.getElementById('bot-name');
  var waInput = document.getElementById('bot-whatsapp');
  var step5Btn = document.getElementById('bot-step5-next');
  function validName() { return nameInput.value.trim().length >= 2; }
  function validWa() { return (waInput.value.replace(/\D/g, '').length >= 10); }
  if (step5Btn) {
    step5Btn.addEventListener('click', function () {
      var ok = true;
      var nf = nameInput.closest('.field');
      var wf = waInput.closest('.field');
      nf.classList.remove('invalid'); wf.classList.remove('invalid');
      if (!validName()) {
        nf.classList.add('invalid');
        nf.querySelector('.err').textContent = 'Informe seu nome (mínimo 2 letras).';
        ok = false;
      }
      if (!validWa()) {
        wf.classList.add('invalid');
        wf.querySelector('.err').textContent = 'Informe um WhatsApp válido com DDD (mínimo 10 dígitos).';
        ok = false;
      }
      if (!ok) return;
      state.name = nameInput.value.trim();
      state.whatsapp = waInput.value.trim();
      setStepDone(5);
      document.getElementById('bot-summary-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  [nameInput, waInput].forEach(function (inp) {
    if (!inp) return;
    inp.addEventListener('input', function () { inp.closest('.field').classList.remove('invalid'); });
  });

  function buildMessage() {
    var lines = [
      '*SOLICITAÇÃO DE ORÇAMENTO — ' + BUSINESS.name.toUpperCase() + '*',
      'Oficina: Hortolândia/SP',
      'Equipamento: ' + (state.equip || '—'),
      'Sintoma: ' + (state.problem || '—'),
      'Foto: ' + (state.photoName ? 'Anexada (' + state.photoName + ')' : 'Sem foto'),
      'Urgência: ' + (state.urgency || '—'),
      'Nome: ' + (state.name || '—'),
      'WhatsApp: ' + (state.whatsapp || '—')
    ];
    return lines.join('\n');
  }
  function buildSummary() {
    if (summaryBox) summaryBox.textContent = buildMessage();
    if (waBtn) waBtn.href = 'https://wa.me/' + BUSINESS.phoneWa + '?text=' + encodeURIComponent(buildMessage());
    if (mailBtn) {
      mailBtn.href = 'mailto:' + BUSINESS.email +
        '?subject=' + encodeURIComponent('Solicitação de orçamento — ' + BUSINESS.name) +
        '&body=' + encodeURIComponent(buildMessage());
    }
  }
  function requireConsent() {
    if (!consent || !consent.checked) {
      if (sendErr) {
        sendErr.textContent = 'Marque o consentimento LGPD para enviar seus dados para o orçamento.';
        sendErr.classList.add('show');
      }
      return false;
    }
    if (sendErr) sendErr.classList.remove('show');
    return true;
  }
  if (waBtn) {
    waBtn.addEventListener('click', function (e) {
      if (!requireConsent()) { e.preventDefault(); return; }
      buildSummary();
    });
  }
  if (mailBtn) {
    mailBtn.addEventListener('click', function (e) {
      if (!requireConsent()) { e.preventDefault(); return; }
      buildSummary();
    });
  }
  var restartBtn = document.getElementById('bot-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      state = { equip: null, problem: null, photoName: null, photoSize: null, urgency: null, name: '', whatsapp: '' };
      bot.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('selected'); });
      preview.classList.remove('show');
      fileInput.value = '';
      nameInput.value = ''; waInput.value = '';
      if (consent) consent.checked = false;
      steps.forEach(function (s) { s.classList.remove('done'); });
      refreshLocks();
      bot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* preselect equipment from ?equip= (home mini-mock links) */
  var params = new URLSearchParams(window.location.search);
  var pre = params.get('equip');
  if (pre) {
    var target = bot.querySelector('.bot-step[data-step="1"] .opt[data-value="' + pre + '"]');
    if (target) target.click();
  }
  refreshLocks();
}

/* ---- contact form (contato.html) ---- */
var cform = document.getElementById('contact-form');
if (cform) {
  cform.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    function check(input, test, msg) {
      var f = input.closest('.field');
      f.classList.remove('invalid');
      if (!test(input.value)) {
        f.classList.add('invalid');
        f.querySelector('.err').textContent = msg;
        ok = false;
      }
    }
    check(document.getElementById('c-nome'), function (v) { return v.trim().length >= 2; },
      'Informe seu nome completo ou razão social (mínimo 2 letras).');
    check(document.getElementById('c-whatsapp'), function (v) { return v.replace(/\D/g, '').length >= 10; },
      'Informe um WhatsApp válido com DDD (mínimo 10 dígitos).');
    check(document.getElementById('c-email'), function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      'Informe um e-mail válido (ex.: nome@empresa.com.br).');
    check(document.getElementById('c-msg'), function (v) { return v.trim().length >= 10; },
      'Descreva a falha em ao menos 10 caracteres.');
    var lgpd = document.getElementById('c-lgpd');
    var lgpdErr = document.getElementById('c-lgpd-err');
    if (!lgpd.checked) { lgpdErr.style.display = 'block'; ok = false; }
    else { lgpdErr.style.display = 'none'; }
    if (!ok) {
      var firstBad = cform.querySelector('.field.invalid');
      if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    /* Demo: no backend — show confirmation, no data sent */
    cform.style.display = 'none';
    var done = document.getElementById('contact-ok');
    if (done) {
      done.classList.add('show');
      done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  cform.querySelectorAll('input, select, textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      var f = el.closest('.field');
      if (f) f.classList.remove('invalid');
    });
  });
}
