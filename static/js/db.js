/* ==========================================================================
   DSU KnotSpot Database Engine
   Hybrid Architecture: LocalStorage Cache + Python REST API Bi-directional Sync
   Realistic Dayananda Sagar University (DSU) Campus Data
   ========================================================================== */

const DSU_CAMPUSES = [
    { id: 'ks-layout', name: 'KS Layout Campus (City Campus)' },
    { id: 'kanakapura', name: 'Harohalli (Kanakapura Road) Main Campus' }
];

const SEED_USER = {
    name: "Dhruv Gupta",
    email: "dhruv.gupta@dsu.edu.in",
    campus: "ks-layout",
    branch: "Computer Science & Engineering",
    year: "3rd Year",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    profileComplete: true
};

const SEED_KNOTS = [
    {
        id: "k-1",
        title: "Harohalli Shuttle Bus timings from Banashankari & Silk Institute Metro?",
        content: "Does anyone have the updated 2026 timetable for the official DSU University shuttle buses? Especially the morning 7:45 AM batch from Banashankari Bus Stand and the feeder shuttle from Silk Institute Metro Station on Kanakapura Green Line. Please drop the schedule below!",
        category: "General",
        campus: "kanakapura",
        authorName: "Ananya Iyer",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        upvotes: 42,
        starred: true,
        commentsCount: 3,
        createdAt: "2026-08-18T14:32:00Z",
        upvotedBy: []
    },
    {
        id: "k-2",
        title: "DSU CIE-2 Internals & Math-IV Engineering Revision Resources",
        content: "With the second Continuous Internal Evaluation (CIE) coming up next week, can seniors share previous year question papers for Math-IV (Probability & Statistics) and Operating Systems? Also, does professor give marks for VTU-format solutions or strictly autonomous DSU answer schemes?",
        category: "Academics",
        campus: "ks-layout",
        authorName: "Rohan Das",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        upvotes: 67,
        starred: true,
        commentsCount: 3,
        createdAt: "2026-08-18T16:15:00Z",
        upvotedBy: []
    },
    {
        id: "k-3",
        title: "DSU Hackathon 'Dayananda Sagar Innovates 2026' - Team Formation",
        content: "The AIC-DSU (Atal Incubation Center) is hosting a 36-hour national hackathon with cash prize pool of 1.5 Lakhs! Tracks include Generative AI, Smart Healthcare, and FinTech. Looking for 1 UI/UX designer and 1 backend developer proficient in Python/FastAPI. Hit me up if interested!",
        category: "Coding",
        campus: "kanakapura",
        authorName: "Karthik Raja",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        upvotes: 94,
        starred: false,
        commentsCount: 4,
        createdAt: "2026-08-18T18:00:00Z",
        upvotedBy: []
    },
    {
        id: "k-4",
        title: "Best lunch spots near KS Layout Campus - Sagar Food Court vs Kadirenahalli Cross",
        content: "Rank your top 3 affordable hangout food spots around KS Layout 1st/2nd Stage. Sagar Canteen dosa is classic, but looking for good roll joints, thali meals, and tea stalls between afternoon breaks.",
        category: "Campus Life",
        campus: "ks-layout",
        authorName: "Pooja Hegde",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        upvotes: 53,
        starred: false,
        commentsCount: 2,
        createdAt: "2026-08-19T08:20:00Z",
        upvotedBy: []
    }
];

