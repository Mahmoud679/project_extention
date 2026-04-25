// js/upload.js
(function () {
  const form = document.getElementById('examForm');
  if (!form) return;

  const pdfFile = document.getElementById('pdfFile');
  const fileName = document.getElementById('fileName');
  const clearFile = document.getElementById('clearFile');

  const subject = document.getElementById('subject');
  const grade = document.getElementById('grade');
  const versions = document.getElementById('versions');

  const fileError = document.getElementById('fileError');
  const subjectError = document.getElementById('subjectError');
  const gradeError = document.getElementById('gradeError');
  const versionsError = document.getElementById('versionsError');
  const shuffleError = document.getElementById('shuffleError');

  const toastEl = document.getElementById('formToast');

  // show source
  const fromHomeText = document.getElementById('fromHomeText');
  const fromHome = localStorage.getItem('fromHome') || 'לא ידוע';
  if (fromHomeText) fromHomeText.textContent = `source: ${fromHome}`;

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

  function setError(el, errorEl, msg) {
    el.classList.add('is-invalid');
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError(el, errorEl) {
    el.classList.remove('is-invalid');
    errorEl.hidden = true;
    errorEl.textContent = '';
  }

  // File preview + validation
  pdfFile.addEventListener('change', () => {
    fileName.textContent = '';
    fileError.hidden = true;

    const f = pdfFile.files && pdfFile.files[0];
    if (!f) return;

    if (f.type !== 'application/pdf') {
      setError(pdfFile, fileError, 'חייבים לבחור קובץ PDF בלבד.');
      pdfFile.value = '';
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (f.size > maxBytes) {
      setError(pdfFile, fileError, 'הקובץ גדול מדי. מקסימום 5MB.');
      pdfFile.value = '';
      return;
    }

    fileName.textContent = `נבחר: ${f.name}`;
    showToast('PDF נקלט ✅');
  });

  clearFile.addEventListener('click', () => {
    pdfFile.value = '';
    fileName.textContent = '';
    fileError.hidden = true;
    showToast('נוקה ✅');
  });

  // jQuery focus glow
  if (window.jQuery) {
    $('#subject, #grade, #versions')
      .on('focus', function () { $(this).addClass('focus-glow'); })
      .on('blur', function () { $(this).removeClass('focus-glow'); });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    clearError(pdfFile, fileError);
    clearError(subject, subjectError);
    clearError(grade, gradeError);
    clearError(versions, versionsError);
    shuffleError.hidden = true;

    let ok = true;

    const f = pdfFile.files && pdfFile.files[0];
    if (!f) {
      setError(pdfFile, fileError, 'חובה לבחור קובץ PDF.');
      ok = false;
    }

    const sub = subject.value.trim();
    if (sub.length < 2 || sub.length > 30) {
      setError(subject, subjectError, 'מקצוע חייב להיות בין 2 ל-30 תווים.');
      ok = false;
    }

    if (!grade.value) {
      setError(grade, gradeError, 'חובה לבחור כיתה.');
      ok = false;
    }

    const v = Number(versions.value);
    if (!Number.isFinite(v) || v < 2 || v > 6) {
      setError(versions, versionsError, 'מספר גרסאות חייב להיות בין 2 ל-6.');
      ok = false;
    }

    const shuffle = document.querySelector('input[name="shuffleType"]:checked');
    if (!shuffle) {
      shuffleError.textContent = 'חובה לבחור סוג ערבול.';
      shuffleError.hidden = false;
      ok = false;
    }

    if (!ok) {
      showToast('יש שגיאות בטופס ❌');
      return;
    }

    const payload = {
      subject: sub,
      grade: grade.value,
      versions: v,
      shuffleType: shuffle.value,
      pdfName: f ? f.name : '',
      createdAt: new Date().toISOString()
    };

    // Add to history (Screen 4)
    const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    history.unshift({
      id: Date.now(),
      subject: payload.subject,
      grade: payload.grade,
      versions: payload.versions,
      shuffleType: payload.shuffleType,
      pdfName: payload.pdfName,
      createdAt: payload.createdAt,
      fromHome: localStorage.getItem('fromHome') || '',
      qCount: 4
    });
    localStorage.setItem('examHistory', JSON.stringify(history));

    localStorage.setItem('examDraft', JSON.stringify(payload));
    showToast('נשמר! ממשיכים למסך הבא… ✅');

    setTimeout(() => {
      window.location.href = 'screen3.html';
    }, 600);
  });
})();

