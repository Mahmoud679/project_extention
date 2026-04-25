// js/screen4.js
(function () {
  const toastEl = document.getElementById('screen4Toast');
  const statsGrid = document.getElementById('statsGrid');
  const historyList = document.getElementById('historyList');
  const historyEmpty = document.getElementById('historyEmpty');
  const historyCount = document.getElementById('historyCount');

  const searchInput = document.getElementById('searchInput');
  const shuffleFilter = document.getElementById('shuffleFilter');
  const sortBy = document.getElementById('sortBy');
  const clearBtn = document.getElementById('clearHistoryBtn');

  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.add('toast-show');
    setTimeout(() => {
      toastEl.classList.remove('toast-show');
      toastEl.hidden = true;
    }, 2200);
  }

  function safeParse(key, fallback){
    try { const v = JSON.parse(localStorage.getItem(key) || ''); return v ?? fallback; }
    catch { return fallback; }
  }

  function toHebShuffleLabel(type){
    if (type === 'questions') return 'ערבול שאלות';
    if (type === 'answers') return 'ערבול תשובות';
    if (type === 'both') return 'שאלות + תשובות';
    return '—';
  }

  function formatDate(iso){
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('he-IL');
  }

  let history = safeParse('examHistory', []);

  function renderStats(items){
    const total = items.length;
    const totalVersions = items.reduce((s,x) => s + (Number(x.versions) || 0), 0);
    const avgVersions = total ? (totalVersions / total).toFixed(1) : '0.0';

    const mostSubject = (() => {
      const m = items.reduce((acc,x) => {
        const k = (x.subject || 'ללא מקצוע').trim();
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {});
      let best = null;
      for (const k in m){ if (!best || m[k] > m[best]) best = k; }
      return best || '—';
    })();

    const cards = [
      { num: total, label: 'מבחנים בהיסטוריה' },
      { num: totalVersions, label: 'סה״כ גרסאות שנוצרו' },
      { num: avgVersions, label: 'ממוצע גרסאות למבחן' },
      { num: mostSubject, label: 'המקצוע הנפוץ ביותר' },
    ];

    statsGrid.innerHTML = cards.map(c => `
      <article class="stat">
        <p class="stat-num">${c.num}</p>
        <p class="stat-label">${c.label}</p>
      </article>
    `).join('');

    const counts = items.reduce((acc,x) => {
      const k = x.shuffleType || 'unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    const breakdown = [
      `ערבול שאלות: ${counts.questions || 0}`,
      `ערבול תשובות: ${counts.answers || 0}`,
      `שאלות+תשובות: ${counts.both || 0}`
    ].join(' • ');

    const wrap = document.createElement('div');
    wrap.style.gridColumn = '1 / -1';
    const p = document.createElement('p');
    p.className = 'muted small';
    p.style.margin = '10px 0 0';
    p.textContent = breakdown;
    wrap.appendChild(p);
    statsGrid.appendChild(wrap);
  }

  function renderHistory(items){
    historyCount.textContent = `סה״כ תוצאות: ${items.length}`;

    if (!items.length){
      historyEmpty.hidden = false;
      historyList.innerHTML = '';
      return;
    }

    historyEmpty.hidden = true;

    historyList.innerHTML = items.map((x, idx) => `
      <article class="history-item" data-id="${x.id}">
        <div class="history-top">
          <div>
            <h3 class="history-title">${x.subject || 'ללא מקצוע'}</h3>
            <p class="muted small m-0">כיתה: ${x.grade || '—'} • ${toHebShuffleLabel(x.shuffleType)} • גרסאות: ${x.versions || '—'}</p>
            <p class="muted small m-0">קובץ: ${x.pdfName || 'PDF (דמו)'} • תאריך: ${formatDate(x.createdAt)}</p>
          </div>
          <div class="history-actions">
            <button class="btn btn-ghost btn-sm view-btn" type="button" data-id="${x.id}">צפייה</button>
            <button class="btn btn-ghost btn-sm delete-btn" type="button" data-id="${x.id}">מחיקה</button>
          </div>
        </div>
        <div class="history-mini">
          <span class="chip chip-soft">#${idx + 1}</span>
          <span class="chip chip-soft">מקור: ${x.fromHome || '—'}</span>
          <span class="chip chip-soft">שאלות (דמו): ${x.qCount || 0}</span>
        </div>
      </article>
    `).join('');
  }

  function applyFilters(){
    const q = (searchInput.value || '').trim().toLowerCase();
    const sf = shuffleFilter.value;
    const sort = sortBy.value;

    let items = [...history];

    if (sf !== 'all') items = items.filter(x => (x.shuffleType || '') === sf);

    if (q){
      items = items.filter(x => `${x.subject||''} ${x.grade||''} ${x.pdfName||''}`.toLowerCase().includes(q));
    }

    if (sort === 'newest') items.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === 'oldest') items.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sort === 'subject') items.sort((a,b) => (a.subject||'').localeCompare((b.subject||''), 'he'));
    if (sort === 'versions') items.sort((a,b) => (Number(b.versions)||0) - (Number(a.versions)||0));

    renderStats(items);
    renderHistory(items);
  }

  if (window.jQuery){
    $('#searchInput, #shuffleFilter, #sortBy').on('input change', applyFilters);

    $(document).on('click', '.delete-btn', function(){
      const id = $(this).attr('data-id');
      history = history.filter(x => String(x.id) !== String(id));
      localStorage.setItem('examHistory', JSON.stringify(history));
      showToast('נמחק מההיסטוריה 🗑️');
      applyFilters();
    });

    $(document).on('click', '.view-btn', function(){
      const id = $(this).attr('data-id');
      localStorage.setItem('selectedExamId', String(id));
      showToast('נבחר מבחן לצפייה ✅');
      window.location.href = 'screen3.html';
    });
  }

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem('examHistory');
    history = [];
    showToast('ההיסטוריה נוקתה ✅');
    applyFilters();
  });

  applyFilters();
})();
