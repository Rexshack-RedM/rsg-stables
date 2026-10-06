(function () {
  // Localised UI strings. English defaults; replaced by the client via the 'setLocale' message (locales/*.json, ui_* keys)
  const I18N = {
    "ui_stable": "Stable",
    "ui_back": "Back",
    "ui_close": "Close",
    "ui_prev_style": "Previous style (←)",
    "ui_next_style": "Next style (→)",
    "ui_tack_hint": "← / → cycle styles  •  ↑ / ↓ or Enter next category",
    "ui_rotate_zoom_hint": "A / D rotate • Scroll to zoom",
    "ui_total_spend": "Total Spend: $%s",
    "ui_insufficient_funds": "Insufficient Funds",
    "ui_prev_category": "❮ Category",
    "ui_next_category": "Next Category ❯",
    "ui_review_apply": "Review & Apply ➔",
    "ui_input": "Input",
    "ui_cancel": "Cancel",
    "ui_confirm": "Confirm",
    "ui_notice": "Notice",
    "ui_understood": "Understood",
    "ui_horse_stats": "Horse Stats"
  };
  function t(key, ...args) {
    let s = I18N[key] !== undefined ? String(I18N[key]) : key;
    args.forEach((a) => { s = s.replace('%s', a); });
    return s;
  }
  function applyStaticLocale() {
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  }

  const appEl = document.getElementById('app');
  const panelEl = document.getElementById('panel');
  const panelTitleEl = document.getElementById('panelTitle');
  const panelSubtitleEl = document.getElementById('panelSubtitle');
  const optionsListEl = document.getElementById('optionsList');
  const panelHintEl = document.getElementById('panelHint');
  const backBtn = document.getElementById('backBtn');
  const closeBtn = document.getElementById('closeBtn');

  const inputModal = document.getElementById('inputModal');
  const inputTitle = document.getElementById('inputTitle');
  const inputField = document.getElementById('inputField');
  const inputSubmitBtn = document.getElementById('inputSubmitBtn');
  const inputCancelBtn = document.getElementById('inputCancelBtn');

  const alertModal = document.getElementById('alertModal');
  const alertHeader = document.getElementById('alertHeader');
  const alertContent = document.getElementById('alertContent');
  const alertOkBtn = document.getElementById('alertOkBtn');

  const statsModal = document.getElementById('statsModal');
  const statsHeader = document.getElementById('statsHeader');
  const statsList = document.getElementById('statsList');
  const statsOkBtn = document.getElementById('statsOkBtn');

  const tackPickerEl = document.getElementById('tackPicker');
  const tackCategoryDotsEl = document.getElementById('tackCategoryDots');
  const tackStyleNameEl = document.getElementById('tackStyleName');
  const tackStyleMetaEl = document.getElementById('tackStyleMeta');
  const tackStyleIndexEl = document.getElementById('tackStyleIndex');
  const tackPrevStyleBtn = document.getElementById('tackPrevStyle');
  const tackNextStyleBtn = document.getElementById('tackNextStyle');
  const tackPrevCategoryBtn = document.getElementById('tackPrevCategory');
  const tackNextCategoryBtn = document.getElementById('tackNextCategory');
  const tackCostTotalEl = document.getElementById('tackCostTotal');

  // 'list' for the generic option-list screen, 'tackPicker' for the arrow-cycling tack style
  // screen. Drives which element is visible and how Left/Right/Up/Down keys are interpreted.
  let activeScreen = 'list';

  const resourceName = (typeof GetParentResourceName === 'function') ? GetParentResourceName() : 'rsg-stables';

  function post(name, data) {
    return fetch(`https://${resourceName}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(data || {}),
    }).catch(() => {});
  }

  const ICONS = {
    dollar: '$', heart: '♥', foal: 'F', horse: 'H', pen: '✎',
    shield: 'S', route: '⇄', medkit: '+', retrieve: '↑', shirt: '↻',
    xmark: '✕', filter: '⧩',
  };

  function iconGlyph(key) {
    return ICONS[key] || '✦';
  }

  function showApp() {
    appEl.classList.remove('hidden');
  }

  function hideAll() {
    appEl.classList.add('hidden');
    panelEl.classList.add('hidden');
    inputModal.classList.add('hidden');
    alertModal.classList.add('hidden');
    statsModal.classList.add('hidden');
    tackPickerEl.classList.add('hidden');
    panelHintEl.classList.add('hidden');
    activeScreen = 'list';
  }

  function closeModals() {
    inputModal.classList.add('hidden');
    alertModal.classList.add('hidden');
    statsModal.classList.add('hidden');
  }

  function renderScreen(screen) {
    closeModals();
    showApp();
    panelEl.classList.remove('hidden');
    activeScreen = 'list';
    tackPickerEl.classList.add('hidden');
    optionsListEl.classList.remove('hidden');

    panelTitleEl.textContent = screen.title || '';
    panelSubtitleEl.textContent = screen.subtitle || '';

    if (screen.hint) {
      panelHintEl.textContent = screen.hint;
      panelHintEl.classList.remove('hidden');
    } else {
      panelHintEl.classList.add('hidden');
    }

    if (screen.backId) {
      backBtn.classList.remove('hidden');
      backBtn.onclick = () => post('select', { id: screen.backId });
    } else {
      backBtn.classList.add('hidden');
      backBtn.onclick = null;
    }

    optionsListEl.innerHTML = '';
    (screen.options || []).forEach((opt) => {
      const row = document.createElement('div');
      row.className = 'option-row' + (opt.disabled ? ' disabled' : '') + (opt.variant ? ' variant-' + opt.variant : '');

      const icon = document.createElement('div');
      icon.className = 'option-icon';
      icon.textContent = iconGlyph(opt.icon);
      row.appendChild(icon);

      const body = document.createElement('div');
      body.className = 'option-body';

      const title = document.createElement('div');
      title.className = 'option-title';
      title.textContent = opt.title || '';
      body.appendChild(title);

      if (opt.description) {
        const desc = document.createElement('div');
        desc.className = 'option-desc';
        desc.textContent = opt.description;
        body.appendChild(desc);
      }

      if (opt.stats && opt.stats.length) {
        const statsWrap = document.createElement('div');
        statsWrap.className = 'option-stats';

        opt.stats.forEach((stat) => {
          const max = Number(stat.max) || 5;
          const value = Math.max(0, Math.min(max, Number(stat.value) || 0));
          const pct = max > 0 ? (value / max) * 100 : 0;

          const statRow = document.createElement('div');
          statRow.className = 'option-stat';

          const label = document.createElement('span');
          label.className = 'option-stat-label';
          label.textContent = stat.label || '';
          statRow.appendChild(label);

          const track = document.createElement('div');
          track.className = 'option-stat-track';

          const fill = document.createElement('div');
          fill.className = `option-stat-fill ${barColorClass(pct)}`;
          fill.style.width = `${pct}%`;
          track.appendChild(fill);

          statRow.appendChild(track);
          statsWrap.appendChild(statRow);
        });

        body.appendChild(statsWrap);
      }
      row.appendChild(body);

      if (opt.badge) {
        const badge = document.createElement('div');
        badge.className = 'option-badge';
        badge.textContent = opt.badge;
        row.appendChild(badge);
      }

      if (!opt.disabled) {
        row.addEventListener('click', () => post('select', { id: opt.id }));
      }

      optionsListEl.appendChild(row);
    });
  }

  function renderTackPicker(data) {
    closeModals();
    showApp();
    panelEl.classList.remove('hidden');
    activeScreen = 'tackPicker';
    optionsListEl.classList.add('hidden');
    tackPickerEl.classList.remove('hidden');

    panelTitleEl.textContent = `${data.title || ''} (${data.categoryIndex}/${data.categoryCount})`;
    panelSubtitleEl.textContent = data.subtitle || '';

    panelHintEl.textContent = t('ui_rotate_zoom_hint');
    panelHintEl.classList.remove('hidden');

    backBtn.classList.remove('hidden');
    backBtn.onclick = () => post('tackCategoryNav', { dir: 'prev' });

    tackCategoryDotsEl.innerHTML = '';
    for (let i = 1; i <= data.categoryCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'tack-dot' + (i === data.categoryIndex ? ' active' : i < data.categoryIndex ? ' done' : '');
      tackCategoryDotsEl.appendChild(dot);
    }

    tackStyleNameEl.textContent = data.styleLabel || '';
    tackStyleMetaEl.textContent = data.styleMeta || '';
    tackStyleIndexEl.textContent = `${data.styleIndex} / ${data.styleCount}`;

    const total = data.costTotal || 0;
    tackCostTotalEl.textContent = data.canAfford
      ? t('ui_total_spend', total)
      : `${t('ui_total_spend', total)} — ${t('ui_insufficient_funds')}`;
    tackCostTotalEl.classList.toggle('affordable', !!data.canAfford);
    tackCostTotalEl.classList.toggle('over-budget', !data.canAfford);

    tackNextCategoryBtn.textContent = data.isLast ? t('ui_review_apply') : t('ui_next_category');
  }

  tackPrevStyleBtn.addEventListener('click', () => post('tackCycle', { dir: 'left' }));
  tackNextStyleBtn.addEventListener('click', () => post('tackCycle', { dir: 'right' }));
  tackPrevCategoryBtn.addEventListener('click', () => post('tackCategoryNav', { dir: 'prev' }));
  tackNextCategoryBtn.addEventListener('click', () => post('tackCategoryNav', { dir: 'next' }));

  function showInputDialog(data) {
    showApp();
    closeModals();
    inputTitle.textContent = data.title || t('ui_input');
    inputField.placeholder = data.placeholder || '';
    inputField.maxLength = data.maxLength || 40;
    inputField.value = '';
    inputModal.classList.remove('hidden');
    setTimeout(() => inputField.focus(), 30);
  }

  function submitInput() {
    if (inputModal.classList.contains('hidden')) return;
    const value = inputField.value.trim();
    inputModal.classList.add('hidden');
    post('inputSubmit', { value });
  }

  function cancelInput() {
    if (inputModal.classList.contains('hidden')) return;
    inputModal.classList.add('hidden');
    post('inputCancel', {});
  }

  function showAlertDialog(data) {
    showApp();
    closeModals();
    alertHeader.textContent = data.header || t('ui_notice');
    alertContent.textContent = data.content || '';
    alertModal.classList.remove('hidden');
    setTimeout(() => alertOkBtn.focus(), 30);
  }

  function closeAlert() {
    if (alertModal.classList.contains('hidden')) return;
    alertModal.classList.add('hidden');
    post('alertClose', {});
  }

  // data = { header, stats: [{ label, value (0-100), suffix }] }. Renders each stat as a
  // labelled progress bar instead of a plain-text percentage, colour-coded green/amber/red by
  // how full it is so a glance at Horse Stats tells you what needs attention.
  function barColorClass(value) {
    if (value <= 20) return 'stat-bad';
    if (value <= 50) return 'stat-warn';
    return 'stat-good';
  }

  function showStatsDialog(data) {
    showApp();
    closeModals();
    statsHeader.textContent = data.header || t('ui_horse_stats');

    statsList.innerHTML = '';
    (data.stats || []).forEach((stat) => {
      const value = Math.max(0, Math.min(100, Number(stat.value) || 0));

      const row = document.createElement('div');
      row.className = 'stat-row';

      const top = document.createElement('div');
      top.className = 'stat-row-top';

      const label = document.createElement('span');
      label.className = 'stat-label';
      label.textContent = stat.label || '';
      top.appendChild(label);

      const val = document.createElement('span');
      val.className = 'stat-value';
      val.textContent = `${Math.round(value)}${stat.suffix || '%'}`;
      top.appendChild(val);

      row.appendChild(top);

      const track = document.createElement('div');
      track.className = 'stat-bar-track';

      const fill = document.createElement('div');
      fill.className = `stat-bar-fill ${barColorClass(value)}`;
      fill.style.width = `${value}%`;
      track.appendChild(fill);

      row.appendChild(track);
      statsList.appendChild(row);
    });

    statsModal.classList.remove('hidden');
    setTimeout(() => statsOkBtn.focus(), 30);
  }

  function closeStats() {
    if (statsModal.classList.contains('hidden')) return;
    statsModal.classList.add('hidden');
    post('statsClose', {});
  }

  inputSubmitBtn.addEventListener('click', submitInput);
  inputCancelBtn.addEventListener('click', cancelInput);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitInput();
    if (e.key === 'Escape') cancelInput();
  });

  alertOkBtn.addEventListener('click', closeAlert);
  statsOkBtn.addEventListener('click', closeStats);
  closeBtn.addEventListener('click', () => post('close', {}));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!inputModal.classList.contains('hidden')) {
        cancelInput();
      } else if (!alertModal.classList.contains('hidden')) {
        closeAlert();
      } else if (!statsModal.classList.contains('hidden')) {
        closeStats();
      } else if (!panelEl.classList.contains('hidden')) {
        post('close', {});
      }
      return;
    }

    if (e.repeat) return;
    if (inputField === document.activeElement) return;

    // On the tack style picker, Left/Right cycle styles and Up/Down/Enter move
    // between categories instead of rotating the preview camera.
    if (activeScreen === 'tackPicker') {
      if (e.key === 'ArrowLeft') {
        post('tackCycle', { dir: 'left' });
      } else if (e.key === 'ArrowRight') {
        post('tackCycle', { dir: 'right' });
      } else if (e.key === 'ArrowUp') {
        post('tackCategoryNav', { dir: 'prev' });
      } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
        post('tackCategoryNav', { dir: 'next' });
      } else if (e.key === 'a' || e.key === 'A') {
        post('rotateCam', { dir: 'left' });
      } else if (e.key === 'd' || e.key === 'D') {
        post('rotateCam', { dir: 'right' });
      }
      return;
    }

    // Relay rotate-preview keys to Lua. NUI focus swallows keyboard input
    // before the game's own control system ever sees it, so the horse
    // customization preview camera rotation is driven from here instead.
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
      post('rotateCam', { dir: 'left' });
    } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
      post('rotateCam', { dir: 'right' });
    }
  });

  document.addEventListener('keyup', (e) => {
    if (activeScreen === 'tackPicker') {
      if (e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
        post('rotateCam', { dir: null });
      }
      return;
    }
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft'
      || e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
      post('rotateCam', { dir: null });
    }
  });

  // Relay mouse-wheel zoom the same way — NUI focus eats it before the game
  // ever sees a scroll event, so the preview camera zoom is driven from here.
  document.addEventListener('wheel', (e) => {
    if (panelEl.classList.contains('hidden')) return;
    post('zoomCam', { dir: e.deltaY > 0 ? 1 : -1 });
  }, { passive: true });

  // If the NUI loses focus while A/D is held down (alt-tab, a game overlay stealing focus,
  // etc.), no keyup ever fires and the camera would otherwise spin forever until the same key
  // is pressed again. Clear the rotate state whenever the window/document loses focus.
  window.addEventListener('blur', () => post('rotateCam', { dir: null }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) post('rotateCam', { dir: null });
  });

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !data.action) return;

    switch (data.action) {
      case 'render':
        renderScreen(data.screen);
        break;
      case 'tackPicker':
        renderTackPicker(data);
        break;
      case 'inputDialog':
        showInputDialog(data);
        break;
      case 'alertDialog':
        showAlertDialog(data);
        break;
      case 'statsDialog':
        showStatsDialog(data);
        break;
      case 'hide':
        hideAll();
        break;
      case 'setLocale':
        Object.assign(I18N, data.strings || {});
        applyStaticLocale();
        break;
      default:
        break;
    }
  });

  applyStaticLocale();
  hideAll();
})();
