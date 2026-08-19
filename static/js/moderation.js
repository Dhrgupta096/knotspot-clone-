/* ==========================================================================
   DSU KnotSpot Safety & Moderation Engine
   - Content Filtering (Anti-Doxxing & Anti-Harassment)
   - Real-time Report System
   - Student Community Safety Rules
   ========================================================================== */

const BANNED_PATTERNS = [
    // Phone numbers detection (anti-doxxing in anonymous posts)
    /\b(\+91[\-\s]?)?[6789]\d{9}\b/g,
    /\b\d{5}[\s\-]?\d{5}\b/g,
    // Severe harassment/abuse triggers
    /\b(kill yourself|die|bitch|slut|whore|retard|faggot|nigger|terrorist)\b/i
];

const DSU_SAFETY_RULES = `
<div style="font-size: 13px; line-height: 1.6; color: var(--text-main);">
    <h4 style="margin-top:0; color:var(--primary); font-size:15px;">🛡️ DSU Student Community Guidelines</h4>
    <p>KnotSpot is built by and for Dayananda Sagar University students. To protect everyone's privacy and safety:</p>
    <ul style="padding-left: 18px; margin-bottom: 14px;">
        <li><strong>No Doxxing:</strong> Never share personal phone numbers, hostel room numbers, or roll numbers in anonymous posts.</li>
        <li><strong>Zero Bullying:</strong> Targeted harassment or defamation of students or faculty will lead to account suspension.</li>
        <li><strong>Authenticity:</strong> Roommate listings must belong to genuine students.</li>
    </ul>
    <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 0;">Violations are logged and reviewed by student moderators.</p>
</div>
`;

const moderationEngine = {
    // Validate text before publishing
    validateContent(text) {
        if (!text || typeof text !== 'string') return { valid: false, reason: "Content cannot be empty." };
        
        for (const pattern of BANNED_PATTERNS) {
            if (pattern.test(text)) {
                return {
                    valid: false,
                    reason: "Post blocked: contains phone numbers or prohibited words violating DSU Community Guidelines (Anti-Doxxing Policy)."
                };
            }
        }
        return { valid: true };
    },

    // Report modal trigger
    openReportModal(targetId, targetType = 'confession') {
        const user = window.dsuDb ? window.dsuDb.getUser() : null;
        if (!user) {
            if (window.showToast) window.showToast("Please log in to report content.", "accent");
            return;
        }

        // Clean up any existing overlay
        const existing = document.getElementById('report-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'report-modal-overlay';
        overlay.style.zIndex = '9999';
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };

        overlay.innerHTML = `
            <div class="modal-sheet" style="max-width: 420px;">
                <div class="modal-header">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-rounded" style="color: #ef4444;">flag</span>
                        <h3 style="margin: 0; font-size: 16px;">Report Content</h3>
                    </div>
                    <button type="button" class="modal-close-btn" onclick="document.getElementById('report-modal-overlay').remove()">
                        <span class="material-symbols-rounded">close</span>
                    </button>
                </div>
                <div class="modal-body" style="padding-bottom: 16px;">
                    <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px;">
                        Help keep DSU KnotSpot safe. Select the reason for reporting this ${targetType}:
                    </p>
                    <form onsubmit="moderationEngine.submitReport(event, '${targetId}', '${targetType}')">
                        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                            <label class="checkbox-label" style="background: var(--surface-muted); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border);">
                                <input type="radio" name="report_reason" value="harassment" required checked>
                                <span>Harassment / Targeted Bullying</span>
                            </label>
                            <label class="checkbox-label" style="background: var(--surface-muted); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border);">
                                <input type="radio" name="report_reason" value="doxxing" required>
                                <span>Doxxing (Leaking Phone / Personal Info)</span>
                            </label>
                            <label class="checkbox-label" style="background: var(--surface-muted); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border);">
                                <input type="radio" name="report_reason" value="hate_speech" required>
                                <span>Hate Speech / Inappropriate Content</span>
                            </label>
                            <label class="checkbox-label" style="background: var(--surface-muted); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border);">
                                <input type="radio" name="report_reason" value="spam" required>
                                <span>Spam / Commercial Ads</span>
                            </label>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; background: #ef4444; border: none;">
                            Submit Report
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    // Submit report to server
    async submitReport(e, targetId, targetType) {
        e.preventDefault();
        const reasonInput = document.querySelector('input[name="report_reason"]:checked');
        const reason = reasonInput ? reasonInput.value : 'unspecified';
        const user = window.dsuDb ? window.dsuDb.getUser() : null;

        try {
            const apiBase = window.LOCATION_API_BASE || `http://${window.location.hostname || 'localhost'}:5000/api`;
            await fetch(`${apiBase}/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetId,
                    targetType,
                    reason,
                    reporterEmail: user ? user.email : 'anonymous'
                })
            });
        } catch (err) {}

        const overlay = document.getElementById('report-modal-overlay');
        if (overlay) overlay.remove();

        // Visually fade or collapse reported item
        const card = document.getElementById(`conf-card-${targetId}`) || document.getElementById(`knot-card-${targetId}`);
        if (card) {
            card.style.opacity = '0.35';
            card.style.pointerEvents = 'none';
        }

        if (window.showToast) {
            window.showToast("Report submitted. Thank you for keeping DSU safe!", "accent");
        }
    },

    // Show community guidelines modal
    showGuidelinesModal() {
        const existing = document.getElementById('guidelines-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'guidelines-modal-overlay';
        overlay.style.zIndex = '9999';
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };

        overlay.innerHTML = `
            <div class="modal-sheet" style="max-width: 440px;">
                <div class="modal-header">
                    <h3 style="margin: 0; font-size: 16px;">Community Guidelines</h3>
                    <button type="button" class="modal-close-btn" onclick="document.getElementById('guidelines-modal-overlay').remove()">
                        <span class="material-symbols-rounded">close</span>
                    </button>
                </div>
                <div class="modal-body" style="padding-bottom: 16px;">
                    ${DSU_SAFETY_RULES}
                    <button type="button" class="btn-primary" style="width: 100%; margin-top: 16px;" onclick="document.getElementById('guidelines-modal-overlay').remove()">
                        I Understand
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
};

window.moderationEngine = moderationEngine;