const SEED_COMMENTS = [
    {
        id: "c-1",
        knotId: "k-1",
        content: "The Banashankari shuttle leaves sharp at 7:50 AM from TTMC Gate 2. Silk Institute Metro pickup runs every 20 mins from 8:15 AM to 9:15 AM.",
        authorName: "Siddharth M",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-08-18T15:10:00Z"
    },
    {
        id: "c-2",
        knotId: "k-1",
        content: "Make sure to carry your physical DSU Student ID card, security checks it before boarding the Kanakapura highway bus.",
        authorName: "Priya Sharma",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-08-18T16:00:00Z"
    },
    {
        id: "c-3",
        knotId: "k-1",
        content: "Pro tip: Download Namma Metro app, Silk Institute is terminal station so you always get a seat on the return journey!",
        authorName: "Varun K",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-08-18T18:45:00Z"
    },
    {
        id: "c-4",
        knotId: "k-2",
        content: "DSU evaluation strictly follows class slide notes and textbook references. Solved papers are uploaded on the DSU LMS portal under 'Engineering Resources'.",
        authorName: "Neha Patil",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-08-18T17:00:00Z"
    },
    {
        id: "c-5",
        knotId: "k-2",
        content: "Watch Gajendra Purohit on YouTube for Probability Distributions, helped me score O grade in Math-III.",
        authorName: "Sameer Joshi",
        authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-08-18T17:30:00Z"
    },
    {
        id: "c-6",
        knotId: "k-3",
        content: "I am an AIML 3rd year student working with PyTorch and React. Would love to join the team! DM on WhatsApp.",
        authorName: "Pooja Hegde",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-08-18T19:00:00Z"
    }
];

const SEED_CONFESSIONS = [
    {
        id: "conf-1",
        content: "I accidentally walked into the Mechanical Engineering Faculty meeting in Heritage Block thinking it was the Python seminar room, and sat through a 15-minute budget debate before anyone noticed. The Dean just smiled at me when I finally sneaked out.",
        campus: "ks-layout",
        category: "Funny",
        likesCount: 86,
        reactions: { heart: 34, fire: 28, skull: 22, cry: 2 },
        userReactions: {},
        commentsCount: 2,
        createdAt: "2026-08-18T14:30:00Z",
        likedBy: [],
        anonymousName: "Silent Cadet"
    },
    {
        id: "conf-2",
        content: "To the student who picked up my blue DSU spiral lab record from the Central Library 2nd floor cubicle on Friday: please drop it at the lost & found desk! My CIE submission deadline is tomorrow.",
        campus: "kanakapura",
        category: "Exams",
        likesCount: 52,
        reactions: { heart: 8, fire: 12, skull: 14, cry: 18 },
        userReactions: {},
        commentsCount: 1,
        createdAt: "2026-08-18T19:45:00Z",
        likedBy: [],
        anonymousName: "Shadow Scholar"
    },
    {
        id: "conf-3",
        content: "I have tested every single coffee vending machine across KS Layout Dental, Pharmacy, and Engineering blocks. The machine on 3rd floor CSE wing makes the undisputed best filter coffee at ₹15.",
        campus: "ks-layout",
        category: "Campus Life",
        likesCount: 114,
        reactions: { heart: 55, fire: 42, skull: 15, cry: 2 },
        userReactions: {},
        commentsCount: 2,
        createdAt: "2026-08-19T06:20:00Z",
        likedBy: [],
        anonymousName: "Midnight Sagarite"
    }
];

const SEED_CONF_COMMENTS = [
    {
        id: "cc-1",
        confessionId: "conf-1",
        content: "Classic DSU moment! At least you didn't get assigned departmental committee duties 😂",
        authorName: "Anonymous Tiger",
        createdAt: "2026-08-18T15:00:00Z"
    },
    {
        id: "cc-2",
        confessionId: "conf-1",
        content: "Dean probably thought you were the most attentive student in the faculty!",
        authorName: "Anonymous Ninja",
        createdAt: "2026-08-18T16:10:00Z"
    },
    {
        id: "cc-3",
        confessionId: "conf-2",
        content: "Check with the librarian at front desk, they clear tables every evening at 7:30 PM.",
        authorName: "Anonymous Owl",
        createdAt: "2026-08-18T20:00:00Z"
    },
    {
        id: "cc-4",
        confessionId: "conf-3",
        content: "Can confirm! The 3rd floor CSE machine is always refilled first by the canteen staff.",
        authorName: "Ghost Coder",
        createdAt: "2026-08-19T07:15:00Z"
    }
];

