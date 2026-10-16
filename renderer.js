(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    const CrystalIcons = require('./icons.js');
    module.exports = factory(CrystalIcons);
  } else {
    root.CrystalDashboard = factory(root.CrystalIcons);
  }
})(typeof self !== 'undefined' ? self : this, function (CrystalIcons) {
  'use strict';

  function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    const clone = {};
    for (const key of Object.keys(obj)) {
      clone[key] = deepClone(obj[key]);
    }
    return clone;
  }

  function shiftDate(isoDateStr, dayOffset) {
    const d = new Date(isoDateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + dayOffset);
    return d;
  }

  function formatDate(d) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function formatFocusDate(d, prefix) {
    const fmt = new Intl.DateTimeFormat('zh-TW', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'UTC'
    }).format(d);
    return (prefix || '') + fmt.replace('週', '');
  }

  function safeText(str) {
    return str == null ? '' : String(str);
  }

  function glassOrb() {
    const orb = document.createElement('span');
    orb.className = 'cd-glass-orb';
    orb.setAttribute('aria-hidden', 'true');
    return orb;
  }

  function mount(root, config) {
    if (!root || !config) throw new Error('Root and config required');
    root.classList.add('crystal-dashboard');

    const seedConfig = deepClone(config);
    const weekCache = new Map();
    let weekOffset = 0;
    let currentDialog = null;
    let lastFocusedElement = null;
    let dialogSequence = 0;

    function moreButton(key, title, detail) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cd-btn-icon-only';
      button.dataset.focusKey = key;
      button.setAttribute('aria-label', `${title} ${(getWeekState(weekOffset).ui || {}).more || 'More'}`);
      button.appendChild(CrystalIcons.icon('more', 22));
      button.addEventListener('click', () => openDetailDialog(title, detail, button));
      return button;
    }

    function getWeekState(offset) {
      if (!weekCache.has(offset)) {
        weekCache.set(offset, deepClone(seedConfig));
      }
      return weekCache.get(offset);
    }

    function render() {
      const active = root.contains(document.activeElement) ? document.activeElement : null;
      const previousFocus = active && active.closest('.cd-dialog') ? lastFocusedElement : active;
      const focusKey = previousFocus && (previousFocus.dataset.testid || previousFocus.dataset.focusKey);
      const state = getWeekState(weekOffset);
      const ui = state.ui || {};
      const statusMessage = ({ loading: '正在讀取示意資料…', unknown: '未知｜示意來源狀態', error: '目前無法開啟來源。' })[state.previewStatus] || '';
      const baseStart = shiftDate(seedConfig.baseWeekStart || '2026-10-12', weekOffset * 7);
      const baseEnd = shiftDate(seedConfig.baseWeekStart || '2026-10-12', weekOffset * 7 + 6);
      const focusDate = shiftDate(seedConfig.baseFocusDate || '2026-10-14', weekOffset * 7);

      const weekRangeStr = `${baseStart.getUTCMonth() + 1}/${baseStart.getUTCDate()} - ${baseEnd.getUTCMonth() + 1}/${baseEnd.getUTCDate()}`;
      const weekLabelStr = weekOffset === 0 ? (ui.weekLabel || 'Current') : (ui.viewWeekLabel || 'Week') + ` (${weekOffset > 0 ? '+' : ''}${weekOffset})`;

      let totalHours = 0;
      if (state.focus && state.focus.items) {
        for (const item of state.focus.items) {
          totalHours += Number(item.hours) || 0;
        }
      }
      const totalHoursFormatted = totalHours.toFixed(1);

      let weeklyTotal = 0;
      let weeklyDone = 0;
      if (state.weeklyItems) {
        weeklyTotal = state.weeklyItems.length;
        weeklyDone = state.weeklyItems.filter(i => i.done).length;
      }

      let goalStepsTotal = 0;
      let goalStepsDone = 0;
      if (state.goals && state.goals.items) {
        for (const g of state.goals.items) {
          if (g.steps) {
            goalStepsTotal += g.steps.length;
            goalStepsDone += g.steps.filter(s => s.done).length;
          }
        }
      }

      const inboxCount = (state.inbox && state.inbox.length) || 0;

      root.innerHTML = '';
      const shell = document.createElement('div');
      shell.className = 'cd-shell';

      const sidebar = document.createElement('aside');
      sidebar.className = 'cd-sidebar';

      const brand = document.createElement('div');
      brand.className = 'cd-brand';
      const brandMark = document.createElement('span');
      brandMark.className = 'cd-brand-mark';
      brandMark.textContent = (state.brand && state.brand.mark) || 'C';
      const brandName = document.createElement('span');
      brandName.className = 'cd-brand-name';
      brandName.textContent = (state.brand && state.brand.name) || 'Crystal';
      brand.appendChild(brandMark);
      brand.appendChild(brandName);
      sidebar.appendChild(brand);

      const navList = document.createElement('ul');
      navList.className = 'cd-nav-list';
      if (state.nav) {
        for (const item of state.nav) {
          if (item.dividerBefore) {
            const div = document.createElement('li');
            div.className = 'cd-nav-divider';
            navList.appendChild(div);
          }
          const li = document.createElement('li');
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'cd-nav-btn';
          btn.dataset.focusKey = `nav-${item.id}`;
          btn.setAttribute('aria-label', item.label);
          btn.title = item.label;
          btn.appendChild(CrystalIcons.icon(item.icon || 'folder', 30));
          const lbl = document.createElement('span');
          lbl.className = 'cd-nav-label';
          lbl.textContent = item.label;
          btn.appendChild(lbl);
          btn.addEventListener('click', (e) => {
            openDetailDialog(item.label, item.detail || item.label, e.currentTarget);
          });
          li.appendChild(btn);
          navList.appendChild(li);
        }
      }
      sidebar.appendChild(navList);

      if (state.sourceStatus) {
        const statusBox = document.createElement('div');
        statusBox.className = 'cd-sidebar-status';
        for (const st of state.sourceStatus) {
          const stBtn = document.createElement('button');
          stBtn.type = 'button';
          stBtn.className = 'cd-status-item';
          stBtn.dataset.focusKey = `status-${st.label}`;
          const lblSpan = document.createElement('span');
          lblSpan.textContent = st.label;
          const valSpan = document.createElement('span');
          valSpan.className = 'cd-status-badge';
          valSpan.textContent = st.value;
          stBtn.appendChild(lblSpan);
          stBtn.appendChild(valSpan);
          stBtn.addEventListener('click', (e) => {
            openDetailDialog(st.label, `${st.label}: ${st.value}`, e.currentTarget);
          });
          statusBox.appendChild(stBtn);
        }
        sidebar.appendChild(statusBox);
      }
      shell.appendChild(sidebar);

      const main = document.createElement('main');
      main.className = 'cd-main';
      main.id = 'main-content';

      const headerGrid = document.createElement('div');
      headerGrid.className = 'cd-header-grid';

      const titleBlock = document.createElement('div');
      titleBlock.className = 'cd-title-block';
      if (state.eyebrow) {
        const eye = document.createElement('span');
        eye.className = 'cd-eyebrow';
        eye.textContent = state.eyebrow;
        titleBlock.appendChild(eye);
      }
      const h1 = document.createElement('h1');
      h1.className = 'cd-title';
      h1.textContent = state.title || 'Dashboard';
      titleBlock.appendChild(h1);
      if (state.subtitle) {
        const sub = document.createElement('p');
        sub.className = 'cd-subtitle';
        sub.textContent = state.subtitle;
        titleBlock.appendChild(sub);
      }
      headerGrid.appendChild(titleBlock);

      const headerRight = document.createElement('div');
      headerRight.className = 'cd-header-right';

      const toolbar = document.createElement('div');
      toolbar.className = 'cd-toolbar';

      const weekControls = document.createElement('div');
      weekControls.className = 'cd-week-controls';

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'cd-btn-nav';
      prevBtn.setAttribute('data-testid', 'previous-week');
      prevBtn.setAttribute('aria-label', ui.previousWeek || 'Previous Week');
      prevBtn.appendChild(CrystalIcons.icon('left', 16));
      prevBtn.addEventListener('click', () => {
        weekOffset -= 1;
        render();
      });
      weekControls.appendChild(prevBtn);

      const weekDisplay = document.createElement('span');
      weekDisplay.className = 'cd-week-display';
      weekDisplay.setAttribute('data-testid', 'week-range');
      weekDisplay.textContent = `${weekLabelStr} ${weekRangeStr}`;
      weekDisplay.prepend(CrystalIcons.icon('calendar', 22));
      weekControls.appendChild(weekDisplay);

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'cd-btn-nav';
      nextBtn.setAttribute('data-testid', 'next-week');
      nextBtn.setAttribute('aria-label', ui.nextWeek || 'Next Week');
      nextBtn.appendChild(CrystalIcons.icon('right', 16));
      nextBtn.addEventListener('click', () => {
        weekOffset += 1;
        render();
      });
      weekControls.appendChild(nextBtn);
      weekControls.insertBefore(weekDisplay, weekControls.firstChild);
      weekControls.insertBefore(prevBtn, nextBtn);
      toolbar.appendChild(weekControls);

      const demoBadge = document.createElement('span');
      demoBadge.className = 'cd-demo-badge';
      demoBadge.setAttribute('data-testid', 'demo-badge');
      demoBadge.textContent = state.demoLabel || 'Demo';
      toolbar.appendChild(demoBadge);
      headerRight.appendChild(toolbar);

      {
        const quote = state.quote || { label: '後設認知精選', text: '本週尚未選出後設認知精選。' };
        const quoteCard = document.createElement('div');
        quoteCard.className = 'cd-quote';
        quoteCard.dataset.hp2Panel = 'quote';
        const bulb = document.createElement('span');
        bulb.className = 'cd-quote-bulb';
        bulb.appendChild(CrystalIcons.icon('bulb', 36));
        quoteCard.appendChild(bulb);
        const quoteIcon = document.createElement('span');
        quoteIcon.className = 'cd-crystal-quote-open';
        quoteIcon.setAttribute('aria-hidden', 'true');
        quoteIcon.appendChild(CrystalIcons.icon('quote', 48));
        quoteCard.appendChild(quoteIcon);
        if (quote.label) {
          const qLbl = document.createElement('div');
          qLbl.className = 'cd-quote-label';
          qLbl.textContent = quote.label;
          quoteCard.appendChild(qLbl);
        }
        const qTxt = document.createElement('blockquote');
        qTxt.className = 'cd-quote-text';
        qTxt.textContent = quote.text || '';
        quoteCard.appendChild(qTxt);

        if (quote.linkLabel) {
          const qLink = document.createElement('button');
          qLink.type = 'button';
          qLink.className = 'cd-quote-link';
          qLink.dataset.focusKey = 'quote';
          qLink.textContent = quote.linkLabel;
          qLink.addEventListener('click', (e) => {
            openDetailDialog(quote.label || 'Quote', quote.detail || quote.text, e.currentTarget);
          });
          quoteCard.appendChild(qLink);
        }
        headerRight.appendChild(quoteCard);
      }
      headerGrid.appendChild(headerRight);
      main.appendChild(headerGrid);

      const summariesRow = document.createElement('div');
      summariesRow.className = 'cd-summaries-row';
      if (state.summaries) {
        for (const s of state.summaries) {
          const tile = document.createElement('button');
          tile.type = 'button';
          tile.className = 'cd-summary-tile';
          tile.dataset.hp2Panel = s.id === 'goals' ? 'goals-summary' : s.id;
          tile.dataset.focusKey = `summary-${s.id}`;
          const summaryIcon = document.createElement('span');
          summaryIcon.className = 'cd-summary-icon';
          summaryIcon.appendChild(CrystalIcons.icon(s.icon || 'check', 52));
          tile.appendChild(summaryIcon);
          const summaryCopy = document.createElement('div');
          summaryCopy.className = 'cd-summary-copy';
          if (s.id === 'goals') tile.setAttribute('data-testid', 'summary-goals');
          if (s.id === 'completed') tile.setAttribute('data-testid', 'summary-completed');

          const top = document.createElement('div');
          top.className = 'cd-summary-header';
          const titleSpan = document.createElement('span');
          titleSpan.className = 'cd-summary-title';
          titleSpan.textContent = s.label;
          top.appendChild(titleSpan);
          const arrow = document.createElement('span');
          arrow.className = 'cd-summary-arrow';
          arrow.appendChild(CrystalIcons.icon('right', 14));
          top.appendChild(arrow);
          summaryCopy.appendChild(top);

          let valText = '';
          if (s.kind === 'completed') {
            valText = `${weeklyDone} / ${weeklyTotal}`;
          } else if (s.kind === 'goals') {
            valText = goalStepsTotal ? `${goalStepsDone} / ${goalStepsTotal}` : '本週沒有小目標。';
          } else if (s.kind === 'inbox') {
            valText = String(inboxCount);
          } else {
            valText = safeText(s.value);
          }

          const body = document.createElement('div');
          body.className = 'cd-summary-body';
          const valSpan = document.createElement('span');
          valSpan.className = s.kind === 'goals' && !goalStepsTotal ? 'cd-data-status' : 'cd-summary-val';
          valSpan.textContent = `${safeText(s.prefix)}${valText}`;
          body.appendChild(valSpan);
          if (s.suffix && !(s.kind === 'goals' && !goalStepsTotal)) {
            const sufSpan = document.createElement('span');
            sufSpan.className = 'cd-summary-suffix';
            sufSpan.textContent = s.suffix;
            body.appendChild(sufSpan);
          }
          summaryCopy.appendChild(body);
          tile.appendChild(summaryCopy);

          tile.addEventListener('click', (e) => {
            const rows = s.kind === 'completed' ? state.weeklyItems : s.kind === 'inbox' ? state.inbox : null;
            const list = rows ? rows.map(item => `${item.done ? '✓ ' : '• '}${item.text}`).join('\n') : s.kind === 'goals' ? (state.goals.items || []).map(goal => `${goal.title}：${goal.steps.filter(step => step.done).length} / ${goal.steps.length}`).join('\n') : '';
            openDetailDialog(s.label, [s.detail || `${s.label}: ${valText}`, list].filter(Boolean).join('\n\n'), e.currentTarget);
          });
          summariesRow.appendChild(tile);
        }
      }
      main.appendChild(summariesRow);

      const upperGrid = document.createElement('div');
      upperGrid.className = 'cd-upper-grid';

      const focusCard = document.createElement('div');
      focusCard.className = 'cd-card cd-focus-card';
      focusCard.dataset.hp2Panel = 'focus';

      const focusHeader = document.createElement('div');
      focusHeader.className = 'cd-card-header';
      const fTitleGrp = document.createElement('div');
      fTitleGrp.className = 'cd-card-title-group';
      fTitleGrp.appendChild(CrystalIcons.icon((state.focus && state.focus.icon) || 'target', 28));
      const fTitle = document.createElement('h2');
      fTitle.className = 'cd-card-title';
      fTitle.textContent = (state.focus && state.focus.title) || 'Focus';
      fTitleGrp.appendChild(fTitle);
      focusHeader.appendChild(fTitleGrp);
      focusCard.appendChild(focusHeader);

      const focusMeta = document.createElement('div');
      focusMeta.className = 'cd-focus-header-meta';
      const dateSpan = document.createElement('span');
      dateSpan.textContent = formatFocusDate(focusDate, ui.focusDatePrefix);
      dateSpan.className = 'cd-focus-date';
      focusHeader.appendChild(dateSpan);
      const totSpan = document.createElement('span');
      totSpan.className = 'cd-focus-total';
      totSpan.setAttribute('data-testid', 'focus-total');
      totSpan.textContent = `${(state.focus && state.focus.totalLabel) || 'Total: '}${totalHoursFormatted} ${ui.hoursUnit || 'h'}`;
      focusMeta.appendChild(totSpan);

      const focusList = document.createElement('ul');
      focusList.className = 'cd-list';
      if (state.focus && state.focus.items) {
        for (const item of state.focus.items) {
          const li = document.createElement('li');
          li.className = 'cd-focus-row' + (item.carry ? ' cd-carry' : '');

          const left = document.createElement('div');
          left.className = 'cd-row-left';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.className = 'cd-checkbox';
          cb.checked = !!item.done;
          cb.setAttribute('data-testid', `focus-${item.id}`);
          cb.setAttribute('aria-label', item.text);
          cb.addEventListener('change', () => {
            item.done = cb.checked;
            render();
          });
          left.appendChild(cb);

          const txt = document.createElement('span');
          txt.className = 'cd-item-text';
          txt.textContent = `${item.category ? `（${item.category}）` : ''}${item.text}`;
          left.appendChild(txt);

          li.appendChild(left);

          const right = document.createElement('div');
          right.className = 'cd-row-right';
          const sel = document.createElement('select');
          sel.className = 'cd-select-hours';
          sel.setAttribute('data-testid', `hours-${item.id}`);
          sel.setAttribute('aria-label', `${item.text} ${ui.hoursUnit || 'hours'}`);
          const hoursOptions = [0.5, 1, 1.5, 2, 2.5, 3, 4, 6];
          for (const opt of hoursOptions) {
            const o = document.createElement('option');
            o.value = String(opt);
            o.textContent = `${opt.toFixed(1)} ${ui.hoursUnit || 'h'}`;
            if (Number(item.hours) === opt) o.selected = true;
            sel.appendChild(o);
          }
          sel.addEventListener('change', () => {
            item.hours = parseFloat(sel.value);
            render();
          });
          right.appendChild(sel);
          right.appendChild(moreButton(`focus-more-${item.id}`, item.text, `${item.text}\n${Number(item.hours).toFixed(1)} ${ui.hoursUnit || 'h'}`));
          li.appendChild(right);
          focusList.appendChild(li);
        }
      }
      focusCard.appendChild(focusList);
      focusCard.appendChild(focusMeta);
      upperGrid.appendChild(focusCard);

      const remindersStack = document.createElement('div');
      remindersStack.className = 'cd-reminders-stack';
      if (state.reminders) {
        for (const remGroup of state.reminders) {
          const rCard = document.createElement('div');
          rCard.className = 'cd-card cd-reminder-card';
          rCard.dataset.hp2Panel = remGroup.id;

          const rHeader = document.createElement('div');
          rHeader.className = 'cd-card-header';
          const rTitleGrp = document.createElement('div');
          rTitleGrp.className = 'cd-card-title-group';
          rTitleGrp.appendChild(CrystalIcons.icon(remGroup.icon || 'calendar', 26));
          const rTitle = document.createElement('h2');
          rTitle.className = 'cd-card-title';
          rTitle.textContent = remGroup.title;
          rTitleGrp.appendChild(rTitle);
          rHeader.appendChild(rTitleGrp);

          const rActions = document.createElement('div');
          rActions.className = 'cd-card-actions';
          const addBtn = document.createElement('button');
          addBtn.type = 'button';
          addBtn.className = 'cd-btn-add';
          addBtn.setAttribute('data-testid', `add-${remGroup.id}`);
          addBtn.appendChild(CrystalIcons.icon('plus', 14));
          const addSpan = document.createElement('span');
          addSpan.textContent = remGroup.addLabel || ui.add || 'Add';
          addBtn.appendChild(addSpan);
          addBtn.addEventListener('click', (e) => {
            openAddReminderDialog(remGroup, e.currentTarget);
          });
          rActions.appendChild(addBtn);
          rHeader.appendChild(rActions);
          rCard.appendChild(rHeader);

          const rList = document.createElement('ul');
          rList.className = 'cd-list';
          if (remGroup.items) {
            for (const rItem of remGroup.items) {
              const rLi = document.createElement('li');
              rLi.className = 'cd-reminder-item';

              const rLeft = document.createElement('div');
              rLeft.className = 'cd-row-left';
              const rCb = document.createElement('input');
              rCb.type = 'checkbox';
              rCb.className = 'cd-checkbox';
              rCb.checked = !!rItem.done;
              rCb.setAttribute('data-testid', `reminder-${remGroup.id}-${rItem.id}`);
              rCb.setAttribute('aria-label', rItem.text);
              rCb.addEventListener('change', () => {
                rItem.done = rCb.checked;
                render();
              });
              rLeft.appendChild(rCb);

              const rTxt = document.createElement('span');
              rTxt.className = 'cd-item-text';
              rTxt.textContent = rItem.text;
              rLeft.appendChild(rTxt);
              rLi.appendChild(rLeft);

              if (rItem.dayOffset != null || rItem.time) {
                const meta = document.createElement('span');
                meta.className = 'cd-reminder-meta';
                let metaStr = '';
                if (rItem.dayOffset != null) {
                  const d = shiftDate(seedConfig.baseWeekStart || '2026-10-12', weekOffset * 7 + rItem.dayOffset);
                  metaStr += `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
                }
                if (rItem.time) metaStr += ` ${rItem.time}`;
                meta.textContent = `（${metaStr.trim()}）`;
                rLeft.appendChild(meta);
              }
              rLi.appendChild(moreButton(`reminder-more-${remGroup.id}-${rItem.id}`, rItem.text, rItem.text));
              rList.appendChild(rLi);
            }
          }
          rCard.appendChild(rList);
          remindersStack.appendChild(rCard);
        }
      }
      upperGrid.appendChild(remindersStack);
      main.appendChild(upperGrid);

      const lowerGrid = document.createElement('div');
      lowerGrid.className = 'cd-lower-grid';

      const goalsCard = document.createElement('div');
      goalsCard.className = 'cd-card cd-goals-card';
      goalsCard.dataset.hp2Panel = 'goals';
      const gHeader = document.createElement('div');
      gHeader.className = 'cd-card-header';
      const gTitleGrp = document.createElement('div');
      gTitleGrp.className = 'cd-card-title-group';
      gTitleGrp.appendChild(CrystalIcons.icon((state.goals && state.goals.icon) || 'trophy', 28));
      const gTitle = document.createElement('h2');
      gTitle.className = 'cd-card-title';
      gTitle.textContent = (state.goals && state.goals.title) || 'Goals';
      gTitleGrp.appendChild(gTitle);
      gHeader.appendChild(gTitleGrp);

      const gActions = document.createElement('div');
      gActions.className = 'cd-card-actions';
      const addGoalBtn = document.createElement('button');
      addGoalBtn.type = 'button';
      addGoalBtn.className = 'cd-btn-add';
      addGoalBtn.setAttribute('data-testid', 'add-goal');
      addGoalBtn.appendChild(CrystalIcons.icon('plus', 14));
      const addGSpan = document.createElement('span');
      addGSpan.textContent = (state.goals && state.goals.addLabel) || ui.add || 'Add';
      addGoalBtn.appendChild(addGSpan);
      addGoalBtn.addEventListener('click', (e) => {
        openAddGoalDialog(e.currentTarget);
      });
      gActions.appendChild(addGoalBtn);
      gHeader.appendChild(gActions);
      goalsCard.appendChild(gHeader);

      const goalsList = document.createElement('ul');
      goalsList.className = 'cd-list';
      if (state.goals && state.goals.items) {
        for (const goal of state.goals.items) {
          const gLi = document.createElement('li');
          gLi.className = 'cd-goal-item';
          gLi.dataset.color = goal.color || 'violet';

          const topRow = document.createElement('div');
          topRow.className = 'cd-goal-top';
          topRow.appendChild(glassOrb());
          const gT = document.createElement('span');
          gT.className = 'cd-goal-title';
          gT.textContent = goal.title;
          topRow.appendChild(gT);
          if (goal.result) {
            const gRes = document.createElement('span');
            gRes.className = 'cd-goal-result';
            gRes.textContent = goal.result;
            topRow.appendChild(gRes);
          }
          gLi.appendChild(topRow);
          const description = document.createElement('div');
          description.className = 'cd-goal-description';
          description.textContent = goal.description || '';
          topRow.appendChild(description);
          const metric = document.createElement('div');
          metric.className = 'cd-goal-metric';
          if (topRow.querySelector('.cd-goal-result')) metric.appendChild(topRow.querySelector('.cd-goal-result'));
          const steps = goal.steps || [];
          const completed = steps.filter(step => step.done).length;
          const track = document.createElement('div');
          track.className = 'cd-progress-track';
          if (steps.length) track.setAttribute('role', 'progressbar');
          track.setAttribute('aria-label', goal.title);
          if (steps.length) {
            track.setAttribute('aria-valuemin', '0');
            track.setAttribute('aria-valuemax', String(steps.length));
            track.setAttribute('aria-valuenow', String(completed));
          }
          const fill = document.createElement('div');
          fill.className = 'cd-progress-fill';
          fill.style.width = `${steps.length ? completed / steps.length * 100 : 0}%`;
          track.appendChild(fill);
          metric.appendChild(track);
          const count = document.createElement('span');
          count.className = 'cd-goal-count';
          count.textContent = steps.length ? `${completed} / ${steps.length}` : '尚未設定小目標';
          metric.appendChild(count);
          gLi.appendChild(metric);

          if (goal.steps && goal.steps.length) {
            const stepBox = document.createElement('div');
            stepBox.className = 'cd-steps-inline';
            for (const step of goal.steps) {
              const sLbl = document.createElement('label');
              sLbl.className = 'cd-step-label';
              const sCb = document.createElement('input');
              sCb.type = 'checkbox';
              sCb.className = 'cd-checkbox';
              sCb.checked = !!step.done;
              sCb.setAttribute('data-testid', `goal-${goal.id}-${step.id}`);
              sCb.setAttribute('aria-label', step.text);
              sCb.addEventListener('change', () => {
                step.done = sCb.checked;
                render();
              });
              sLbl.appendChild(sCb);
              const sTxt = document.createElement('span');
              sTxt.textContent = step.text;
              sLbl.appendChild(sTxt);
              stepBox.appendChild(sLbl);
            }
            gLi.appendChild(stepBox);
          }
          gLi.appendChild(moreButton(`goal-more-${goal.id}`, goal.title, [goal.description, goal.result, ...steps.map(step => `${step.done ? '✓' : '□'} ${step.text}`)].filter(Boolean).join('\n')));
          goalsList.appendChild(gLi);
        }
      }
      goalsCard.appendChild(goalsList);
      lowerGrid.appendChild(goalsCard);

      const expCard = document.createElement('div');
      expCard.className = 'cd-card cd-experiments-card';
      expCard.dataset.hp2Panel = 'experiments';
      const eHeader = document.createElement('div');
      eHeader.className = 'cd-card-header';
      const eTitleGrp = document.createElement('div');
      eTitleGrp.className = 'cd-card-title-group';
      eTitleGrp.appendChild(CrystalIcons.icon((state.experiments && state.experiments.icon) || 'bulb', 28));
      const eTitle = document.createElement('h2');
      eTitle.className = 'cd-card-title';
      eTitle.textContent = (state.experiments && state.experiments.title) || 'Experiments';
      if (state.experiments && state.experiments.items) {
        const count = document.createElement('span');
        count.className = 'cd-experiment-count';
        count.textContent = `（${state.experiments.countLabel || ''} ${state.experiments.items.length} ${ui.activeExperimentsSuffix || ''}）`;
        eTitle.appendChild(count);
      }
      eTitleGrp.appendChild(eTitle);
      eHeader.appendChild(eTitleGrp);

      const eActions = document.createElement('div');
      eActions.className = 'cd-card-actions';
      const addExpBtn = document.createElement('button');
      addExpBtn.type = 'button';
      addExpBtn.className = 'cd-btn-add';
      addExpBtn.setAttribute('data-testid', 'add-experiment');
      addExpBtn.appendChild(CrystalIcons.icon('plus', 14));
      const addESpan = document.createElement('span');
      addESpan.textContent = (state.experiments && state.experiments.addLabel) || ui.add || 'Add';
      addExpBtn.appendChild(addESpan);
      addExpBtn.addEventListener('click', (e) => {
        openAddExperimentDialog(e.currentTarget);
      });
      eActions.appendChild(addExpBtn);
      eHeader.appendChild(eActions);
      expCard.appendChild(eHeader);

      const expList = document.createElement('ul');
      expList.className = 'cd-list';
      if (state.experiments && state.experiments.items) {
        for (const exp of state.experiments.items) {
          const eLi = document.createElement('li');
          eLi.className = 'cd-experiment-item';
          eLi.dataset.color = exp.color || 'violet';

          const topRow = document.createElement('div');
          topRow.className = 'cd-goal-top';
          topRow.appendChild(glassOrb());
          const eT = document.createElement('span');
          eT.className = 'cd-goal-title';
          eT.textContent = exp.title;
          topRow.appendChild(eT);
          if (exp.status) {
            const st = document.createElement('span');
            st.className = 'cd-exp-status';
            st.textContent = exp.status;
            topRow.appendChild(st);
          }
          eLi.appendChild(topRow);
          const description = document.createElement('div');
          description.className = 'cd-experiment-description';
          description.textContent = exp.description || '';
          eLi.appendChild(description);

          if (exp.steps && exp.steps.length) {
            const stepBox = document.createElement('div');
            stepBox.className = 'cd-steps-inline';
            for (const step of exp.steps) {
              const sLbl = document.createElement('label');
              sLbl.className = 'cd-step-label';
              const sCb = document.createElement('input');
              sCb.type = 'checkbox';
              sCb.className = 'cd-checkbox';
              sCb.checked = !!step.done;
              sCb.setAttribute('data-testid', `experiment-${exp.id}-${step.id}`);
              sCb.setAttribute('aria-label', step.text);
              sCb.addEventListener('change', () => {
                step.done = sCb.checked;
                render();
              });
              sLbl.appendChild(sCb);
              const sTxt = document.createElement('span');
              sTxt.textContent = step.text;
              sLbl.appendChild(sTxt);
              stepBox.appendChild(sLbl);
            }
            eLi.appendChild(stepBox);
          }
          eLi.appendChild(moreButton(`experiment-more-${exp.id}`, exp.title, [exp.description, exp.criterion].filter(Boolean).join('\n\n')));
          expList.appendChild(eLi);
        }
      }
      expCard.appendChild(expList);
      lowerGrid.appendChild(expCard);

      main.appendChild(lowerGrid);
      shell.appendChild(main);
      for (const list of main.querySelectorAll('.cd-list')) {
        if (statusMessage || !list.children.length) {
          const message = document.createElement('li');
          message.className = 'cd-data-status';
          message.textContent = statusMessage || '這個期間尚無示意項目。';
          list.replaceChildren(message);
        }
      }
      if (statusMessage) {
        for (const body of main.querySelectorAll('.cd-summary-body')) {
          const message = document.createElement('span');
          message.className = 'cd-data-status';
          message.textContent = statusMessage;
          body.replaceChildren(message);
        }
        main.querySelector('.cd-quote-text').textContent = statusMessage;
        main.querySelector('.cd-quote-link')?.remove();
        main.querySelector('.cd-focus-total').textContent = statusMessage;
        main.querySelector('.cd-experiment-count')?.remove();
        for (const control of main.querySelectorAll('.cd-summary-tile,.cd-btn-add')) control.disabled = true;
      }
      root.appendChild(shell);
      if (focusKey) {
        const replacement = Array.from(root.querySelectorAll('[data-testid],[data-focus-key]')).find(element => (element.dataset.testid || element.dataset.focusKey) === focusKey);
        if (replacement) replacement.focus({ preventScroll: true });
      }
    }

    function closeDialog() {
      if (currentDialog) {
        currentDialog.close();
        currentDialog.remove();
        currentDialog = null;
      }
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    function createBaseDialog(titleText, triggerEl) {
      closeDialog();
      lastFocusedElement = triggerEl || null;
      const dialog = document.createElement('dialog');
      dialog.className = 'cd-dialog';

      dialog.addEventListener('click', (e) => {
        const bounds = dialog.getBoundingClientRect();
        if (e.target === dialog && (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom)) closeDialog();
      });
      dialog.addEventListener('cancel', () => {
        closeDialog();
      });

      const header = document.createElement('div');
      header.className = 'cd-dialog-header';
      const t = document.createElement('h3');
      t.className = 'cd-dialog-title';
      t.id = `cd-dialog-title-${++dialogSequence}`;
      dialog.setAttribute('aria-labelledby', t.id);
      t.textContent = titleText;
      header.appendChild(t);

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'cd-btn-icon-only';
      const ui = getWeekState(weekOffset).ui || {};
      closeBtn.setAttribute('aria-label', ui.close || 'Close');
      closeBtn.appendChild(CrystalIcons.icon('close', 16));
      closeBtn.addEventListener('click', () => closeDialog());
      header.appendChild(closeBtn);
      dialog.appendChild(header);

      currentDialog = dialog;
      root.appendChild(dialog);
      return dialog;
    }

    function openDetailDialog(titleText, detailContent, triggerEl) {
      const dialog = createBaseDialog(titleText, triggerEl);
      const ui = getWeekState(weekOffset).ui || {};
      const p = document.createElement('p');
      p.style.fontSize = '14px';
      p.style.margin = '0 0 12px 0';
      p.textContent = detailContent;
      dialog.appendChild(p);

      if (ui.sampleNote) {
        const note = document.createElement('div');
        note.className = 'cd-note-box';
        note.textContent = ui.sampleNote;
        dialog.appendChild(note);
      }

      const actions = document.createElement('div');
      actions.className = 'cd-dialog-actions';
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'cd-btn-secondary';
      closeBtn.textContent = ui.close || 'Close';
      closeBtn.addEventListener('click', () => closeDialog());
      actions.appendChild(closeBtn);
      dialog.appendChild(actions);

      dialog.showModal();
      closeBtn.focus();
    }

    function openAddReminderDialog(remGroup, triggerEl) {
      const ui = getWeekState(weekOffset).ui || {};
      const dialog = createBaseDialog(remGroup.title, triggerEl);
      const form = document.createElement('form');
      form.className = 'cd-form';

      const field = document.createElement('div');
      field.className = 'cd-field';
      const lbl = document.createElement('label');
      lbl.className = 'cd-label';
      lbl.textContent = ui.titleLabel || 'Title';
      lbl.setAttribute('for', 'cd-field-reminder-title');
      const input = document.createElement('input');
      input.className = 'cd-input';
      input.id = 'cd-field-reminder-title';
      input.name = 'title';
      input.type = 'text';
      input.required = true;
      field.appendChild(lbl);
      field.appendChild(input);
      form.appendChild(field);

      const actions = document.createElement('div');
      actions.className = 'cd-dialog-actions';
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'cd-btn-secondary';
      cancelBtn.textContent = ui.cancel || 'Cancel';
      cancelBtn.addEventListener('click', () => closeDialog());
      actions.appendChild(cancelBtn);

      const saveBtn = document.createElement('button');
      saveBtn.type = 'submit';
      saveBtn.className = 'cd-btn-primary';
      saveBtn.setAttribute('aria-label', ui.save || 'Save');
      saveBtn.textContent = ui.save || 'Save';
      actions.appendChild(saveBtn);
      form.appendChild(actions);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = input.value.trim();
        if (!val) {
          input.focus();
          return;
        }
        if (!remGroup.items) remGroup.items = [];
        remGroup.items.push({
          id: 'rem_' + Date.now(),
          text: val,
          done: false
        });
        closeDialog();
        render();
      });

      dialog.appendChild(form);
      dialog.showModal();
      input.focus();
    }

    function openAddGoalDialog(triggerEl) {
      const state = getWeekState(weekOffset);
      const ui = state.ui || {};
      const dialog = createBaseDialog(ui.newGoalTitle || 'New Goal', triggerEl);
      const form = document.createElement('form');
      form.className = 'cd-form';

      const fTitle = document.createElement('div');
      fTitle.className = 'cd-field';
      const lTitle = document.createElement('label');
      lTitle.className = 'cd-label';
      lTitle.textContent = ui.titleLabel || 'Title';
      lTitle.setAttribute('for', 'cd-g-title');
      const iTitle = document.createElement('input');
      iTitle.className = 'cd-input';
      iTitle.id = 'cd-g-title';
      iTitle.name = 'title';
      iTitle.type = 'text';
      iTitle.required = true;
      fTitle.appendChild(lTitle);
      fTitle.appendChild(iTitle);
      form.appendChild(fTitle);

      const fDesc = document.createElement('div');
      fDesc.className = 'cd-field';
      const lDesc = document.createElement('label');
      lDesc.className = 'cd-label';
      lDesc.textContent = ui.descriptionLabel || 'Description';
      lDesc.setAttribute('for', 'cd-g-desc');
      const iDesc = document.createElement('input');
      iDesc.className = 'cd-input';
      iDesc.id = 'cd-g-desc';
      iDesc.name = 'description';
      iDesc.type = 'text';
      fDesc.appendChild(lDesc);
      fDesc.appendChild(iDesc);
      form.appendChild(fDesc);

      const fSteps = document.createElement('div');
      fSteps.className = 'cd-field';
      const lSteps = document.createElement('label');
      lSteps.className = 'cd-label';
      lSteps.textContent = ui.stepsLabel || 'Steps';
      lSteps.setAttribute('for', 'cd-g-steps');
      const iSteps = document.createElement('textarea');
      iSteps.className = 'cd-textarea';
      iSteps.id = 'cd-g-steps';
      iSteps.name = 'steps';
      iSteps.rows = 4;
      iSteps.required = true;
      fSteps.appendChild(lSteps);
      fSteps.appendChild(iSteps);
      form.appendChild(fSteps);

      const actions = document.createElement('div');
      actions.className = 'cd-dialog-actions';
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'cd-btn-secondary';
      cancelBtn.textContent = ui.cancel || 'Cancel';
      cancelBtn.addEventListener('click', () => closeDialog());
      actions.appendChild(cancelBtn);

      const saveBtn = document.createElement('button');
      saveBtn.type = 'submit';
      saveBtn.className = 'cd-btn-primary';
      saveBtn.setAttribute('aria-label', ui.save || 'Save');
      saveBtn.textContent = ui.save || 'Save';
      actions.appendChild(saveBtn);
      form.appendChild(actions);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const tVal = iTitle.value.trim();
        const sLines = iSteps.value.split('\n').map(l => l.trim()).filter(Boolean);
        if (!tVal) {
          iTitle.focus();
          return;
        }
        if (sLines.length === 0) {
          iSteps.focus();
          return;
        }
        if (!state.goals) state.goals = { items: [] };
        if (!state.goals.items) state.goals.items = [];

        const goalId = 'goal_' + Date.now();
        state.goals.items.push({
          id: goalId,
          title: tVal,
          description: iDesc.value.trim(),
          result: '',
          steps: sLines.map((sText, idx) => ({
            id: `s_${idx + 1}`,
            text: sText,
            done: false
          }))
        });
        closeDialog();
        render();
      });

      dialog.appendChild(form);
      dialog.showModal();
      iTitle.focus();
    }

    function openAddExperimentDialog(triggerEl) {
      const state = getWeekState(weekOffset);
      const ui = state.ui || {};
      const dialog = createBaseDialog(ui.newExperimentTitle || 'New Experiment', triggerEl);
      const form = document.createElement('form');
      form.className = 'cd-form';

      const fIdea = document.createElement('div');
      fIdea.className = 'cd-field';
      const lIdea = document.createElement('label');
      lIdea.className = 'cd-label';
      lIdea.textContent = ui.ideaLabel || 'Idea';
      lIdea.setAttribute('for', 'cd-e-idea');
      const sIdea = document.createElement('select');
      sIdea.className = 'cd-select';
      sIdea.id = 'cd-e-idea';
      sIdea.name = 'idea';
      sIdea.required = true;
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = '選取想法';
      placeholder.disabled = true;
      placeholder.selected = true;
      sIdea.appendChild(placeholder);
      if (state.ideas) {
        for (const idea of state.ideas) {
          const opt = document.createElement('option');
          opt.value = idea.id;
          opt.textContent = idea.title;
          sIdea.appendChild(opt);
        }
      }
      fIdea.appendChild(lIdea);
      fIdea.appendChild(sIdea);
      form.appendChild(fIdea);

      const fTrial = document.createElement('div');
      fTrial.className = 'cd-field';
      const lTrial = document.createElement('label');
      lTrial.className = 'cd-label';
      lTrial.textContent = ui.trialLabel || 'Trial';
      lTrial.setAttribute('for', 'cd-e-trial');
      const iTrial = document.createElement('input');
      iTrial.className = 'cd-input';
      iTrial.id = 'cd-e-trial';
      iTrial.name = 'trial';
      iTrial.type = 'text';
      iTrial.required = true;
      fTrial.appendChild(lTrial);
      fTrial.appendChild(iTrial);
      form.appendChild(fTrial);

      const fCrit = document.createElement('div');
      fCrit.className = 'cd-field';
      const lCrit = document.createElement('label');
      lCrit.className = 'cd-label';
      lCrit.textContent = ui.criterionLabel || 'Criterion';
      lCrit.setAttribute('for', 'cd-e-crit');
      const iCrit = document.createElement('input');
      iCrit.className = 'cd-input';
      iCrit.id = 'cd-e-crit';
      iCrit.name = 'criterion';
      iCrit.type = 'text';
      iCrit.required = true;
      fCrit.appendChild(lCrit);
      fCrit.appendChild(iCrit);
      form.appendChild(fCrit);

      const actions = document.createElement('div');
      actions.className = 'cd-dialog-actions';
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'cd-btn-secondary';
      cancelBtn.textContent = ui.cancel || 'Cancel';
      cancelBtn.addEventListener('click', () => closeDialog());
      actions.appendChild(cancelBtn);

      const saveBtn = document.createElement('button');
      saveBtn.type = 'submit';
      saveBtn.className = 'cd-btn-primary';
      saveBtn.setAttribute('aria-label', ui.save || 'Save');
      saveBtn.textContent = ui.save || 'Save';
      actions.appendChild(saveBtn);
      form.appendChild(actions);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedIdeaId = sIdea.value;
        if (!selectedIdeaId) { sIdea.focus(); return; }
        const trialText = iTrial.value.trim();
        const critText = iCrit.value.trim();
        if (!trialText) {
          iTrial.focus();
          return;
        }
        if (!critText) {
          iCrit.focus();
          return;
        }
        let ideaTitle = 'Experiment';
        if (state.ideas) {
          const found = state.ideas.find(i => i.id === selectedIdeaId);
          if (found) ideaTitle = found.title;
        }
        if (!state.experiments) state.experiments = { items: [] };
        if (!state.experiments.items) state.experiments.items = [];

        const expId = 'exp_' + Date.now();
        state.experiments.items.push({
          id: expId,
          title: ideaTitle,
          description: trialText,
          criterion: critText,
          ideaId: selectedIdeaId,
          status: ui.newExperimentStatus || 'Pending',
          steps: [{
            id: 'step_1',
            text: trialText,
            done: false
          }]
        });
        closeDialog();
        render();
      });

      dialog.appendChild(form);
      dialog.showModal();
      iTrial.focus();
    }

    render();

    return {
      destroy() {
        closeDialog();
        root.innerHTML = '';
        root.classList.remove('crystal-dashboard');
      },
      reset() {
        weekCache.clear();
        weekOffset = 0;
        closeDialog();
        render();
      },
      getState() {
        return {
          weekOffset,
          state: deepClone(getWeekState(weekOffset))
        };
      }
    };
  }

  return { mount };
});
