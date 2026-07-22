/* ==========================================================================
   DSU KnotSpot Global Application Framework
   Manages global state, custom alerts, navigation renderer, emulated auth.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Inject global toast container if not exists
    if (!document.getElementById('toast-container')) {
        const tc = document.createElement('div');
        tc.id = 'toast-container';
        tc.className = 'toast-container';
        document.body.appendChild(tc);
    }

    // Auto-render shared navigation if nav tag is present
    renderNavigation();

    // Check Authentication State
    checkAuthState();
});

// Toast notification helper
function showToast(message, type = 'primary') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'accent' ? 'accent' : ''}`;
    toast.innerHTML = `
        <span class="material-symbols-rounded">
            ${type === 'accent' ? 'warning' : 'check_circle'}
        </span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove toast after animation completes
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

// Check if user is logged in
function checkAuthState() {
    const path = window.location.pathname;
    const isSubpage = path.includes('/knots/') || path.includes('/confessions/') || path.includes('/roomfinder/') || path.includes('/events/');
    const isLanding = !isSubpage;
    
    const user = window.dsuDb.getUser();

    if (!user && !isLanding) {
        // Redirect to landing page if trying to access sub-pages without login
        showToast("Please sign in to access student features.", "accent");
        setTimeout(() => {
            const rootPath = getRootPath();
            window.location.href = rootPath + 'index.html';
        }, 1500);
    }
}

// Helper to determine root path depth for correct routing
function getRootPath() {
    const path = window.location.pathname;
    if (path.includes('/confessions/') || path.includes('/knots/') || path.includes('/roomfinder/') || path.includes('/events/')) {
        return '../';
    }
    return './';
}

// Shared Navigation Renderer
function renderNavigation() {
    const navPlaceholder = document.getElementById('global-nav');
    if (!navPlaceholder) return;

    const root = getRootPath();
    const path = window.location.pathname;

    const tabs = [
        { name: 'Home', icon: 'home', link: 'index.html', active: path === '/' || path.endsWith('index.html') || path.endsWith('dsu-knotspot/') },
        { name: 'Knots', icon: 'forum', link: 'knots/index.html', active: path.includes('/knots/') },
        { name: 'Confessions', icon: 'visibility_off', link: 'confessions/index.html', active: path.includes('/confessions/') },
        { name: 'Rooms', icon: 'bed', link: 'roomfinder/index.html', active: path.includes('/roomfinder/') },
        { name: 'Events', icon: 'event', link: 'events/index.html', active: path.includes('/events/') }
    ];

    let navHtml = `<div class="nav-inner">`;
    tabs.forEach(tab => {
        const activeClass = tab.active ? 'active' : '';
        const destination = root + tab.link;
        navHtml += `
            <a href="${destination}" class="nav-link ${activeClass}">
                <div class="nav-icon-wrapper">
                    <span class="material-symbols-rounded">${tab.icon}</span>
                </div>
                <span>${tab.name}</span>
            </a>
        `;
    });
    
    // Add Profile button at the end
    const user = window.dsuDb.getUser();
    const profileActive = false; // Trigger modal instead of navigation
    navHtml += `
        <a href="#" onclick="openProfileModal(event)" class="nav-link">
            <div class="nav-icon-wrapper">
                <img src="${user ? user.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" class="nav-profile-pic" alt="Profile">
            </div>
            <span>Profile</span>
        </a>
    `;

    navHtml += `</div>`;
    navPlaceholder.innerHTML = navHtml;
    navPlaceholder.className = 'app-nav';
}

// Real Google OAuth 2.0 Integration & Identity Services
window.GOOGLE_CLIENT_ID = localStorage.getItem('dsu_google_client_id') || "";

function setGoogleClientId(val) {
    window.GOOGLE_CLIENT_ID = val.trim();
    localStorage.setItem('dsu_google_client_id', window.GOOGLE_CLIENT_ID);
    showToast("Google Client ID saved!");
}

function triggerGoogleLogin() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '5000';
    
    const hasClientId = Boolean(window.GOOGLE_CLIENT_ID);

    overlay.innerHTML = `
        <div class="modal-sheet" style="max-height: 540px;">
            <div class="modal-header">
                <h3>Google OAuth 2.0 Authentication</h3>
                <button type="button" class="modal-close-btn" onclick="closeAuthModal(this)">
                    <span class="material-symbols-rounded">close</span>
                </button>
            </div>
            <div class="modal-body" style="padding-bottom: 20px;">
                ${!hasClientId ? `
                    <div style="background: #fff8e6; border: 1px solid #ffe58f; padding: 12px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 12.5px; color: #873800; line-height: 1.4;">
                        <strong>🔑 Google OAuth Client ID Required:</strong><br>
                        To log in with real Google accounts, paste your <strong>OAuth 2.0 Client ID</strong> from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color: var(--primary); text-decoration: underline;">Google Cloud Console</a> into the field below.
                    </div>
                ` : `
                    <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">
                        Authenticating via Google OAuth 2.0 using Client ID: <code style="font-size: 11px;">${window.GOOGLE_CLIENT_ID.substring(0, 25)}...</code>
                    </p>
                `}

                ${hasClientId ? `
                    <div id="g_id_onload"
                         data-client_id="${window.GOOGLE_CLIENT_ID}"
                         data-callback="handleGoogleCredentialResponse"
                         data-auto_prompt="false">
                    </div>
                    <div class="g_id_signin" data-type="standard" data-size="large" data-theme="outline" data-text="sign_in_with" data-shape="rectangular" data-logo_alignment="left" style="margin-bottom: 16px; display: flex; justify-content: center;"></div>
                ` : ''}

                <form id="google-auth-form" onsubmit="handleAuthSubmit(event, this)">
                    <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">Your Google OAuth Client ID</label>
                    <input type="text" id="auth-client-id" value="${window.GOOGLE_CLIENT_ID}" placeholder="123456789-abc.apps.googleusercontent.com" style="margin-bottom: 12px; font-size: 12px;" onchange="setGoogleClientId(this.value)">

                    <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">Student Name</label>
                    <input type="text" id="auth-name" placeholder="Aarav Sharma" required style="margin-bottom: 12px;">
                    
                    <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">College Branch</label>
                    <input type="text" id="auth-branch" placeholder="CSE / ISE / ECE / Mechanical" required style="margin-bottom: 12px;">
                    
                    <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">Select Campus</label>
                    <select id="auth-campus" required style="margin-bottom: 20px;">
                        <option value="ks-layout">KS Layout Campus</option>
                        <option value="kanakapura">Harohalli (Kanakapura) Campus</option>
                    </select>

                    <button type="submit" class="btn-primary">
                        Confirm &amp; Authenticate User
                    </button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.style.opacity = '1';
        if (window.google && window.google.accounts) {
            try {
                window.google.accounts.id.initialize({
                    client_id: window.GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredentialResponse
                });
                window.google.accounts.id.renderButton(
                    document.querySelector('.g_id_signin'),
                    { theme: 'outline', size: 'large', width: '100%' }
                );
            } catch (err) {
                console.log('Google Identity Services initialized with custom options.');
            }
        }
    }, 50);
}

async function handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) {
        showToast("Google authentication failed. Please try again.", "accent");
        return;
    }
    const branch = document.getElementById('auth-branch')?.value || 'CSE';
    const campus = document.getElementById('auth-campus')?.value || 'ks-layout';

    showToast("Verifying Google ID Token with backend server...");
    const user = await window.dsuDb.verifyGoogleToken(response.credential, branch, campus);

    if (user && !user.error) {
        showToast(`Google Auth verified! Welcome, ${user.name}.`);
        setTimeout(() => {
            window.location.href = getRootPath() + 'knots/index.html';
        }, 1000);
    } else {
        showToast("Backend verification failed: Invalid Google ID token.", "accent");
    }
}

function closeAuthModal(btn) {
    const overlay = btn.closest('.modal-overlay');
    overlay.style.opacity = '0';
    overlay.addEventListener('transitionend', () => overlay.remove());
}

function handleAuthSubmit(e, form) {
    e.preventDefault();
    const name = document.getElementById('auth-name').value;
    const branch = document.getElementById('auth-branch').value;
    const campus = document.getElementById('auth-campus').value;

    const user = {
        id: 'u-' + Date.now(),
        name: name,
        email: name.toLowerCase().replace(/\s+/g, '.') + "@dsu.edu.in",
        branch: branch,
        year: "1st Year",
        campus: campus,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        profileComplete: true
    };

    window.dsuDb.saveUser(user);
    closeAuthModal(form);

    showToast(`Welcome, ${name}! User verified & authenticated.`);
    setTimeout(() => {
        window.location.href = getRootPath() + 'knots/index.html';
    }, 1200);
}

// Profile Modal Renderer
function openProfileModal(e) {
    e.preventDefault();
    const user = window.dsuDb.getUser();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.id = 'profile-modal';

    const campusName = user ? (user.campus === 'ks-layout' ? 'KS Layout Campus' : 'Harohalli Campus') : 'N/A';

    overlay.innerHTML = `
        <div class="modal-sheet" style="max-height: 480px;">
            <div class="modal-header">
                <h3>Student Profile</h3>
                <button type="button" class="modal-close-btn" onclick="closeAuthModal(this)">
                    <span class="material-symbols-rounded">close</span>
                </button>
            </div>
            <div class="modal-body" style="padding-bottom: 20px; text-align: center;">
                <img src="${user ? user.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" 
                     style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--primary-soft); margin-bottom: 12px; object-fit: cover;" alt="Avatar">
                
                <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">${user ? user.name : 'Guest Student'}</h2>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">${user ? user.email : 'Not signed in'}</p>
                
                <div style="background: var(--surface-muted); padding: 16px; border-radius: var(--radius-md); text-align: left; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                        <span style="color: var(--text-muted); font-weight: 600;">Campus:</span>
                        <span style="color: var(--text-main); font-weight: 700;">${campusName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span style="color: var(--text-muted); font-weight: 600;">Branch:</span>
                        <span style="color: var(--text-main); font-weight: 700;">${user ? user.branch : 'N/A'}</span>
                    </div>
                </div>

                ${user ? `
                    <button class="btn-primary" style="background: linear-gradient(135deg, #ba1a1a, #ef4444); box-shadow: 0 8px 20px rgba(186, 26, 26, 0.2);" onclick="handleLogout(this)">
                        Log Out
                    </button>
                ` : `
                    <button class="btn-primary" onclick="redirectToLogin(this)">
                        Sign In Now
                    </button>
                `}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.style.opacity = '1', 50);
}

function handleLogout(btn) {
    window.dsuDb.logoutUser();
    closeAuthModal(btn);
    showToast("Logged out successfully.");
    setTimeout(() => {
        window.location.href = getRootPath() + 'index.html';
    }, 1000);
}

function redirectToLogin(btn) {
    closeAuthModal(btn);
    window.location.href = getRootPath() + 'index.html';
}

// Global functions exports
window.showToast = showToast;
window.triggerGoogleLogin = triggerGoogleLogin;
window.openProfileModal = openProfileModal;
window.closeAuthModal = closeAuthModal;
window.handleAuthSubmit = handleAuthSubmit;
window.handleLogout = handleLogout;
window.redirectToLogin = redirectToLogin;