const SEED_ROOMS = [
    {
        id: "r-1",
        title: "DSU On-Campus Girls Hostel (Block-B) - 2 Seater Sharing Vacancy",
        description: "Looking for a female roommate for a 2-seater room in DSU Harohalli Campus Girls Hostel Block-B. Room features attached washroom, study desks, high-speed campus Wi-Fi, 3-times hygienic mess meals, and 24x7 power backup. CSE/AIML/ECE student preferred.",
        rent: 6800,
        campus: "kanakapura",
        roomType: "College Hostel",
        genderPref: "Girls Only",
        seaterType: "2 Seater",
        hostelType: "College Hostel",
        preferredBranch: "Computer Science & Engineering",
        contact: "+91 98765 43210",
        authorEmail: "meera.nair@dsu.edu.in",
        amenities: ["Wi-Fi 📶", "Mess Food 🍽️", "Attached Bath 🚿", "Power Backup ⚡", "CCTV Security 🔒"],
        authorName: "Meera Nair",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-08-17T09:00:00Z",
        images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80"]
    },
    {
        id: "r-2",
        title: "Royal Comfort PG near KS Layout 2nd Stage (5 Mins to DSU Gate)",
        description: "1 spot available for male student in a 2-seater executive PG room near KS Layout 2nd Stage, right behind Dayananda Sagar College campus. Includes high-speed optical fiber Wi-Fi, daily North/South Indian meals, washing machine, hot water, and lift.",
        rent: 5500,
        campus: "ks-layout",
        roomType: "Sharing PG / Room",
        genderPref: "Boys Only",
        seaterType: "2 Seater",
        hostelType: "Private PG",
        preferredBranch: "Any Branch",
        contact: "+91 99887 76655",
        authorEmail: "siddharth.sen@dsu.edu.in",
        amenities: ["Wi-Fi 📶", "2x Food 🍛", "Washing Machine 🧺", "Hot Water ♨️"],
        authorName: "Siddharth Sen",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-08-18T12:00:00Z",
        images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80"]
    },
    {
        id: "r-3",
        title: "Harohalli Green Valley PG - 3 Seater Budget Room (Close to Main Gate)",
        description: "Spacious 3-seater room in Green Valley PG on Harohalli Main Road, 400m from DSU Campus gate. Includes 3-time meals, power backup, study library, and bike parking. Ideal for 1st & 2nd year students.",
        rent: 4200,
        campus: "kanakapura",
        roomType: "Sharing PG / Room",
        genderPref: "Boys Only",
        seaterType: "3 Seater",
        hostelType: "Private PG",
        preferredBranch: "School of Engineering",
        contact: "+91 91234 56789",
        authorEmail: "kunal.verma@dsu.edu.in",
        amenities: ["Wi-Fi 📶", "3x Food 🍽️", "Bike Parking 🛵", "Hot Water ♨️"],
        authorName: "Kunal Verma",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-08-19T06:30:00Z",
        images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"]
    }
];

