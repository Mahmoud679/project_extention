// js/nav.js
(function () {
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const map = {
    'index.html': 'index',
    'upload.html': 'upload',
    'screen3.html': 'screen3',
    'screen4.html': 'screen4',
    'screen5.html': 'screen5',
    'practice.html': 'practice',
    'review.html': 'review'
  };

  const key = map[file] || 'index';
  const activeLink = document.querySelector(`[data-nav="${key}"]`);
  if (activeLink) activeLink.classList.add('nav-active');
})();
