/* ==========================================================================
   DSU KnotSpot Database Engine (localStorage Wrapper)
   Provides Seed Data, CRUD operations, state caching, and persistence
   ========================================================================== */

const DSU_CAMPUSES = [
    { id: 'ks-layout', name: 'KS Layout Campus' },
    { id: 'kanakapura', name: 'Harohalli (Kanakapura) Campus' }
];

const SEED_USER = {
    name: "Aarav Sharma",
    email: "aarav.sharma@dsu.edu.in",
    campus: "ks-layout",
    branch: "Computer Science (CSE)",
    year: "3rd Year",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    profileComplete: true
};

const SEED_KNOTS = [
    {
        id: "k-1",
        title: "Is Kanakapura Campus hostel food better than local PGs?",
        content: "Honestly, the mess food at Harohalli is decent on some days (Sunday Biryani is good!), but looking for honest reviews of local PGs nearby. Are there any good PG options near the main road with good food?",
        category: "General",
        campus: "kanakapura",
        authorName: "Ananya Iyer",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        upvotes: 18,
        starred: false,
        commentsCount: 3,
        createdAt: "2026-07-18T14:32:00Z",
        upvotedBy: []
    },
    {
        id: "k-2",
        title: "How to clear the DSU Maths-II final exams? Any advice?",
        content: "Our math professor is super strict and the papers are always tricky. Are there any YouTube channels or specific question banks (VTU/DSU syllabus) that you guys recommend? Please help!",
        category: "Academics",
        campus: "ks-layout",
        authorName: "Rohan Das",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        upvotes: 24,
        starred: true,
        commentsCount: 2,
        createdAt: "2026-07-19T09:15:00Z",
        upvotedBy: []
    },
    {
        id: "k-3",
        title: "DSU Hackathon 'Dayananda Sagar Innovates' registration opens next week!",
        content: "DSU Innovation Club is hosting a 36-hour hackathon with cash prizes up to 1 Lakh. Teams of 2-4. Registration starts next Monday. Looking for a designer and a frontend dev to join my team. Hit me up if interested!",
        category: "Coding",
        campus: "ks-layout",
        authorName: "Karthik Raja",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        upvotes: 35,
        starred: false,
        commentsCount: 4,
        createdAt: "2026-07-19T11:00:00Z",
        upvotedBy: []
    }
];

const SEED_COMMENTS = [
    {
        id: "c-1",
        knotId: "k-1",
        content: "Honestly, PG food near Harohalli is average. Your best bet is to get a room at Green View PG, or just order tiffin service. Biryani day in mess is unbeatable though!",
        authorName: "Vikram Malhotra",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-07-18T16:00:00Z"
    },
    {
        id: "c-2",
        knotId: "k-1",
        content: "Can verify. Green View is good. Cleaning is regular, but Wi-Fi speed goes down in the evening.",
        authorName: "Neha Sen",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-07-18T17:15:00Z"
    },
    {
        id: "c-3",
        knotId: "k-1",
        content: "Thanks guys! Will check out Green View tomorrow.",
        authorName: "Ananya Iyer",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-07-18T19:00:00Z"
    },
    {
        id: "c-4",
        knotId: "k-2",
        content: "Check out Gajendra Purohit on YouTube. He covers engineering mathematics concepts really well. Also solve last 3 years internal papers.",
        authorName: "Sameer Joshi",
        authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-07-19T10:00:00Z"
    },
    {
        id: "c-5",
        knotId: "k-2",
        content: "Thanks, Gajendra Purohit is a savior. Will check it out.",
        authorName: "Rohan Das",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-07-19T10:30:00Z"
    },
    {
        id: "c-6",
        knotId: "k-3",
        content: "I'm a frontend developer in React/Tailwind, would love to join. Which tech stack are you planning to use?",
        authorName: "Pooja Hegde",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-07-19T12:00:00Z"
    }
];

const SEED_CONFESSIONS = [
    {
        id: "conf-1",
        content: "I accidentally walked into the staff room thinking it was the seminar hall, and sat through a 15-minute departmental meeting before anyone noticed. The HOD just stared at me when I finally got up to leave.",
        campus: "ks-layout",
        likesCount: 42,
        commentsCount: 2,
        createdAt: "2026-07-19T02:30:00Z",
        likedBy: []
    },
    {
        id: "conf-2",
        content: "To the student who took my CSE lab manual from the central library table on Friday: please return it! My final internal marks depend on that submission, and I don't want to re-write 20 coding experiments.",
        campus: "ks-layout",
        likesCount: 28,
        commentsCount: 1,
        createdAt: "2026-07-19T08:45:00Z",
        likedBy: []
    },
    {
        id: "conf-3",
        content: "I secretly log into the Kanakapura Campus computer lab PCs and change all the desktop wallpapers to photos of cats. I've done it on 40 computers so far. No regrets.",
        campus: "kanakapura",
        likesCount: 56,
        commentsCount: 0,
        createdAt: "2026-07-19T10:20:00Z",
        likedBy: []
    }
];

