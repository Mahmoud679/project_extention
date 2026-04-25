// js/main.js
(function () {
  const toastEl = document.getElementById('toast');
  const notice = document.getElementById('topNotice');
  const closeBtn = document.getElementById('noticeClose');

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastEl.classList.add('toast-show');
    window.setTimeout(() => {
      toastEl.classList.remove('toast-show');
      toastEl.hidden = true;
    }, 2200);
  }

  // Close notice + localStorage
  if (notice && localStorage.getItem('noticeClosed') === '1') {
    notice.style.display = 'none';
  }

  if (closeBtn && notice) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      notice.style.display = 'none';
      localStorage.setItem('noticeClosed', '1');
      showToast('ההודעה נסגרה ✅');
    });
  }

  // Unimplemented links
  if (window.jQuery) {
    $('.not-implemented').on('click', function (e) {
      e.preventDefault();
      showToast('לא מומש עדיין 🙂');
    });
  }

  // Pass source to Screen 2
  const startBtn = document.getElementById('startShuffleBtn');
  const uploadBtn = document.getElementById('uploadCta');
  function saveFromHome(source) {
    localStorage.setItem('fromHome', source);
  }
  if (startBtn) startBtn.addEventListener('click', () => saveFromHome('startShuffle'));
  if (uploadBtn) uploadBtn.addEventListener('click', () => saveFromHome('uploadCTA'));
})();
