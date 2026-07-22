import sqlite3
import os
import json
import time

DB_PATH = os.path.join(os.path.dirname(__file__), 'knotspot.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            google_id TEXT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            verified_email INTEGER DEFAULT 0,
            branch TEXT,
            year TEXT,
            campus TEXT,
            avatar TEXT,
            profile_complete INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Knots (Forum Threads) Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS knots (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL,
            campus TEXT NOT NULL,
            author_name TEXT NOT NULL,
            author_avatar TEXT NOT NULL,
            upvotes INTEGER DEFAULT 0,
            starred INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    ''')

    # Knot Comments Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS knot_comments (
            id TEXT PRIMARY KEY,
            knot_id TEXT NOT NULL,
            content TEXT NOT NULL,
            author_name TEXT NOT NULL,
            author_avatar TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (knot_id) REFERENCES knots (id)
        )
    ''')

    # Confessions Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS confessions (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            campus TEXT NOT NULL,
            likes_count INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    ''')

    # Confession Comments Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS confession_comments (
            id TEXT PRIMARY KEY,
            confession_id TEXT NOT NULL,
            content TEXT NOT NULL,
            author_name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (confession_id) REFERENCES confessions (id)
        )
    ''')

    # Rooms Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rooms (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            rent INTEGER NOT NULL,
            campus TEXT NOT NULL,
            room_type TEXT NOT NULL,
            contact TEXT NOT NULL,
            author_name TEXT NOT NULL,
            author_avatar TEXT NOT NULL,
            images TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')

    # Events Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            location TEXT NOT NULL,
            campus TEXT NOT NULL,
            category TEXT NOT NULL,
            organizer TEXT NOT NULL,
            image TEXT NOT NULL,
            rsvps_count INTEGER DEFAULT 0,
            has_rsvp INTEGER DEFAULT 0
        )
    ''')

    conn.commit()

    # Seed Database if empty
    cursor.execute("SELECT COUNT(*) FROM knots")
    if cursor.fetchone()[0] == 0:
        seed_data(cursor)
        conn.commit()

    conn.close()

def seed_data(cursor):
    # Seed User
    cursor.execute('''
        INSERT OR IGNORE INTO users (id, name, email, branch, year, campus, avatar, profile_complete)
        VALUES ('u-1', 'Aarav Sharma', 'aarav.sharma@dsu.edu.in', 'Computer Science (CSE)', '3rd Year', 'ks-layout',
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80', 1)
    ''')

    # Seed Knots
    knots = [
        ('k-1', 'Is Kanakapura Campus hostel food better than local PGs?',
         'Honestly, the mess food at Harohalli is decent on some days (Sunday Biryani is good!), but looking for honest reviews of local PGs nearby. Are there any good PG options near the main road with good food?',
         'General', 'kanakapura', 'Ananya Iyer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 18, 0, 3, '2026-07-18T14:32:00Z'),
        ('k-2', 'How to clear the DSU Maths-II final exams? Any advice?',
         'Our math professor is super strict and the papers are always tricky. Are there any YouTube channels or specific question banks (VTU/DSU syllabus) that you guys recommend? Please help!',
         'Academics', 'ks-layout', 'Rohan Das', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 24, 1, 2, '2026-07-19T09:15:00Z'),
        ('k-3', 'DSU Hackathon "Dayananda Sagar Innovates" registration opens next week!',
         'DSU Innovation Club is hosting a 36-hour hackathon with cash prizes up to 1 Lakh. Teams of 2-4. Registration starts next Monday. Looking for a designer and a frontend dev to join my team. Hit me up if interested!',
         'Coding', 'ks-layout', 'Karthik Raja', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', 35, 0, 4, '2026-07-19T12:00:00Z')
    ]
    cursor.executemany('INSERT INTO knots VALUES (?,?,?,?,?,?,?,?,?,?,?)', knots)

    # Seed Knot Comments
    knot_comments = [
        ('c-1', 'k-1', 'Check out Green View PG near the Harohalli bus stop. Food is decent and Wi-Fi is fast.', 'Siddharth M', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', '2026-07-18T15:10:00Z'),
        ('c-2', 'k-1', 'Mess food isn\'t terrible, but Sunday chicken biryani runs out fast if you arrive after 1:30 PM!', 'Priya Sharma', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', '2026-07-18T16:00:00Z'),
        ('c-3', 'k-1', 'Stay away from the PG near the fuel station, water issues during summer.', 'Varun K', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', '2026-07-18T18:45:00Z'),
        ('c-4', 'k-2', 'Watch Gajendra Purohit\'s YouTube playlist for Engineering Mathematics. Solved 80% of my exam doubts.', 'Neha Patil', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', '2026-07-19T10:00:00Z'),
        ('c-5', 'k-2', 'Thanks, Gajendra Purohit is a savior. Will check it out.', 'Rohan Das', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', '2026-07-19T10:30:00Z')
    ]
    cursor.executemany('INSERT INTO knot_comments VALUES (?,?,?,?,?,?)', knot_comments)

    # Seed Confessions
    confessions = [
        ('conf-1', 'I accidentally walked into the staff room thinking it was the seminar hall, and sat through a 15-minute departmental meeting before anyone noticed. The HOD just stared at me when I finally got up to leave.', 'ks-layout', 42, 2, '2026-07-19T02:30:00Z'),
        ('conf-2', 'To the student who took my CSE lab manual from the central library table on Friday: please return it! My final internal marks depend on that submission, and I don\'t want to re-write 20 coding experiments.', 'ks-layout', 28, 1, '2026-07-19T08:45:00Z'),
        ('conf-3', 'I secretly log into the Kanakapura Campus computer lab PCs and change all the desktop wallpapers to photos of cats. I\'ve done it on 40 computers so far. No regrets.', 'kanakapura', 56, 0, '2026-07-19T10:20:00Z')
    ]
    cursor.executemany('INSERT INTO confessions VALUES (?,?,?,?,?,?)', confessions)

    # Seed Confession Comments
    conf_comments = [
        ('cc-1', 'conf-1', 'Classic! Did they make you sign an attendance sheet? 😂', 'Anonymous Tiger', '2026-07-19T03:00:00Z'),
        ('cc-2', 'conf-1', 'HOD probably thought you were a highly motivated student attending extra lectures.', 'Anonymous Ninja', '2026-07-19T04:10:00Z'),
        ('cc-3', 'conf-2', 'Check with the librarian, sometimes they clear the tables and keep lost manuals at the counter.', 'Anonymous Owl', '2026-07-19T09:00:00Z')
    ]
    cursor.executemany('INSERT INTO confession_comments VALUES (?,?,?,?,?)', conf_comments)

    # Seed Rooms
    rooms = [
        ('r-1', 'Fully Furnished 1 BHK (Double sharing) - near KS Layout Campus',
         'Looking for a female roommate. 1 BHK apartment situated 5 minutes walk from DSU Kumaraswamy Layout campus. High-speed Wi-Fi, geyser, refrigerator, washing machine, and cupboard available. Vegetarian preferred.',
         5500, 'ks-layout', 'Sharing PG / Room', '+91 98765 43210', 'Meera Nair',
         'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
         json.dumps(['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80']),
         '2026-07-17T09:00:00Z'),
        ('r-2', 'Spacious Room in 2 BHK Flat - near Harohalli Campus',
         'Single room available for male student in a 2 BHK gated society flat. Very quiet area, perfect for study. The flat is fully set up, roommate is a final year CSE student. 10 mins ride to DSU Kanakapura Campus.',
         4200, 'kanakapura', 'Room in Flat', '+91 99887 76655', 'Siddharth Sen',
         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
         json.dumps(['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80']),
         '2026-07-18T12:00:00Z')
    ]
    cursor.executemany('INSERT INTO rooms VALUES (?,?,?,?,?,?,?,?,?,?,?)', rooms)

    # Seed Events
    events = [
        ('e-1', 'DSU Inter-College Cultural Fest "Sagar Utsav 2026"',
         'Annual flagship cultural fest featuring battle of bands, fashion show, group dance, drama, and live music performance by a guest artist. Food stalls and gaming arenas set up across campus!',
         'Aug 12, 2026', '10:00 AM onwards', 'Main Auditorium & Quadrangle', 'ks-layout', 'Cultural',
         'DSU Student Cultural Committee',
         'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80', 142, 1),
        ('e-2', 'AI & Machine Learning Workshop by Industry Experts',
         'Hands-on 1-day workshop covering PyTorch fundamentals, computer vision models, and building generative AI applications. E-certificates provided to all participants.',
         'Jul 28, 2026', '02:00 PM - 05:30 PM', 'Computer Science Seminar Hall', 'ks-layout', 'Tech',
         'DSU IEEE Student Branch',
         'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80', 89, 0),
        ('e-3', 'Harohalli Campus Football Tournament (5-a-side)',
         'Inter-departmental 5-a-side knockout football tournament. Trophy and medal for winners & runners up. Register your department team before Friday.',
         'Aug 02, 2026', '09:00 AM onwards', 'Kanakapura Campus Sports Ground', 'kanakapura', 'Sports',
         'DSU Sports Council',
         'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80', 64, 0)
    ]
    cursor.executemany('INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', events)

if __name__ == '__main__':
    init_db()
    print("SQLite Database initialized successfully!")