const SEED_CONF_COMMENTS = [
    {
        id: "cc-1",
        confessionId: "conf-1",
        content: "Classic! Did they make you sign an attendance sheet? 😂",
        authorName: "Anonymous Tiger",
        createdAt: "2026-07-19T03:00:00Z"
    },
    {
        id: "cc-2",
        confessionId: "conf-1",
        content: "HOD probably thought you were a highly motivated student attending extra lectures.",
        authorName: "Anonymous Ninja",
        createdAt: "2026-07-19T04:10:00Z"
    },
    {
        id: "cc-3",
        confessionId: "conf-2",
        content: "Check with the librarian, sometimes they clear the tables and keep lost manuals at the counter.",
        authorName: "Anonymous Owl",
        createdAt: "2026-07-19T09:00:00Z"
    }
];

const SEED_ROOMS = [
    {
        id: "r-1",
        title: "Fully Furnished 1 BHK (Double sharing) - near KS Layout Campus",
        description: "Looking for a female roommate. 1 BHK apartment situated 5 minutes walk from DSU Kumaraswamy Layout campus. High-speed Wi-Fi, geyser, refrigerator, washing machine, and cupboard available. Vegetarian preferred.",
        rent: 5500,
        campus: "ks-layout",
        roomType: "Sharing PG / Room",
        contact: "+91 98765 43210",
        authorName: "Meera Nair",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-07-17T09:00:00Z",
        images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"]
    },
    {
        id: "r-2",
        title: "Spacious Room in 2 BHK Flat - near Harohalli Campus",
        description: "Single room available for male student in a 2 BHK gated society flat. Very quiet area, perfect for study. The flat is fully set up, roommate is a final year CSE student. 10 mins ride to DSU Kanakapura Campus.",
        rent: 4200,
        campus: "kanakapura",
        roomType: "Room in Flat",
        contact: "+91 99887 76655",
        authorName: "Siddharth Sen",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-07-18T12:00:00Z",
        images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80"]
    },
    {
        id: "r-3",
        title: "Single PG Room near DSU KS Layout",
        description: "Cozy single occupancy room in a student hostel building. Food included (3 meals/day). Hot water, daily housekeeping, security, and power backup. Looking for any DSU student.",
        rent: 8500,
        campus: "ks-layout",
        roomType: "Single Room PG",
        contact: "+91 88877 66554",
        authorName: "Amit Patel",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        createdAt: "2026-07-19T06:30:00Z",
        images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80"]
    }
];

const SEED_EVENTS = [
    {
        id: "ev-1",
        title: "Derby 2026 - DSU Annual Cultural Fest",
        description: "The biggest university event of the year! Live concerts, street dancing, fashion show, gaming battle, food stalls, and cultural performances. DJ Night featuring a top Indian artist. Do not miss it!",
        date: "Aug 14, 2026",
        time: "10:00 AM - 9:00 PM",
        venue: "Harohalli Campus Grounds",
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
        rsvpsCount: 245,
        hasRsvp: false
    },
    {
        id: "ev-2",
        title: "DSU Code-a-Thon 2026",
        description: "Join the DSU coding marathon! Solve challenging problems in data structures, algorithms, and build working web models. Great prizes, certificates for all participants, and internship interviews with top sponsors.",
        date: "Jul 28, 2026",
        time: "9:00 AM - 6:00 PM",
        venue: "KS Layout Engineering Block CSE Labs",
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
        rsvpsCount: 89,
        hasRsvp: true
    },
    {
        id: "ev-3",
        title: "Guest Lecture: AI & The Future of Careers",
        description: "Special guest seminar by a senior AI researcher from Google DeepMind. Learn how generative models are reshaping industries, what skills are in high demand, and how to build a portfolio during your college years.",
        date: "Aug 02, 2026",
        time: "2:30 PM - 4:00 PM",
        venue: "Dental College Auditorium, KS Layout",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        rsvpsCount: 154,
        hasRsvp: false
    }
];

// Initialize Database in LocalStorage if not present
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

const API_BASE = 'http://localhost:5000/api';

// Helper to make API requests with fallback
async function apiFetch(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options
        });
        if (res.ok) return await res.json();
    } catch (e) {
        console.warn('API server unreachable, using local storage fallback.', e);
    }
    return null;
}

