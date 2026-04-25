(function () {
  const quizArea = document.getElementById('quizArea');
  const checkBtn = document.getElementById('checkBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultText = document.getElementById('resultText');
  const timerEl = document.getElementById('timer');
  const counterEl = document.getElementById('counter');
  const statusText = document.getElementById('statusText');
  const subjectSelect = document.getElementById('subjectSelect');

  const STORAGE_MISTAKES = 'examixMistakes';
  const STORAGE_ATTEMPTS = 'examixPracticeAttempts';
  const STORAGE_REVIEW_QUEUE = 'examixReviewQueue';

  const subjects = {
    history: [
      { q: 'מהי עיר-מדינה?', answers: ['מדינה עם עיר אחת בלבד', 'עיר עצמאית עם שלטון משלה', 'עיר בתוך אימפריה', 'עיר בלי חוקים'], correct: 1, explain: 'עיר-מדינה היא עיר עצמאית עם שלטון משלה.' },
      { q: 'מהו מקור ראשוני?', answers: ['ספר לימוד מודרני', 'מסמך מהתקופה', 'סיכום באינטרנט', 'דעה'], correct: 1, explain: 'מקור ראשוני נוצר בזמן האירוע.' },
      { q: 'מהי אימפריה?', answers: ['כפר קטן', 'מדינה ששולטת על שטחים רבים', 'עיר אחת', 'קבוצה קטנה'], correct: 1, explain: 'אימפריה שולטת על שטחים רחבים.' },
      { q: 'מהי כרונולוגיה?', answers: ['סדר לפי זמן', 'מפה', 'חוק', 'מדינה'], correct: 0, explain: 'כרונולוגיה היא סידור אירועים לפי זמן.' }
    ],
    math: [
      { q: 'כמה זה 5 + 7?', answers: ['10', '11', '12', '13'], correct: 2, explain: '5 + 7 = 12' },
      { q: 'כמה זה 9 × 3?', answers: ['18', '27', '21', '24'], correct: 1, explain: '9 כפול 3 = 27' },
      { q: 'כמה זה 20 ÷ 4?', answers: ['2', '4', '5', '6'], correct: 2, explain: '20 חלקי 4 = 5' },
      { q: 'כמה זה 15 - 6?', answers: ['7', '8', '9', '10'], correct: 2, explain: '15 פחות 6 = 9' }
    ],
    general: [
      { q: 'מהי בירת צרפת?', answers: ['לונדון', 'ברלין', 'פריז', 'רומא'], correct: 2, explain: 'פריז היא בירת צרפת.' },
      { q: 'כמה ימים יש בשבוע?', answers: ['5', '6', '7', '8'], correct: 2, explain: 'יש 7 ימים בשבוע.' },
      { q: 'איזה צבע מתקבל מערבוב כחול וצהוב?', answers: ['אדום', 'ירוק', 'סגול', 'כתום'], correct: 1, explain: 'כחול + צהוב = ירוק.' },
      { q: 'איזו חיה נחשבת מלך החיות?', answers: ['נמר', 'פיל', 'אריה', 'זאב'], correct: 2, explain: 'האריה הוא מלך החיות.' }
    ]
  };

  let questions = [];
  let currentSubject = 'history';
  let userAnswers = {};
  let submitted = false;
  let time = 180;
  let timerInterval;
  let isReviewMode = false;

  function safeParse(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || '') || fallback; }
    catch { return fallback; }
  }

  function saveArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function getSubjectName(key) {
    const names = { history: 'היסטוריה', math: 'מתמטיקה', general: 'ידע כללי', review: 'תרגול טעויות' };
    return names[key] || key;
  }

  function loadSubject() {
    const reviewQueue = safeParse(STORAGE_REVIEW_QUEUE, []);

    if (reviewQueue.length > 0) {
      isReviewMode = true;
      currentSubject = 'review';
      questions = reviewQueue.map(item => ({
        q: item.question,
        answers: item.answers,
        correct: item.correctIndex,
        explain: item.explanation,
        originalSubject: item.subject,
        mistakeId: item.id
      }));
      localStorage.removeItem(STORAGE_REVIEW_QUEUE);
      if (subjectSelect) subjectSelect.disabled = true;
      statusText.textContent = 'מצב תרגול טעויות פעיל. השאלות נלקחו מעמוד סקירת הטעויות.';
    } else {
      isReviewMode = false;
      currentSubject = subjectSelect.value;
      questions = subjects[currentSubject];
      if (subjectSelect) subjectSelect.disabled = false;
      statusText.textContent = 'בחר תשובות לכל השאלות';
    }

    userAnswers = {};
    submitted = false;
    checkBtn.disabled = false;
    resultText.textContent = 'עדיין לא נבדק.';
    time = 180;
    startTimer();
    renderQuiz();
    updateCounter();
  }

  function renderQuiz() {
    quizArea.innerHTML = questions.map((q, i) => `
      <article class="paper mb-3 question-card" data-question="${i}">
        <p class="q">${i + 1}. ${q.q}</p>
        ${q.answers.map((a, j) => `<div class="ans option" data-q="${i}" data-a="${j}">${a}</div>`).join('')}
        <p class="explanation muted small" id="explain-${i}" hidden></p>
      </article>
    `).join('');
  }

  function updateCounter() {
    const answered = Object.keys(userAnswers).length;
    counterEl.textContent = `ענית על ${answered} / ${questions.length}`;
  }

  document.addEventListener('click', (e) => {
    if (submitted) return;
    if (!e.target.classList.contains('option')) return;

    const q = e.target.dataset.q;
    const a = e.target.dataset.a;
    userAnswers[q] = Number(a);

    document.querySelectorAll(`[data-q="${q}"]`).forEach(el => el.classList.remove('selected'));
    e.target.classList.add('selected');

    const card = document.querySelector(`[data-question="${q}"]`);
    if (card) card.classList.remove('unanswered');
    updateCounter();
  });

  function saveAttempt(score, percent, wrongItems) {
    const attempts = safeParse(STORAGE_ATTEMPTS, []);
    attempts.unshift({
      id: Date.now(),
      subject: currentSubject,
      subjectName: getSubjectName(currentSubject),
      score,
      total: questions.length,
      percent,
      wrongCount: wrongItems.length,
      createdAt: new Date().toISOString(),
      mode: isReviewMode ? 'review' : 'regular'
    });
    saveArray(STORAGE_ATTEMPTS, attempts.slice(0, 50));
  }

  function saveMistakes(wrongItems) {
    if (!wrongItems.length) return;
    const existing = safeParse(STORAGE_MISTAKES, []);

    wrongItems.forEach(item => {
      const found = existing.find(x => x.question === item.question && x.subject === item.subject);
      if (found) {
        found.timesWrong += 1;
        found.lastWrongAt = new Date().toISOString();
        found.userAnswer = item.userAnswer;
        found.mastered = false;
      } else {
        existing.unshift({
          id: Date.now() + Math.floor(Math.random() * 9999),
          subject: item.subject,
          subjectName: getSubjectName(item.subject),
          question: item.question,
          answers: item.answers,
          correctIndex: item.correctIndex,
          userAnswer: item.userAnswer,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          timesWrong: 1,
          mastered: false,
          createdAt: new Date().toISOString(),
          lastWrongAt: new Date().toISOString()
        });
      }
    });

    saveArray(STORAGE_MISTAKES, existing);
  }

  function markReviewQuestionsMastered() {
    const mistakes = safeParse(STORAGE_MISTAKES, []);
    let changed = false;

    questions.forEach((q, i) => {
      if (!q.mistakeId) return;
      if (userAnswers[i] !== q.correct) return;
      const m = mistakes.find(x => String(x.id) === String(q.mistakeId));
      if (m) {
        m.mastered = true;
        m.masteredAt = new Date().toISOString();
        changed = true;
      }
    });

    if (changed) saveArray(STORAGE_MISTAKES, mistakes);
  }

  function gradeExam(forceSubmit = false) {
    const unanswered = [];
    questions.forEach((q, i) => {
      if (userAnswers[i] === undefined) unanswered.push(i);
    });

    if (!forceSubmit && unanswered.length > 0) {
      unanswered.forEach(i => {
        const card = document.querySelector(`[data-question="${i}"]`);
        if (card) card.classList.add('unanswered');
      });
      const first = document.querySelector(`[data-question="${unanswered[0]}"]`);
      if (first) first.scrollIntoView({ behavior: 'smooth' });
      resultText.textContent = `יש ${unanswered.length} שאלות שלא נענו!`;
      statusText.textContent = 'יש להשלים את כל השאלות.';
      return;
    }

    submitted = true;
    checkBtn.disabled = true;
    clearInterval(timerInterval);

    let score = 0;
    const wrongItems = [];

    questions.forEach((q, i) => {
      const selected = userAnswers[i];
      const options = document.querySelectorAll(`[data-q="${i}"]`);
      const explain = document.getElementById(`explain-${i}`);

      options.forEach((opt, index) => {
        opt.classList.remove('selected');
        if (selected === q.correct && index === q.correct) opt.classList.add('correct');
        if (selected !== undefined && selected !== q.correct && index === selected) opt.classList.add('wrong');
        if (selected !== q.correct && index === q.correct) opt.classList.add('almost');
      });

      if (selected === q.correct) {
        score++;
      } else {
        wrongItems.push({
          subject: q.originalSubject || currentSubject,
          question: q.q,
          answers: q.answers,
          correctIndex: q.correct,
          userAnswer: selected === undefined ? 'לא נענה' : q.answers[selected],
          correctAnswer: q.answers[q.correct],
          explanation: q.explain
        });
      }

      if (explain) {
        explain.hidden = false;
        explain.textContent = `הסבר: ${q.explain}`;
      }
    });

    const percent = Math.round((score / questions.length) * 100);
    let msg = percent === 100 ? 'מצוין!' : percent >= 70 ? 'טוב מאוד!' : 'צריך תרגול נוסף';

    saveAttempt(score, percent, wrongItems);
    saveMistakes(wrongItems);
    if (isReviewMode) markReviewQuestionsMastered();

    const reviewLink = wrongItems.length ? ' | הטעויות נשמרו לעמוד סקירת טעויות.' : ' | אין טעויות לשמירה.';
    resultText.textContent = `ציון: ${score}/${questions.length} (${percent}%) - ${msg}${reviewLink}`;
    statusText.textContent = wrongItems.length ? `נשמרו ${wrongItems.length} טעויות לתרגול חוזר.` : 'כל הכבוד — אין טעויות במבחן הזה.';
  }

  function updateTimer() {
    const min = String(Math.floor(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    timerEl.textContent = `⏱️ ${min}:${sec}`;
    if (time <= 0) {
      clearInterval(timerInterval);
      gradeExam(true);
    }
    time--;
  }

  function startTimer() {
    clearInterval(timerInterval);
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  }

  function reset() {
    localStorage.removeItem(STORAGE_REVIEW_QUEUE);
    if (subjectSelect) subjectSelect.disabled = false;
    loadSubject();
  }

  checkBtn.addEventListener('click', () => gradeExam(false));
  resetBtn.addEventListener('click', reset);
  subjectSelect.addEventListener('change', () => {
    localStorage.removeItem(STORAGE_REVIEW_QUEUE);
    loadSubject();
  });

  loadSubject();
})();
