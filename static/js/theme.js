/* ==========================================================================
   DSU KnotSpot Theme Controller
   Supports Dark / Light Mode with instant hydration and zero FOUC
   ========================================================================== */

(function() {
    // Immediate execution before DOM render to prevent white flash
    const savedTheme = localStorage.getItem('knotspot_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
})();

window.toggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('knotspot_theme', next);
    updateThemeIcons();
};

function updateThemeIcons() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        const icon = btn.querySelector('.material-symbols-rounded') || btn.querySelector('i');
        if (icon) {
            if (icon.classList.contains('material-symbols-rounded')) {
                icon.textContent = current === 'dark' ? 'light_mode' : 'dark_mode';
            } else {
                icon.className = current === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        btn.setAttribute('aria-label', current === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        btn.setAttribute('title', current === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
}

document.addEventListener('DOMContentLoaded', updateThemeIcons);
