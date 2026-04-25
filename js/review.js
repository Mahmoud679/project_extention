(function () {
  const STORAGE_MISTAKES = 'examixMistakes';
  const STORAGE_REVIEW_QUEUE = 'examixReviewQueue';

  const statsEl = document.getElementById('reviewStats');
  const listEl = document.getElementById('reviewList');
  const emptyEl = document.getElementById('reviewEmpty');
  const countEl = document.getElementById('reviewCount');
  const toastEl = document.getElementById('reviewToast');

  const searchEl = document.getElementById('reviewSearch');
  const subjectEl = document.getElementById('reviewSubject');
  const statusEl = document.getElementById('reviewStatus');
  const sortEl = document.getElementById('reviewSort');

  const practiceSelectedBtn = document.getElementById('practiceSelectedBtn');
  const clearMasteredBtn = document.getElementById('clearMasteredBtn');
  const clearAllMistakesBtn = document.getElementById('clearAllMistakesBtn');

  let mistakes = readMistakes();
  let currentView = [];

  function readMistakes() {
    try { return JSON.parse(localStorage.getItem(STORAGE_MISTAKES) || '[]'); }
    catch { return []; }
  }

  function saveMistakes() {
    localStorage.setItem(STORAGE_MISTAKES, JSON.stringify(mistakes));
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.add('toast-show');
    setTimeout(() => {
      toastEl.classList.remove('toast-show');
      toastEl.hidden = true;
    }, 2200);
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('he-IL');
  }

  function subjectLabel(key) {
    const names = { history: 'היסטוריה', math: 'מתמטיקה', general: 'ידע כללי' };
    return names[key] || key || 'ללא מקצוע';
  }

  function populateSubjects() {
    const selected = subjectEl.value || 'all';
    const subjects = [...new Set(mistakes.map(m => m.subject).filter(Boolean))];
    subjectEl.innerHTML = '<option value="all">כל המקצועות</option>' +
      subjects.map(s => `<option value="${s}">${subjectLabel(s)}</option>`).join('');
    subjectEl.value = subjects.includes(selected) ? selected : 'all';
  }

  function getWeakestSubject(openOnly) {
    const data = openOnly ? mistakes.filter(m => !m.mastered) : mistakes;
    const counts = data.reduce((acc, m) => {
      acc[m.subject] = (acc[m.subject] || 0) + Number(m.timesWrong || 1);
      return acc;
    }, {});
    let best = '—';
    let max = 0;
    Object.keys(counts).forEach(subject => {
      if (counts[subject] > max) {
        max = counts[subject];
        best = subjectLabel(subject);
      }
    });
    return best;
  }

  function renderStats() {
    const total = mistakes.length;
    const open = mistakes.filter(m => !m.mastered).length;
    const mastered = mistakes.filter(m => m.mastered).length;
    const repeated = mistakes.filter(m => Number(m.timesWrong || 1) > 1).length;

    const cards = [
      { num: total, label: 'סה״כ טעויות שנשמרו' },
      { num: open, label: 'טעויות פתוחות לתרגול' },
      { num: mastered, label: 'טעויות שסומנו כנלמדו' },
      { num: getWeakestSubject(true), label: 'המקצוע החלש כרגע' },
      { num: repeated, label: 'טעויות שחזרו יותר מפעם אחת' }
    ];

    statsEl.innerHTML = cards.map(c => `
      <article class="stat">
        <p class="stat-num">${c.num}</p>
        <p class="stat-label">${c.label}</p>
      </article>
    `).join('');
  }

  function applyFilters() {
    const q = searchEl.value.trim().toLowerCase();
    const subject = subjectEl.value;
    const status = statusEl.value;
    const sort = sortEl.value;

    let items = [...mistakes];

    if (subject !== 'all') items = items.filter(m => m.subject === subject);
    if (status === 'open') items = items.filter(m => !m.mastered);
    if (status === 'mastered') items = items.filter(m => m.mastered);

    if (q) {
      items = items.filter(m => `${m.question} ${m.userAnswer} ${m.correctAnswer} ${m.explanation}`.toLowerCase().includes(q));
    }

    if (sort === 'newest') items.sort((a, b) => new Date(b.lastWrongAt || b.createdAt) - new Date(a.lastWrongAt || a.createdAt));
    if (sort === 'mostWrong') items.sort((a, b) => Number(b.timesWrong || 1) - Number(a.timesWrong || 1));
    if (sort === 'subject') items.sort((a, b) => subjectLabel(a.subject).localeCompare(subjectLabel(b.subject), 'he'));

    currentView = items;
    renderStats();
    renderList(items);
  }

  function renderList(items) {
    countEl.textContent = `מוצגות ${items.length} טעויות מתוך ${mistakes.length}`;

    if (!items.length) {
      listEl.innerHTML = '';
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;
    listEl.innerHTML = items.map((m, index) => `
      <article class="review-card ${m.mastered ? 'mastered' : ''}" data-id="${m.id}">
        <div class="history-top">
          <div>
            <h3 class="history-title">${index + 1}. ${m.question}</h3>
            <div class="review-meta">
              <span class="chip">${subjectLabel(m.subject)}</span>
              <span class="chip chip-soft">טעית ${m.timesWrong || 1} פעמים</span>
              <span class="chip chip-soft">${m.mastered ? 'נלמד' : 'פתוח לתרגול'}</span>
              <span class="chip chip-soft">עודכן: ${formatDate(m.lastWrongAt || m.createdAt)}</span>
            </div>
          </div>
          <div class="history-actions">
            <button class="btn btn-ghost btn-sm toggle-mastered" type="button" data-id="${m.id}">${m.mastered ? 'פתח שוב' : 'סמן כנלמד'}</button>
            <button class="btn btn-ghost btn-sm practice-one" type="button" data-id="${m.id}">תרגל</button>
            <button class="btn btn-ghost btn-sm delete-mistake" type="button" data-id="${m.id}">מחק</button>
          </div>
        </div>

        <div class="answer-compare">
          <div class="answer-box answer-wrong">
            <strong>התשובה שלך</strong>
            <span>${m.userAnswer}</span>
          </div>
          <div class="answer-box answer-correct">
            <strong>התשובה הנכונה</strong>
            <span>${m.correctAnswer}</span>
          </div>
        </div>

        <p class="muted"><strong>הסבר:</strong> ${m.explanation}</p>
      </article>
    `).join('');
  }

  function buildPracticeQueue(items) {
    return items.map(m => ({
      id: m.id,
      subject: m.subject,
      question: m.question,
      answers: m.answers,
      correctIndex: m.correctIndex,
      explanation: m.explanation
    }));
  }

  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.toggle-mastered');
    const del = e.target.closest('.delete-mistake');
    const one = e.target.closest('.practice-one');

    if (toggle) {
      const id = toggle.dataset.id;
      const item = mistakes.find(m => String(m.id) === String(id));
      if (item) {
        item.mastered = !item.mastered;
        if (item.mastered) item.masteredAt = new Date().toISOString();
        saveMistakes();
        showToast(item.mastered ? 'סומן כנלמד ✅' : 'הוחזר לתרגול');
        applyFilters();
      }
    }

    if (del) {
      const id = del.dataset.id;
      mistakes = mistakes.filter(m => String(m.id) !== String(id));
      saveMistakes();
      populateSubjects();
      showToast('הטעות נמחקה');
      applyFilters();
    }

    if (one) {
      const id = one.dataset.id;
      const item = mistakes.find(m => String(m.id) === String(id));
      if (!item) return;
      localStorage.setItem(STORAGE_REVIEW_QUEUE, JSON.stringify(buildPracticeQueue([item])));
      window.location.href = 'practice.html';
    }
  });

  [searchEl, subjectEl, statusEl, sortEl].forEach(el => {
    el.addEventListener('input', applyFilters);
    el.addEventListener('change', applyFilters);
  });

  practiceSelectedBtn.addEventListener('click', () => {
    const openItems = currentView.filter(m => !m.mastered);
    if (!openItems.length) {
      showToast('אין טעויות בתצוגה הנוכחית');
      return;
    }
    localStorage.setItem(STORAGE_REVIEW_QUEUE, JSON.stringify(buildPracticeQueue(openItems)));
    window.location.href = 'practice.html';
  });

  clearMasteredBtn.addEventListener('click', () => {
    mistakes = mistakes.filter(m => !m.mastered);
    saveMistakes();
    populateSubjects();
    showToast('נמחקו טעויות שסומנו כנלמדו');
    applyFilters();
  });

  clearAllMistakesBtn.addEventListener('click', () => {
    mistakes = [];
    saveMistakes();
    populateSubjects();
    showToast('כל הטעויות נמחקו');
    applyFilters();
  });

  populateSubjects();
  applyFilters();
})();
