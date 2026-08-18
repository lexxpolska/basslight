/* =========================================================
   BASSLIGHT PRODUCTION — общий JS для всех страниц
   Файл подключается один раз, внизу <body>, на каждой странице.
   Разделы:
   1. Настройки отправки формы (MODE / FORM_ENDPOINT / контакты)
   2. Мобильное меню и выпадающее меню "Аренда"
   3. Плавающая кнопка связи (FAB) и кнопка "наверх"
   4. Появление секций при скролле (IntersectionObserver)
   5. Аккордеон (FAQ и т.п.)
   6. Слайдер (отзывы, кейсы)
   7. Фильтры каталога и поиск
   8. Конструктор заявки (localStorage)
   9. Маска телефона
   10. Валидация и отправка форм заявки
   ========================================================= */

/* ---------- 1. НАСТРОЙКИ ----------
   Чтобы переключить способ отправки формы, поменяйте MODE на 'formspree' или 'telegram'.
   'telegram' работает без бэкенда всегда — формирует текст заявки и открывает чат в Telegram.
   'formspree' отправляет POST-запрос на форму Formspree (нужно вписать свой FORM_ENDPOINT). */
const MODE = 'telegram'; // 'formspree' | 'telegram'
const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // PLACEHOLDER: заменить на реальный адрес формы Formspree

const MANAGERS = {
  alexey: { name: 'Алексей', phone: '+375291305549', tgUser: 'lexx_lab', tgLink: 'https://t.me/lexx_lab', waLink: 'https://wa.me/375291305549' },
  dmitry: { name: 'Дмитрий', phone: '+375291034679', tgUser: 'dj_dima_bass', tgLink: 'https://t.me/dj_dima_bass', waLink: 'https://wa.me/375291034679' },
};
const PRIMARY_MANAGER = MANAGERS.alexey; // заявки с общих форм уходят основному менеджеру

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initDropdowns();
  initFab();
  initToTop();
  initReveal();
  initAccordions();
  initSliders();
  initCatalogFilters();
  initOrderBuilder();
  initPhoneMasks();
  initForms();
  initYear();
});

/* ---------- 2. МОБИЛЬНОЕ МЕНЮ ---------- */
function initMobileMenu() {
  const burger = document.querySelector('.js-burger');
  const menu = document.querySelector('.js-mobile-menu');
  if (!burger || !menu) return;

  const closeBtn = menu.querySelector('.js-mobile-close');
  const submenuTriggers = menu.querySelectorAll('.js-mobile-submenu-trigger');

  function open() {
    menu.classList.add('is-open');
    burger.classList.add('is-active');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }
  function close() {
    menu.classList.remove('is-open');
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  burger.addEventListener('click', () => {
    menu.classList.contains('is-open') ? close() : open();
  });
  closeBtn && closeBtn.addEventListener('click', close);

  menu.addEventListener('click', (e) => {
    if (e.target === menu) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
  });
  menu.querySelectorAll('.mobile-menu__link:not(.js-mobile-submenu-trigger)').forEach((a) => {
    a.addEventListener('click', close);
  });

  submenuTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const sub = trigger.nextElementSibling;
      const isOpen = sub.classList.contains('is-open');
      sub.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* Выпадающее меню "Аренда" в шапке — поддержка клавиатуры и клика (не только hover) */
function initDropdowns() {
  document.querySelectorAll('.js-dropdown-trigger').forEach((trigger) => {
    const dropdown = trigger.parentElement.querySelector('.dropdown');
    if (!dropdown) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('is-open');
      closeAllDropdowns();
      if (!isOpen) {
        dropdown.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__item')) closeAllDropdowns();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });
}
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
  document.querySelectorAll('.js-dropdown-trigger[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
}

/* ---------- 3. FAB И "НАВЕРХ" ---------- */
function initFab() {
  const fab = document.querySelector('.js-fab');
  if (!fab) return;
  const mainBtn = fab.querySelector('.fab__main');
  mainBtn.addEventListener('click', () => {
    fab.classList.toggle('is-open');
    mainBtn.setAttribute('aria-expanded', String(fab.classList.contains('is-open')));
  });
  document.addEventListener('click', (e) => {
    if (!fab.contains(e.target)) fab.classList.remove('is-open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fab.classList.remove('is-open');
  });
  updateFabCount();
}
function initToTop() {
  const btn = document.querySelector('.js-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- 4. ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
}

/* ---------- 5. АККОРДЕОН ---------- */
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    const panel = trigger.nextElementSibling;
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      const group = trigger.closest('.accordion');
      if (group && group.dataset.singleOpen === 'true') {
        group.querySelectorAll('.accordion-trigger').forEach((t) => {
          if (t !== trigger) {
            t.setAttribute('aria-expanded', 'false');
            t.nextElementSibling.style.maxHeight = null;
          }
        });
      }
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = isOpen ? null : panel.scrollHeight + 'px';
    });
  });
}

/* ---------- 6. СЛАЙДЕР ---------- */
function initSliders() {
  document.querySelectorAll('.js-slider').forEach((slider) => {
    const track = slider.querySelector('.slider__track');
    const slides = Array.from(slider.querySelectorAll('.slider__slide'));
    const navWrap = slider.querySelector('.slider__nav');
    const prev = slider.querySelector('.js-slider-prev');
    const next = slider.querySelector('.js-slider-next');
    if (!track || slides.length === 0) return;
    let index = 0;
    let perView = slidesPerView(slider);

    function slidesPerView(el) {
      return parseInt(getComputedStyle(el).getPropertyValue('--per-view')) || 1;
    }
    function maxIndex() { return Math.max(0, slides.length - perView); }
    function render() {
      track.style.transform = `translateX(-${(index * 100) / perView}%)`;
      if (navWrap) {
        navWrap.querySelectorAll('.slider__dot').forEach((d, i) => d.classList.toggle('is-active', i === index));
      }
    }
    if (navWrap) {
      for (let i = 0; i <= maxIndex(); i++) {
        const dot = document.createElement('button');
        dot.className = 'slider__dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Слайд ${i + 1}`);
        dot.addEventListener('click', () => { index = i; render(); });
        navWrap.appendChild(dot);
      }
    }
    prev && prev.addEventListener('click', () => { index = index > 0 ? index - 1 : maxIndex(); render(); });
    next && next.addEventListener('click', () => { index = index < maxIndex() ? index + 1 : 0; render(); });

    slides.forEach((s) => { s.style.flex = `0 0 ${100 / perView}%`; });
    render();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        perView = slidesPerView(slider);
        slides.forEach((s) => { s.style.flex = `0 0 ${100 / perView}%`; });
        index = Math.min(index, maxIndex());
        render();
      }, 150);
    });

    if (slider.dataset.autoplay) {
      setInterval(() => { index = index < maxIndex() ? index + 1 : 0; render(); }, parseInt(slider.dataset.autoplay));
    }
  });
}

