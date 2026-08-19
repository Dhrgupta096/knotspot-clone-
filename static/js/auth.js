/* ── DSU KnotSpot Auth ── */
(function () {

  function getUser() {
    try { return JSON.parse(localStorage.getItem('dsu_user')); } catch (e) { return null; }
  }
  function saveUser(u) { localStorage.setItem('dsu_user', JSON.stringify(u)); }

  /* ─── Firebase Google Sign-In (works on Netlify) ─── */
  function tryFirebaseLogin() {
    if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return false;
    try {
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      firebase.auth().signInWithPopup(provider).then(function (result) {
        var u = result.user;
        var existing = getUser() || {};
        var user = {
          name:     u.displayName  || existing.name   || '',
          email:    u.email        || existing.email  || '',
          avatar:   u.photoURL     || existing.avatar || '',
          campus:   existing.campus  || '',
          year:     existing.year    || '',
          branch:   existing.branch  || '',
          googleId: u.uid,
          joinedAt: existing.joinedAt || new Date().toISOString()
        };
        if (!user.campus || !user.branch) {
          saveUser(user);
          showCompletionStep(user);
        } else {
          saveUser(user);
          var ov = document.getElementById('dsu-auth-overlay');
          if (ov) ov.remove();
          window.location.reload();
        }
      }).catch(function (err) {
        console.error('Google sign-in error:', err);
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ─── After Google login, collect campus/branch if missing ─── */
  function showCompletionStep(googleUser) {
    var sheet = document.getElementById('dsu-auth-sheet');
    if (!sheet) return;
    sheet.innerHTML = `
      <button class="dsu-close-btn" id="dsu-close-x">✕</button>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <img src="${googleUser.avatar}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,74,198,.15);" onerror="this.style.display='none'">
        <div>
          <div style="font-size:16px;font-weight:800;color:#0f172a;">${googleUser.name}</div>
          <div style="font-size:13px;color:#64748b;">${googleUser.email}</div>
        </div>
      </div>
      <h2 style="margin:0 0 6px;">One last step 🎓</h2>
      <p class="sub">Tell us your campus details to complete your DSU profile.</p>
      <form id="dsu-complete-form">
        <div class="dsu-row" style="margin-bottom:10px;">
          <select class="dsu-field" id="f-campus" required>
            <option value="">Select Campus</option>
            <option value="KS Layout Campus">KS Layout Campus</option>
            <option value="Harohalli Campus">Harohalli (Kanakapura) Campus</option>
          </select>
          <select class="dsu-field" id="f-year" required>
            <option value="">Year</option>
            <option>1st Year</option><option>2nd Year</option>
            <option>3rd Year</option><option>4th Year</option>
          </select>
        </div>
        <input class="dsu-field" id="f-branch" placeholder="Branch (e.g. CSE, ECE, MBA)" required style="margin-bottom:0;">
        <button class="dsu-btn" type="submit" style="margin-top:14px;">
          <span style="font-size:20px;">✓</span> Complete Profile
        </button>
      </form>
    `;
    document.getElementById('dsu-close-x').onclick = function () {
      document.getElementById('dsu-auth-overlay').remove();
    };
    document.getElementById('dsu-complete-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var user = Object.assign({}, googleUser, {
        campus: document.getElementById('f-campus').value,
        year:   document.getElementById('f-year').value,
        branch: document.getElementById('f-branch').value.trim()
      });
      saveUser(user);
      document.getElementById('dsu-auth-overlay').remove();
      window.location.reload();
    });
  }

  /* ─── Main login modal ─── */
  window.triggerGoogleLogin = function () {
    if (document.getElementById('dsu-auth-overlay')) return;

    var ov = document.createElement('div');
    ov.id = 'dsu-auth-overlay';
    ov.innerHTML = `
<style>
#dsu-auth-overlay {
  position:fixed;inset:0;z-index:999999;
  background:rgba(15,23,42,.55);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  display:flex;align-items:flex-end;justify-content:center;
  animation:_dsuFd .22s ease;
}
@keyframes _dsuFd{from{opacity:0}to{opacity:1}}
@keyframes _dsuUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
#dsu-auth-sheet{
  width:100%;max-width:500px;background:#fff;position:relative;
  border-radius:40px 40px 0 0;padding:36px 28px 56px;
  box-shadow:0 -24px 80px rgba(0,0,0,.18);
  animation:_dsuUp .42s cubic-bezier(.16,1,.3,1);
  font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif;
  box-sizing:border-box;
}
#dsu-auth-sheet h2{font-size:28px;font-weight:800;color:#0f172a;letter-spacing:-.04em;margin:0 0 6px;}
.sub{font-size:14px;color:#64748b;margin:0 0 24px;line-height:1.55;}
.dsu-field{
  width:100%;padding:14px 16px;border-radius:16px;
  border:1.5px solid rgba(0,74,198,.12);background:#f6f9fe;
  font-family:inherit;font-size:15px;font-weight:600;color:#0f172a;
  box-sizing:border-box;outline:none;margin-bottom:10px;
  transition:border-color .2s,box-shadow .2s,background .2s;
  -webkit-appearance:none;appearance:none;
}
.dsu-field:focus{border-color:#004ac6;background:#fff;box-shadow:0 0 0 3px rgba(0,74,198,.1);}
.dsu-field::placeholder{color:#94a3b8;font-weight:500;}
.dsu-row{display:flex;gap:10px;}
.dsu-row .dsu-field{flex:1;}
.dsu-google-btn{
  width:100%;padding:14px 20px;margin-bottom:14px;
  border-radius:100px;border:1.5px solid #dadce0;
  background:#fff;cursor:pointer;
  font-family:inherit;font-size:15px;font-weight:700;color:#3c4043;
  display:flex;align-items:center;justify-content:center;gap:10px;
  box-shadow:0 1px 4px rgba(0,0,0,.12);
  transition:box-shadow .2s,background .15s;
}
.dsu-google-btn:hover{box-shadow:0 2px 10px rgba(0,0,0,.18);background:#f8f9fa;}
.dsu-google-btn:active{transform:scale(.98);}
.dsu-divider{
  display:flex;align-items:center;gap:12px;margin:4px 0 16px;
  color:#94a3b8;font-size:12px;font-weight:700;
}
.dsu-divider::before,.dsu-divider::after{content:'';flex:1;height:1px;background:rgba(0,74,198,.08);}
.dsu-btn{
  width:100%;padding:15px;border-radius:100px;border:none;cursor:pointer;
  background:linear-gradient(135deg,#004ac6,#2563eb);
  color:#fff;font-family:inherit;font-size:16px;font-weight:700;
  display:flex;align-items:center;justify-content:center;gap:10px;
  box-shadow:0 6px 20px rgba(0,74,198,.3);
  transition:box-shadow .2s,transform .15s;
}
.dsu-btn:hover{box-shadow:0 10px 28px rgba(0,74,198,.4);}
.dsu-btn:active{transform:scale(.97);}
.dsu-close-btn{
  position:absolute;top:22px;right:22px;width:36px;height:36px;
  border-radius:50%;background:#f1f5f9;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  color:#64748b;font-size:18px;transition:background .2s;
}
.dsu-close-btn:hover{background:#e2e8f0;}
.dsu-lock{text-align:center;margin-top:14px;font-size:12px;color:rgba(100,116,139,.7);font-weight:500;}
</style>
<div id="dsu-auth-sheet">
  <button class="dsu-close-btn" id="dsu-close-x">✕</button>
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
    <div style="width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#004ac6,#2563eb);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:20px;flex-shrink:0;">K</div>
    <div>
      <div style="font-weight:800;font-size:16px;color:#0f172a;">KnotSpot DSU</div>
      <div style="font-size:12px;color:#64748b;">Dayananda Sagar University</div>
    </div>
  </div>
  <h2>Sign in</h2>
  <p class="sub">Connect with DSU students — post Knots, confessions, find roommates &amp; events.</p>

  <button class="dsu-google-btn" id="dsu-google-btn">
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
    Continue with Google
  </button>

  <div class="dsu-divider">or enter your details</div>

  <form id="dsu-signin-form" novalidate>
    <input class="dsu-field" id="f-name"  type="text"  placeholder="Full Name"                required autocomplete="name">
    <input class="dsu-field" id="f-email" type="email" placeholder="Email (Gmail / DSU mail)" required autocomplete="email">
    <div class="dsu-row">
      <select class="dsu-field" id="f-campus" required>
        <option value="">Select Campus</option>
        <option value="KS Layout Campus">KS Layout Campus</option>
        <option value="Harohalli Campus">Harohalli (Kanakapura) Campus</option>
      </select>
      <select class="dsu-field" id="f-year" required>
        <option value="">Year</option>
        <option>1st Year</option><option>2nd Year</option>
        <option>3rd Year</option><option>4th Year</option>
      </select>
    </div>
    <input class="dsu-field" id="f-branch" type="text" placeholder="Branch (e.g. CSE, ECE, MBA)" required style="margin-bottom:0;">
    <button class="dsu-btn" type="submit" style="margin-top:14px;">Sign In &amp; Enter</button>
    <p class="dsu-lock">🔒 Your info stays only on this device</p>
  </form>
</div>`;

    document.body.appendChild(ov);

    document.getElementById('dsu-close-x').onclick = function () { ov.remove(); };
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });

    /* Google button — tries Firebase first, falls back to info message */
    document.getElementById('dsu-google-btn').addEventListener('click', function () {
      var didFirebase = tryFirebaseLogin();
      if (!didFirebase) {
        /* On localhost, Firebase isn't configured — show a friendly note */
        var btn = document.getElementById('dsu-google-btn');
        btn.textContent = '⚡ Google login works after Netlify deploy!';
        btn.style.color = '#004ac6';
        btn.style.borderColor = '#004ac6';
        btn.disabled = true;
        /* Focus on the form below */
        document.getElementById('f-name').focus();
      }
    });

    /* Form fallback — always works */
    document.getElementById('dsu-signin-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name   = document.getElementById('f-name').value.trim();
      var email  = document.getElementById('f-email').value.trim();
      var campus = document.getElementById('f-campus').value;
      var year   = document.getElementById('f-year').value;
      var branch = document.getElementById('f-branch').value.trim();
      if (!name || !email || !campus || !year || !branch) return;
      var seed = encodeURIComponent(name + Date.now());
      saveUser({
        name: name, email: email, campus: campus,
        year: year, branch: branch,
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + seed + '&backgroundColor=b6e3f4',
        joinedAt: new Date().toISOString()
      });
      ov.remove();
      window.location.reload();
    });
  };

  /* ─── Patch request() helper ─── */
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.request !== 'function') {
      window.request = function (url, opts) {
        if (!getUser()) {
          window.triggerGoogleLogin();
          return Promise.reject(new Error('Please sign in first'));
        }
        return Promise.resolve({ data: { url: '/knots/', id: Date.now() } });
      };
    }
    var user = getUser();
    if (user) {
      document.querySelectorAll('.nav-profile-pic').forEach(function (img) {
        img.src = user.avatar; img.alt = user.name;
      });
    }
  });

  window.dsuGetUser = getUser;
})();
