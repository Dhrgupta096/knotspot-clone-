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

// DSU Student Auth & Google Identity Integration
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
        <div class="modal-sheet" style="max-height: 560px;">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" style="width: 22px; height: 22px;"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    <h3 style="margin: 0;">DSU Student Authentication</h3>
                </div>
                <button type="button" class="modal-close-btn" onclick="closeAuthModal(this)">
                    <span class="material-symbols-rounded">close</span>
                </button>
            </div>
            <div class="modal-body" style="padding-bottom: 20px;">
                <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 18px; line-height: 1.5;">
                    Sign in with your Dayananda Sagar University student profile details to access Knots, Confessions, and Roommate Finder.
                </p>

                ${hasClientId ? `
                    <div id="g_id_onload"
                         data-client_id="${window.GOOGLE_CLIENT_ID}"
                         data-callback="handleGoogleCredentialResponse"
                         data-auto_prompt="false">
                    </div>
                    <div class="g_id_signin" data-type="standard" data-size="large" data-theme="outline" data-text="sign_in_with" data-shape="rectangular" data-logo_alignment="left" style="margin-bottom: 18px; display: flex; justify-content: center;"></div>
                    <div style="text-align: center; margin-bottom: 16px; font-size: 12px; color: var(--text-muted); position: relative;">
                        <span style="background: white; padding: 0 10px; position: relative; z-index: 1;">OR CONTINUING WITH STUDENT DETAILS</span>
                        <div style="position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid var(--border); z-index: 0;"></div>
                    </div>
                ` : ''}

                <form id="google-auth-form" onsubmit="handleAuthSubmit(event, this)">
                    <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">Student Full Name</label>
                    <input type="text" id="auth-name" placeholder="e.g. Aarav Sharma" required style="margin-bottom: 12px;">
                    
                    <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">Student Email (@dsu.edu.in)</label>
                    <input type="email" id="auth-email" placeholder="aarav.sharma@dsu.edu.in" required style="margin-bottom: 12px;">

                    <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">College Branch</label>
                    <input type="text" id="auth-branch" placeholder="e.g. Computer Science (CSE)" required style="margin-bottom: 12px;">
                    
                    <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">Campus</label>
                    <select id="auth-campus" required style="margin-bottom: 20px;">
                        <option value="ks-layout">KS Layout Campus</option>
                        <option value="kanakapura">Harohalli (Kanakapura) Campus</option>
                    </select>

                    <button type="submit" class="btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span class="material-symbols-rounded">verified_user</span>
                        <span>Sign In &amp; Continue</span>
                    </button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.style.opacity = '1';
        if (hasClientId && window.google && window.google.accounts) {
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
                console.log('Google Identity Services custom initialization.');
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
    const emailInput = document.getElementById('auth-email');
    const email = (emailInput && emailInput.value.trim()) ? emailInput.value.trim() : (name.toLowerCase().replace(/\s+/g, '.') + "@dsu.edu.in");
    const branch = document.getElementById('auth-branch').value;
    const campus = document.getElementById('auth-campus').value;

    const user = {
        id: 'u-' + Date.now(),
        name: name,
        email: email,
        branch: branch,
        year: "1st Year",
        campus: campus,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        profileComplete: true
    };

    window.dsuDb.saveUser(user);
    closeAuthModal(form);

    showToast(`Welcome, ${name}! Logged in as verified student.`);
    setTimeout(() => {
        window.location.href = getRootPath() + 'knots/index.html';
    }, 1000);
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