/* ---------- 7. ФИЛЬТРЫ КАТАЛОГА ---------- */
function initCatalogFilters() {
  const bar = document.querySelector('.js-filter-bar');
  const grid = document.querySelector('.js-catalog-grid');
  const search = document.querySelector('.js-catalog-search');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('[data-tags]'));
  let activeFilter = 'all';

  function apply() {
    const query = (search && search.value.trim().toLowerCase()) || '';
    let visibleCount = 0;
    cards.forEach((card) => {
      const tags = (card.dataset.tags || '').toLowerCase();
      const name = (card.dataset.name || card.textContent || '').toLowerCase();
      const matchFilter = activeFilter === 'all' || tags.split(',').includes(activeFilter);
      const matchSearch = query === '' || name.includes(query);
      const visible = matchFilter && matchSearch;
      card.hidden = !visible;
      if (visible) visibleCount++;
    });
    const emptyState = document.querySelector('.js-catalog-empty');
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }
  if (bar) {
    bar.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeFilter = btn.dataset.filter;
        apply();
      });
    });
  }
  if (search) search.addEventListener('input', apply);
  apply();
}

/* ---------- 8. КОНСТРУКТОР ЗАЯВКИ (localStorage) ---------- */
const ORDER_KEY = 'basslight_order_v1';