const SEED_EVENTS = [
    {
        id: "ev-1",
        title: "DERBY 2026 - DSU Flagship Annual Cultural Fest & DJ Night",
        description: "The biggest university festival of the year! 3 days of high-voltage celebrations: Battle of the Bands, Street Dance Battles, National Fashion Show 'GlamSagar', Pro-DJ Night featuring top Indian EDM artists, food carnivals, and gaming tournaments. Open to all DSU schools & campuses!",
        date: "Aug 22, 2026",
        isoDate: "2026-08-22T10:00:00",
        time: "10:00 AM - 10:00 PM",
        venue: "Harohalli Campus Grounds & Amphitheatre",
        category: "Cultural & Fests",
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
        rsvpsCount: 380,
        hasRsvp: false
    },
    {
        id: "ev-2",
        title: "DSU Hackathon 'Dayananda Sagar Innovates 2026' (36h Hackfest)",
        description: "AIC-DSU Foundation 36-hour national hackathon. Build scalable projects across GenAI, Autonomous Tech, and FinTech. Cash prize pool: ₹1,50,000 + direct incubation grants and sponsor internship fast-track interviews!",
        date: "Aug 26, 2026",
        isoDate: "2026-08-26T09:00:00",
        time: "9:00 AM - 6:00 PM",
        venue: "AIC-DSU Innovation Center, Harohalli",
        category: "Hackathons",
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
        rsvpsCount: 145,
        hasRsvp: true
    },
    {
        id: "ev-3",
        title: "IEEE Tech-Vision: Generative AI & Deep Learning Masterclass",
        description: "Hands-on workshop on Large Language Models, Multi-agent Architecture, and Computer Vision by Google DeepMind & industry practitioners. E-Certificates and project credits for all attendees.",
        date: "Aug 29, 2026",
        isoDate: "2026-08-29T14:00:00",
        time: "2:00 PM - 5:00 PM",
        venue: "Dr. Premachandra Sagar Auditorium, Dental Block, KS Layout",
        category: "Workshops",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        rsvpsCount: 210,
        hasRsvp: false
    },
    {
        id: "ev-4",
        title: "SPARDHA 2026 - DSU Inter-Campus Football & Cricket Cup",
        description: "Annual sports clash between KS Layout & Harohalli campuses! Knockout 7-a-side football, T10 cricket, basketball, and badminton championships. Register your branch teams with the sports directorate.",
        date: "Sep 04, 2026",
        isoDate: "2026-09-04T08:30:00",
        time: "8:30 AM - 5:30 PM",
        venue: "DSU Sports Complex & Turf Ground, Harohalli",
        category: "Sports",
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
        rsvpsCount: 178,
        hasRsvp: false
    }
];

// Initialize LocalStorage with Seeds if not present
function initDatabase() {
    if (!localStorage.getItem('dsu_user')) {
        localStorage.setItem('dsu_user', JSON.stringify(SEED_USER));
    }
    if (!localStorage.getItem('dsu_knots')) {
        localStorage.setItem('dsu_knots', JSON.stringify(SEED_KNOTS));
    }
    if (!localStorage.getItem('dsu_comments')) {
        localStorage.setItem('dsu_comments', JSON.stringify(SEED_COMMENTS));
    }
    if (!localStorage.getItem('dsu_confessions')) {
        localStorage.setItem('dsu_confessions', JSON.stringify(SEED_CONFESSIONS));
    }
    if (!localStorage.getItem('dsu_conf_comments')) {
        localStorage.setItem('dsu_conf_comments', JSON.stringify(SEED_CONF_COMMENTS));
    }
    if (!localStorage.getItem('dsu_rooms')) {
        localStorage.setItem('dsu_rooms', JSON.stringify(SEED_ROOMS));
    }
    if (!localStorage.getItem('dsu_events')) {
        localStorage.setItem('dsu_events', JSON.stringify(SEED_EVENTS));
    }
}

initDatabase();

const API_HOSTNAME = window.location.hostname || 'localhost';
const API_BASE = window.LOCATION_API_BASE || `http://${API_HOSTNAME}:5000/api`;

// Helper to make API requests with graceful fallback
async function apiFetch(endpoint, options = {}) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            signal: controller.signal,
            ...options
        });
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
    } catch (e) {
        // Fallback silently to localStorage cache
    }
    return null;
}

let _lastSyncTimestamp = 0;
const SYNC_THROTTLE_MS = 15000; // 15 seconds throttle