// DB Access Methods
const db = {
    // Current User Profile
    getUser() {
        return JSON.parse(localStorage.getItem('dsu_user'));
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
        localStorage.removeItem('dsu_user');
        apiFetch('/logout', { method: 'POST' });
    },

    // Knots (Forum Discussions)
    getKnots() {
        return JSON.parse(localStorage.getItem('dsu_knots'));
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
                knot.upvotes -= 1;
                knot.upvotedBy.splice(index, 1);
            }
            localStorage.setItem('dsu_knots', JSON.stringify(knots));
        }
        return knot;
    },
    starKnot(id) {
        const knots = this.getKnots();
        const knot = knots.find(k => k.id === id);
        if (knot) {
            knot.starred = !knot.starred;
            localStorage.setItem('dsu_knots', JSON.stringify(knots));
        }
        return knot;
    },

    // Comments for Knots
    getKnotComments(knotId) {
        const comments = JSON.parse(localStorage.getItem('dsu_comments'));
        return comments.filter(c => c.knotId === knotId).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    addKnotComment(knotId, content) {
        const comments = JSON.parse(localStorage.getItem('dsu_comments'));
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

        // Update comment counter in parent knot
        const knots = this.getKnots();
        const knot = knots.find(k => k.id === knotId);
        if (knot) {
            knot.commentsCount = (knot.commentsCount || 0) + 1;
            localStorage.setItem('dsu_knots', JSON.stringify(knots));
        }

        return newComment;
    },

    // Anonymous Confessions
    getConfessions() {
        return JSON.parse(localStorage.getItem('dsu_confessions'));
    },
    getConfession(id) {
        const confessions = this.getConfessions();
        return confessions.find(c => c.id === id);
    },
    createConfession(content, campus) {
        const confessions = this.getConfessions();
        
        // Random Anonymous names
        const names = ["Anonymous Tiger", "Silent Cadet", "DSU Maverick", "Ghost Coder", "Hidden Sagarite", "Campus Phantom"];
        const randomName = names[Math.floor(Math.random() * names.length)];

        const newConf = {
            id: "conf-" + Date.now(),
            content: content,
            campus: campus,
            likesCount: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            likedBy: [],
            anonymousName: randomName
        };
        confessions.unshift(newConf);
        localStorage.setItem('dsu_confessions', JSON.stringify(confessions));
        return newConf;
    },
    likeConfession(id) {
        const confessions = this.getConfessions();
        const user = this.getUser();
        const userEmail = user ? user.email : "guest";
        const conf = confessions.find(c => c.id === id);
        if (conf) {
            if (!conf.likedBy) conf.likedBy = [];
            const index = conf.likedBy.indexOf(userEmail);
            if (index === -1) {
                conf.likesCount += 1;
                conf.likedBy.push(userEmail);
            } else {
                conf.likesCount -= 1;
                conf.likedBy.splice(index, 1);
            }
            localStorage.setItem('dsu_confessions', JSON.stringify(confessions));
        }
        return conf;
    },

    // Comments for Confessions
    getConfessionComments(confessionId) {
        const comments = JSON.parse(localStorage.getItem('dsu_conf_comments'));
        return comments.filter(c => c.confessionId === confessionId).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    addConfessionComment(confessionId, content) {
        const comments = JSON.parse(localStorage.getItem('dsu_conf_comments'));
        
        // Anonymous reply name
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

        // Update comment counter in confession
        const confessions = this.getConfessions();
        const conf = confessions.find(c => c.id === confessionId);
        if (conf) {
            conf.commentsCount = (conf.commentsCount || 0) + 1;
            localStorage.setItem('dsu_confessions', JSON.stringify(confessions));
        }

        return newComment;
    },

    // Roommate Finder Listings
    getRooms() {
        return JSON.parse(localStorage.getItem('dsu_rooms'));
    },
    createRoomListing(title, description, rent, campus, roomType, contact, imageUrl) {
        const rooms = this.getRooms();
        const user = this.getUser();
        const newRoom = {
            id: "r-" + Date.now(),
            title: title,
            description: description,
            rent: Number(rent),
            campus: campus,
            roomType: roomType,
            contact: contact,
            authorName: user ? user.name : "Student",
            authorAvatar: user ? user.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            createdAt: new Date().toISOString(),
            images: [imageUrl || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"]
        };
        rooms.unshift(newRoom);
        localStorage.setItem('dsu_rooms', JSON.stringify(rooms));
        return newRoom;
    },

    // Events Tracker
    getEvents() {
        return JSON.parse(localStorage.getItem('dsu_events'));
    },
    rsvpEvent(id) {
        const events = this.getEvents();
        const ev = events.find(e => e.id === id);
        if (ev) {
            ev.hasRsvp = !ev.hasRsvp;
            ev.rsvpsCount = ev.hasRsvp ? ev.rsvpsCount + 1 : ev.rsvpsCount - 1;
            localStorage.setItem('dsu_events', JSON.stringify(events));
        }
        return ev;
    }
};

window.dsuDb = db;
window.DSU_CAMPUSES = DSU_CAMPUSES;
