// js/screen3.js
(function () {
  const toastEl = document.getElementById('screenToast');
  const noData = document.getElementById('noData');
  const contentWrap = document.getElementById('contentWrap');

  const examTitleEl = document.getElementById('examTitle');
  const examMetaEl = document.getElementById('examMeta');

  const versionTabs = document.getElementById('versionTabs');
  const paperArea = document.getElementById('paperArea');

  const chipVersion = document.getElementById('chipVersion');
  const chipQCount = document.getElementById('chipQCount');
  const chipShuffle = document.getElementById('chipShuffle');

  const versionsHint = document.getElementById('versionsHint');
  const regenBtn = document.getElementById('regenBtn');
  const saveBtn = document.getElementById('saveBtn');

  function showToast(msg){
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.add('toast-show');
    setTimeout(() => {
      toastEl.classList.remove('toast-show');
      toastEl.hidden = true;
    }, 2200);
  }

  function safeParse(key){
    try { return JSON.parse(localStorage.getItem(key) || ''); }
    catch { return null; }
  }

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

  function shuffleArray(arr){
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function toHebShuffleLabel(type){
    if (type === 'questions') return 'ערבול שאלות';
    if (type === 'answers') return 'ערבול תשובות';
    if (type === 'both') return 'ערבול שאלות + תשובות';
    return '—';
  }

  function versionLetter(i){ return String.fromCharCode('A'.charCodeAt(0) + i); }

  const baseExam = [
    {
      q: 'מהי עיר-מדינה?',
      answers: ['א. מדינה עם עיר אחת','ב. עיר עצמאית עם שלטון','ג. עיר בתוך אימפריה','ד. עיר ללא חוקים']
    },
    {
      q: 'סדר נכון של שלבי מחקר:',
      answers: ['א. סיכום, שאלה, מקורות','ב. שאלה, מקורות, מסקנות','ג. מקורות, שאלה, מסקנות','ד. מסקנות, מקורות, שאלה']
    },
    {
      q: 'מהו מקור ראשוני?',
      answers: ['א. מאמר סיכום מודרני','ב. מסמך/עדות מתקופת האירוע','ג. ספר לימוד','ד. דעה ברשת']
    },
    {
      q: 'מה מטרת כותרת במבחן?',
      answers: ['א. לקשט בלבד','ב. להציג נושא וכללים','ג. להסתיר תשובות','ד. ליצור בלבול']
    }
  ];

  const draft = safeParse('examDraft');
  if (!draft){
    noData.hidden = false;
    contentWrap.hidden = true;
    return;
  }

  examTitleEl.textContent = `מבחן: ${draft.subject || 'ללא מקצוע'}`;
  examMetaEl.textContent = `כיתה: ${draft.grade || '—'} • גרסאות: ${draft.versions || '—'} • סוג ערבול: ${toHebShuffleLabel(draft.shuffleType)}`;
  chipShuffle.textContent = toHebShuffleLabel(draft.shuffleType);

  noData.hidden = true;
  contentWrap.hidden = false;

  let versionsData = [];
  let activeIndex = 0;

  function renderTabs(){
    versionTabs.innerHTML = '';
    versionsData.forEach((v, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vtab' + (idx === activeIndex ? ' vtab-active' : '');
      btn.setAttribute('data-idx', String(idx));
      btn.textContent = `גרסה ${v.version}`;
      versionTabs.appendChild(btn);
    });
    versionsHint.textContent = 'בחר/י גרסה לצפייה. אפשר גם “ערבל מחדש” כדי לקבל ערבול חדש.';
  }

  function renderPaper(idx){
    const v = versionsData[idx];
    if (!v) return;

    chipVersion.textContent = `גרסה ${v.version}`;
    chipQCount.textContent = `${v.questions.length} שאלות`;

    const html = `
      <div class="paper-head">
        <p class="paper-title">${draft.subject} — גרסה ${v.version}</p>
        <p class="paper-meta">כיתה ${draft.grade} • סוג: ${toHebShuffleLabel(draft.shuffleType)} • קובץ: ${draft.pdfName || 'PDF (דמו)'}</p>
      </div>
      <ol class="q-list">
        ${v.questions.map((qItem) => `
          <li>
            <p class="q">${qItem.q}</p>
            <div class="answers">
              ${qItem.answers.map(a => `<span class="ans">${a}</span>`).join('')}
            </div>
          </li>
        `).join('')}
      </ol>
      <div class="paper-footer">
        <span class="muted small">נוצר בהדגמה בצד לקוח • שמירה/הדפסה: דמו</span>
        <a href="#" class="tiny-link not-implemented" title="לא מומש עדיין">הדפס / יצוא PDF</a>
      </div>
    `;

    paperArea.innerHTML = html;
  }

  function generateAllVersions(){
    const vCount = Number(draft.versions) || 4;
    versionsData = [];

    for (let i=0;i<vCount;i++){
      let questions = clone(baseExam);

      if (draft.shuffleType === 'questions' || draft.shuffleType === 'both'){
        questions = shuffleArray(questions);
      }

      if (draft.shuffleType === 'answers' || draft.shuffleType === 'both'){
        questions = questions.map((item) => {
          const copy = clone(item);
          copy.answers = shuffleArray(copy.answers);
          return copy;
        });
      }

      versionsData.push({ version: versionLetter(i), questions });
    }

    activeIndex = 0;
    renderTabs();
    renderPaper(activeIndex);
  }

  // Events
  if (window.jQuery){
    $(document).on('click', '.vtab', function(){
      const idx = Number($(this).attr('data-idx'));
      if (!Number.isFinite(idx)) return;

      activeIndex = idx;
      $('.vtab').removeClass('vtab-active');
      $(this).addClass('vtab-active');

      renderPaper(activeIndex);
      showToast(`עברנו לגרסה ${versionsData[activeIndex].version} ✅`);
    });

    $(document).on('click', '.not-implemented', function(e){
      e.preventDefault();
      showToast('לא מומש עדיין 🙂');
    });
  }

  regenBtn.addEventListener('click', () => {
    generateAllVersions();
    showToast('בוצע ערבול מחדש 🔀');
  });

  saveBtn.addEventListener('click', () => {
    localStorage.setItem('examVersions', JSON.stringify(versionsData));
    showToast('הגרסאות נשמרו (דמו) ✅');
  });

  generateAllVersions();
})();
