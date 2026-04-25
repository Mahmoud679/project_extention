// js/auth.js (PHP + Session)
(function () {
  const API = {
    me: 'includes/auth_me.php',
    login: 'includes/auth_login.php',
    register: 'includes/auth_register.php',
    logout: 'includes/auth_logout.php'
  };

  const navAuthArea = document.getElementById('navAuthArea');
  const toastEl = document.getElementById('authToast');

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

  function renderNavLoggedOut(){
    if (!navAuthArea) return;
    navAuthArea.innerHTML = `
      <a class="btn btn-ghost" href="screen5.html">התחברות</a>
      <a class="btn btn-primary btn-cta" href="upload.html">התחל לערבל</a>
    `;
  }

  function renderNavLoggedIn(user){
    if (!navAuthArea) return;
    navAuthArea.innerHTML = `
      <span class="nav-user">שלום, ${escapeHtml(user.name || 'משתמש')}</span>
      <button id="logoutBtn" class="btn btn-ghost" type="button">התנתקות</button>
      <a class="btn btn-primary btn-cta" href="upload.html">התחל לערבל</a>
    `;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (!window.jQuery) return;
        $.post(API.logout)
          .done(() => {
            renderNavLoggedOut();
            showToast('התנתקת ✅');
          })
          .fail(() => {
            showToast('שגיאה בהתנתקות ❌');
          });
      });
    }
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }

  // Fetch current session user and update NAV
  function refreshNav(){
    if (!window.jQuery) return;
    $.getJSON(API.me)
      .done((res) => {
        if (res && res.user) renderNavLoggedIn(res.user);
        else renderNavLoggedOut();
      })
      .fail(() => {
        // אם אין PHP פעיל/שגיאה - לפחות לא לשבור UI
        renderNavLoggedOut();
      });
  }

  refreshNav();

  // ===== Screen 5 handlers =====
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  function setErr(input, errEl, msg){
    input.classList.add('is-invalid');
    errEl.textContent = msg;
    errEl.hidden = false;
  }

  function clearErr(input, errEl){
    input.classList.remove('is-invalid');
    errEl.hidden = true;
    errEl.textContent = '';
  }

  function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (loginForm) {
    const loginEmail = document.getElementById('loginEmail');
    const loginPass  = document.getElementById('loginPass');
    const loginEmailErr = document.getElementById('loginEmailErr');
    const loginPassErr  = document.getElementById('loginPassErr');

    $('#fillDemoBtn').on('click', function(){
      $('#loginEmail').val('demo@examix.com');
      $('#loginPass').val('123456');
      showToast('מולא דמו ✨ (אם קיים משתמש כזה ב-DB)');
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErr(loginEmail, loginEmailErr);
      clearErr(loginPass, loginPassErr);

      let ok = true;
      const email = loginEmail.value.trim().toLowerCase();
      const pass = loginPass.value;

      if (!isValidEmail(email)) { setErr(loginEmail, loginEmailErr, 'אימייל לא תקין.'); ok = false; }
      if (!pass || pass.length < 6) { setErr(loginPass, loginPassErr, 'סיסמה חייבת להיות לפחות 6 תווים.'); ok = false; }

      if (!ok) { showToast('יש שגיאות בהתחברות ❌'); return; }
      if (!window.jQuery) return;

      $.post(API.login, { email, password: pass })
        .done((res) => {
          if (res && res.ok) {
            refreshNav();
            showToast('התחברת בהצלחה ✅');
            setTimeout(() => { window.location.href = 'index.html'; }, 600);
          } else {
            showToast((res && res.msg) ? res.msg : 'התחברות נכשלה ❌');
          }
        })
        .fail((xhr) => {
          const msg = xhr.responseJSON && xhr.responseJSON.msg ? xhr.responseJSON.msg : 'התחברות נכשלה ❌';
          setErr(loginEmail, loginEmailErr, msg);
          setErr(loginPass, loginPassErr, msg);
          showToast(msg);
        });
    });
  }

  if (registerForm) {
    const regName = document.getElementById('regName');
    const regEmail = document.getElementById('regEmail');
    const regPass = document.getElementById('regPass');
    const regPass2 = document.getElementById('regPass2');

    const regNameErr = document.getElementById('regNameErr');
    const regEmailErr = document.getElementById('regEmailErr');
    const regPassErr = document.getElementById('regPassErr');
    const regPass2Err = document.getElementById('regPass2Err');

    // נקה משתמשים (דמו) לא רלוונטי ל-DB, משאירים הודעה
    $('#clearUsersBtn').on('click', function(){
      showToast('ב-PHP אין "נקה משתמשים" דרך הלקוח 🙂');
    });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      clearErr(regName, regNameErr);
      clearErr(regEmail, regEmailErr);
      clearErr(regPass, regPassErr);
      clearErr(regPass2, regPass2Err);

      let ok = true;
      const name = regName.value.trim();
      const email = regEmail.value.trim().toLowerCase();
      const pass = regPass.value;
      const pass2 = regPass2.value;

      if (name.length < 2 || name.length > 60) { setErr(regName, regNameErr, 'שם חייב להיות 2-60 תווים.'); ok = false; }
      if (!isValidEmail(email)) { setErr(regEmail, regEmailErr, 'אימייל לא תקין.'); ok = false; }
      if (!pass || pass.length < 6) { setErr(regPass, regPassErr, 'סיסמה חייבת להיות לפחות 6 תווים.'); ok = false; }
      if (pass2 !== pass) { setErr(regPass2, regPass2Err, 'אימות סיסמה לא תואם.'); ok = false; }

      if (!ok) { showToast('יש שגיאות בהרשמה ❌'); return; }
      if (!window.jQuery) return;

      $.post(API.register, { name, email, password: pass })
        .done((res) => {
          if (res && res.ok) {
            refreshNav();
            showToast('נרשמת והתחברת ✅');
            setTimeout(() => { window.location.href = 'index.html'; }, 700);
          } else {
            showToast((res && res.msg) ? res.msg : 'הרשמה נכשלה ❌');
          }
        })
        .fail((xhr) => {
          const msg = xhr.responseJSON && xhr.responseJSON.msg ? xhr.responseJSON.msg : 'הרשמה נכשלה ❌';
          if (xhr.status === 409) setErr(regEmail, regEmailErr, msg);
          showToast(msg);
        });
    });
  }
})();