// Background sync on load (throttled)
async function syncDataFromServer(force = false) {
    const now = Date.now();
    if (!force && (now - _lastSyncTimestamp < SYNC_THROTTLE_MS)) {
        return; // Skip duplicate sync within 15 seconds
    }
    _lastSyncTimestamp = now;

    try {
        const [knots, confessions, rooms, events] = await Promise.all([
            apiFetch('/knots'),
            apiFetch('/confessions'),
            apiFetch('/rooms'),
            apiFetch('/events')
        ]);

        let hasUpdates = false;
        if (knots && Array.isArray(knots) && knots.length > 0) {
            localStorage.setItem('dsu_knots', JSON.stringify(knots));
            hasUpdates = true;
        }
        if (confessions && Array.isArray(confessions) && confessions.length > 0) {
            localStorage.setItem('dsu_confessions', JSON.stringify(confessions));
            hasUpdates = true;
        }
        if (rooms && Array.isArray(rooms) && rooms.length > 0) {
            localStorage.setItem('dsu_rooms', JSON.stringify(rooms));
            hasUpdates = true;
        }
        if (events && Array.isArray(events) && events.length > 0) {
            localStorage.setItem('dsu_events', JSON.stringify(events));
            hasUpdates = true;
        }

        if (hasUpdates) {
            window.dispatchEvent(new CustomEvent('dsu:data-synced'));
        }
    } catch (e) {}
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => syncDataFromServer(false));
} else {
    syncDataFromServer(false);
}

// Resilient LocalStorage Parser
function safeGetJson(key, fallback = null) {
    try {
        const item = localStorage.getItem(key);
        if (!item) return fallback;
        const parsed = JSON.parse(item);
        return parsed !== null ? parsed : fallback;
    } catch (e) {
        console.warn(`[DSU DB] Corrupted storage for key "${key}", falling back.`);
        return fallback;
    }
}