function getOrder() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_KEY)) || [];
  } catch (e) { return []; }
}
function setOrder(list) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(list));
  updateFabCount();
  renderOrderPanels();
}
function addToOrder(itemName) {
  const list = getOrder();
  if (!list.includes(itemName)) list.push(itemName);
  setOrder(list);
}
function removeFromOrder(itemName) {
  setOrder(getOrder().filter((i) => i !== itemName));
}
function clearOrder() {
  setOrder([]);
}
function updateFabCount() {
  const count = getOrder().length;
  document.querySelectorAll('.js-fab-count').forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
}
function renderOrderPanels() {
  const list = getOrder();
  document.querySelectorAll('.js-order-list').forEach((panel) => {
    panel.innerHTML = '';
    if (list.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'muted';
      empty.style.cssText = 'padding:9px 12px;font-size:13.5px;';
      empty.textContent = 'Список заявки пуст — добавьте позиции из каталога.';
      panel.appendChild(empty);
    }
    list.forEach((item) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = item;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Удалить «${item}» из заявки`);
      btn.textContent = '×';
      btn.addEventListener('click', () => removeFromOrder(item));
      li.appendChild(span);
      li.appendChild(btn);
      panel.appendChild(li);
    });
  });
  document.querySelectorAll('.js-order-need-field').forEach((field) => {
    if (!field.dataset.userEdited) {
      field.value = list.length ? list.map((i) => `— ${i}`).join('\n') : '';
    }
  });
}

function initOrderBuilder() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-add-to-order');
    if (!btn) return;
    const item = btn.dataset.item;
    if (!item) return;
    addToOrder(item);
    const original = btn.textContent;
    btn.textContent = 'Добавлено ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1400);
  });
  document.querySelectorAll('.js-clear-order').forEach((btn) => btn.addEventListener('click', clearOrder));
  document.querySelectorAll('.js-order-need-field').forEach((field) => {
    field.addEventListener('input', () => { field.dataset.userEdited = 'true'; });
  });
  updateFabCount();
  renderOrderPanels();
}

/* ---------- 9. МАСКА ТЕЛЕФОНА ---------- */
function initPhoneMasks() {
  document.querySelectorAll('.js-phone-mask').forEach((input) => {
    input.addEventListener('focus', () => { if (!input.value) input.value = '+375 ('; });
    input.addEventListener('input', () => {
      let digits = input.value.replace(/\D/g, '');
      if (digits.startsWith('375')) digits = digits.slice(3);
      digits = digits.slice(0, 9);
      let out = '+375';
      if (digits.length > 0) out += ' (' + digits.slice(0, 2);
      if (digits.length >= 2) out += ') ' + digits.slice(2, 5);
      if (digits.length >= 5) out += '-' + digits.slice(5, 7);
      if (digits.length >= 7) out += '-' + digits.slice(7, 9);
      input.value = out;
    });
    input.addEventListener('blur', () => { if (input.value === '+375 (') input.value = ''; });
  });
}

/* ---------- 10. ВАЛИДАЦИЯ И ОТПРАВКА ФОРМ ---------- */
function initForms() {
  document.querySelectorAll('.js-lead-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;
      submitForm(form);
    });
  });
}

function validateForm(form) {
  let firstInvalid = null;
  let valid = true;
  clearErrors(form);

  form.querySelectorAll('[required]').forEach((field) => {
    let ok = true;
    if (field.type === 'checkbox') ok = field.checked;
    else ok = field.value.trim() !== '';
    if (ok && field.classList.contains('js-phone-mask')) {
      ok = /^\+375 \(\d{2}\) \d{3}-\d{2}-\d{2}$/.test(field.value.trim());
    }
    if (!ok) {
      valid = false;
      showError(field, field.type === 'checkbox'
        ? 'Нужно подтвердить согласие'
        : field.classList.contains('js-phone-mask')
          ? 'Укажите телефон полностью: +375 (XX) XXX-XX-XX'
          : 'Заполните это поле');
      if (!firstInvalid) firstInvalid = field;
    }
  });

  if (!valid && firstInvalid) {
    firstInvalid.focus();
  }
  return valid;
}
function showError(field, message) {
  const wrap = field.closest('.field') || field.closest('.checkbox-field');
  if (!wrap) return;
  wrap.classList.add('has-error');
  let err = wrap.querySelector('.field-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'field-error';
    wrap.appendChild(err);
  }
  err.textContent = message;
}
function clearErrors(form) {
  form.querySelectorAll('.has-error').forEach((el) => el.classList.remove('has-error'));
}

function collectFormText(form) {
  const lines = [];
  Array.from(form.elements).forEach((field) => {
    if (!field.name || field.type === 'submit' || field.type === 'hidden') return;
    const label = fieldLabel(form, field);
    if (field.type === 'checkbox') {
      if (field.checked && label) lines.push(`${label}: да`);
      return;
    }
    if (!field.value || !field.value.trim()) return;
    lines.push(`${label || field.name}: ${field.value.trim()}`);
  });
  return lines.join('\n');
}
function fieldLabel(form, field) {
  if (field.id) {
    const lbl = form.querySelector(`label[for="${field.id}"]`);
    if (lbl) return lbl.textContent.replace('*', '').trim();
  }
  return field.dataset.label || '';
}

function submitForm(form) {
  const submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Отправляем…'; }

  const finish = () => {
    showSuccess(form);
    if (form.dataset.clearOrderOnSubmit === 'true') clearOrder();
    form.reset();
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.defaultText || 'Отправить заявку'; }
  };

  if (MODE === 'telegram') {
    const text = `Заявка с сайта Basslight Production:\n${collectFormText(form)}`;
    const tgLink = `${PRIMARY_MANAGER.tgLink}?text=${encodeURIComponent(text)}`;
    window.open(tgLink, '_blank', 'noopener');
    finish();
    return;
  }

  // MODE === 'formspree'
  const data = new FormData(form);
  fetch(FORM_ENDPOINT, {
    method: 'POST',
    body: data,
    headers: { Accept: 'application/json' },
  })
    .then((res) => {
      if (res.ok) { finish(); }
      else { alert('Не получилось отправить заявку. Попробуйте написать нам в Telegram.'); if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.defaultText || 'Отправить заявку'; } }
    })
    .catch(() => {
      alert('Не получилось отправить заявку. Попробуйте написать нам в Telegram.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.defaultText || 'Отправить заявку'; }
    });
}

function showSuccess(form) {
  const wrap = form.closest('.js-form-block') || form.parentElement;
  const success = wrap.querySelector('.js-form-success');
  form.style.display = 'none';
  if (success) success.classList.add('is-visible');
}

/* ---------- Год в подвале ---------- */
function initYear() {
  document.querySelectorAll('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });
}