// DB Access Methods
const db = {
    getUser() {
        return safeGetJson('dsu_user', null);
    },
    async verifyGoogleToken(idToken, branch = 'CSE', campus = 'ks-layout') {
        const res = await apiFetch('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken, branch, campus })
        });
        if (res && !res.error) {
            localStorage.setItem('dsu_user', JSON.stringify(res));
            return res;
        }
        return null;
    },
    saveUser(user) {
        localStorage.setItem('dsu_user', JSON.stringify(user));
        apiFetch('/user', { method: 'POST', body: JSON.stringify(user) });
        return user;
    },
    logoutUser() {
        const user = this.getUser();
        localStorage.removeItem('dsu_user');
        apiFetch('/logout', { method: 'POST', body: JSON.stringify({ userId: user?.id }) });
    },

    // Knots (Forum Discussions)
    getKnots() {
        return safeGetJson('dsu_knots', []);
    },
    getKnot(id) {
        const knots = this.getKnots();
        return knots.find(k => k.id === id);
    },
    createKnot(title, content, category, campus) {
        const knots = this.getKnots();
        const user = this.getUser();
        const newKnot = {
            id: "k-" + Date.now(),
            title: title,
            content: content,
            category: category,
            campus: campus,
            authorName: user ? user.name : "Anonymous student",
            authorAvatar: user ? user.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            upvotes: 0,
            starred: false,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            upvotedBy: []
        };
        knots.unshift(newKnot);
        localStorage.setItem('dsu_knots', JSON.stringify(knots));
        apiFetch('/knots', { method: 'POST', body: JSON.stringify(newKnot) });
        return newKnot;
    },
    upvoteKnot(id) {
        const knots = this.getKnots();
        const user = this.getUser();
        const knot = knots.find(k => k.id === id);
        if (knot) {
            if (!knot.upvotedBy) knot.upvotedBy = [];
            const userEmail = user ? user.email : "guest";
            const index = knot.upvotedBy.indexOf(userEmail);
            if (index === -1) {
                knot.upvotes += 1;
                knot.upvotedBy.push(userEmail);
            } else {
                knot.upvotes = Math.max(0, knot.upvotes - 1);
                knot.upvotedBy.splice(index, 1);
            }
            localStorage.setItem('dsu_knots', JSON.stringify(knots));
            apiFetch('/knots/upvote', { method: 'POST', body: JSON.stringify({ id, userEmail }) });
        }
        return knot;
    },
    starKnot(id) {
        const knots = this.getKnots();
        const knot = knots.find(k => k.id === id);
        if (knot) {
            knot.starred = !knot.starred;
            localStorage.setItem('dsu_knots', JSON.stringify(knots));
            apiFetch('/knots/star', { method: 'POST', body: JSON.stringify({ id }) });
        }
        return knot;
    },

    // Comments for Knots
    getKnotComments(knotId) {
        const comments = safeGetJson('dsu_comments', []);
        return comments.filter(c => c.knotId === knotId).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    addKnotComment(knotId, content) {
        const comments = safeGetJson('dsu_comments', []);
        const user = this.getUser();
        const newComment = {
            id: "c-" + Date.now(),
            knotId: knotId,
            content: content,
            authorName: user ? user.name : "Anonymous student",
            authorAvatar: user ? user.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            createdAt: new Date().toISOString()
        };
        comments.push(newComment);
        localStorage.setItem('dsu_comments', JSON.stringify(comments));

        const knots = this.getKnots();
        const knot = knots.find(k => k.id === knotId);
        if (knot) {
            knot.commentsCount = (knot.commentsCount || 0) + 1;
            localStorage.setItem('dsu_knots', JSON.stringify(knots));
        }

        apiFetch('/knots/comments', { method: 'POST', body: JSON.stringify(newComment) });
        return newComment;
    },

    // Anonymous Confessions
    getConfessions() {
        const confs = safeGetJson('dsu_confessions', []);
        confs.forEach(c => {
            if (!c.reactions) {
                c.reactions = { heart: c.likesCount || 0, fire: 0, skull: 0, cry: 0 };
            }
            if (!c.userReactions) c.userReactions = {};
            if (!c.category) c.category = 'General';
        });
        return confs;
    },
    getConfession(id) {
        const confessions = this.getConfessions();
        return confessions.find(c => c.id === id);
    },
    createConfession(content, campus, category = 'General') {
        const confessions = this.getConfessions();
        const names = ["Anonymous Tiger", "Silent Cadet", "DSU Maverick", "Ghost Coder", "Hidden Sagarite", "Campus Phantom", "Shadow Scholar", "Midnight Sagarite"];
        const randomName = names[Math.floor(Math.random() * names.length)];

        const newConf = {
            id: "conf-" + Date.now(),
            content: content,
            campus: campus,
            category: category,
            likesCount: 0,
            reactions: { heart: 0, fire: 0, skull: 0, cry: 0 },
            userReactions: {},
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            likedBy: [],
            anonymousName: randomName
        };
        confessions.unshift(newConf);
        localStorage.setItem('dsu_confessions', JSON.stringify(confessions));
        apiFetch('/confessions', { method: 'POST', body: JSON.stringify(newConf) });
        return newConf;
    },
    reactConfession(id, reactionType) {
        const confessions = this.getConfessions();
        const user = this.getUser();
        const userEmail = user ? user.email : "guest";
        const conf = confessions.find(c => c.id === id);
        if (conf) {
            if (!conf.reactions) conf.reactions = { heart: conf.likesCount || 0, fire: 0, skull: 0, cry: 0 };
            if (!conf.userReactions) conf.userReactions = {};
            
            const currentReaction = conf.userReactions[userEmail];
            if (currentReaction === reactionType) {
                conf.reactions[reactionType] = Math.max(0, (conf.reactions[reactionType] || 0) - 1);
                delete conf.userReactions[userEmail];
            } else {
                if (currentReaction) {
                    conf.reactions[currentReaction] = Math.max(0, (conf.reactions[currentReaction] || 0) - 1);
                }
                conf.reactions[reactionType] = (conf.reactions[reactionType] || 0) + 1;
                conf.userReactions[userEmail] = reactionType;
            }
            conf.likesCount = Object.values(conf.reactions).reduce((a, b) => a + b, 0);
            localStorage.setItem('dsu_confessions', JSON.stringify(confessions));
            apiFetch('/confessions/react', { method: 'POST', body: JSON.stringify({ id, reactionType, userEmail }) });
        }
        return conf;
    },
    likeConfession(id) {
        return this.reactConfession(id, 'heart');
    },

    // Comments for Confessions
    getConfessionComments(confessionId) {
        const comments = safeGetJson('dsu_conf_comments', []);
        return comments.filter(c => c.confessionId === confessionId).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    addConfessionComment(confessionId, content) {
        const comments = safeGetJson('dsu_conf_comments', []);
        const names = ["Anonymous Ninja", "Curious Owl", "Wandering Brain", "Mystery Student", "Code Debugger"];
        const randomName = names[Math.floor(Math.random() * names.length)];

        const newComment = {
            id: "cc-" + Date.now(),
            confessionId: confessionId,
            content: content,
            authorName: randomName,
            createdAt: new Date().toISOString()
        };
        comments.push(newComment);
        localStorage.setItem('dsu_conf_comments', JSON.stringify(comments));

        const confessions = this.getConfessions();
        const conf = confessions.find(c => c.id === confessionId);
        if (conf) {
            conf.commentsCount = (conf.commentsCount || 0) + 1;
            localStorage.setItem('dsu_confessions', JSON.stringify(confessions));
        }

        apiFetch('/confessions/comments', { method: 'POST', body: JSON.stringify(newComment) });
        return newComment;
    },

    // Roommate Finder Listings
    getRooms() {
        return safeGetJson('dsu_rooms', []);
    },
    calculateRoomMatchScore(room, user) {
        if (!user) return 85;
        let score = 55;

        if (room.campus === user.campus) score += 20;
        if (room.preferredBranch === 'Any Branch' || (user.branch && room.preferredBranch && user.branch.toLowerCase().includes(room.preferredBranch.toLowerCase()))) {
            score += 15;
        }
        if (room.genderPref === 'Any Gender' || (user.gender && room.genderPref.toLowerCase().includes(user.gender.toLowerCase()))) {
            score += 10;
        }
        return Math.min(score, 98);
    },
    createRoomListing(title, description, rent, campus, roomType, genderPref, seaterType, hostelType, preferredBranch, contact, imageUrl, amenities = []) {
        const rooms = this.getRooms();
        const user = this.getUser();
        const newRoom = {
            id: "r-" + Date.now(),
            title: title,
            description: description,
            rent: Number(rent),
            campus: campus,
            roomType: roomType,
            genderPref: genderPref || 'Any Gender',
            seaterType: seaterType || '2 Seater',
            hostelType: hostelType || 'Private PG',
            preferredBranch: preferredBranch || 'Any Branch',
            contact: contact,
            amenities: (amenities && amenities.length > 0) ? amenities : ["Wi-Fi 📶", "Mess Food 🍽️"],
            authorName: user ? user.name : "Student",
            authorAvatar: user ? user.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            authorEmail: user ? user.email : "student@dsu.edu.in",
            createdAt: new Date().toISOString(),
            images: [imageUrl || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"]
        };
        rooms.unshift(newRoom);
        localStorage.setItem('dsu_rooms', JSON.stringify(rooms));
        apiFetch('/rooms', { method: 'POST', body: JSON.stringify(newRoom) });
        return newRoom;
    },

    // Campus Events
    getEvents() {
        return safeGetJson('dsu_events', []);
    },
    rsvpEvent(id) {
        const events = this.getEvents();
        const ev = events.find(e => e.id === id);
        if (ev) {
            ev.hasRsvp = !ev.hasRsvp;
            ev.rsvpsCount = ev.hasRsvp ? ev.rsvpsCount + 1 : Math.max(0, ev.rsvpsCount - 1);
            localStorage.setItem('dsu_events', JSON.stringify(events));
            apiFetch('/events/rsvp', { method: 'POST', body: JSON.stringify({ id }) });
        }
        return ev;
    }
};

window.dsuDb = db;
window.DSU_CAMPUSES = DSU_CAMPUSES;
