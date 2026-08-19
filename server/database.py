import sqlite3
import os
import json
import time

DB_PATH = os.path.join(os.path.dirname(__file__), 'knotspot.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def add_column_if_not_exists(cursor, table_name, column_name, column_def):
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    if column_name not in columns:
        cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}")

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
            upvoted_by TEXT DEFAULT '[]',
            created_at TEXT NOT NULL
        )
    ''')
    add_column_if_not_exists(cursor, 'knots', 'upvoted_by', "TEXT DEFAULT '[]'")

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
            category TEXT DEFAULT 'General',
            likes_count INTEGER DEFAULT 0,
            reactions TEXT DEFAULT '{"heart":0,"fire":0,"skull":0,"cry":0}',
            user_reactions TEXT DEFAULT '{}',
            anonymous_name TEXT DEFAULT 'Anonymous Student',
            comments_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    ''')
    add_column_if_not_exists(cursor, 'confessions', 'category', "TEXT DEFAULT 'General'")
    add_column_if_not_exists(cursor, 'confessions', 'reactions', "TEXT DEFAULT '{\"heart\":0,\"fire\":0,\"skull\":0,\"cry\":0}'")
    add_column_if_not_exists(cursor, 'confessions', 'user_reactions', "TEXT DEFAULT '{}'")
    add_column_if_not_exists(cursor, 'confessions', 'anonymous_name', "TEXT DEFAULT 'Anonymous Student'")

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
            gender_pref TEXT DEFAULT 'Any Gender',
            seater_type TEXT DEFAULT '2 Seater',
            hostel_type TEXT DEFAULT 'Private PG',
            preferred_branch TEXT DEFAULT 'Any Branch',
            contact TEXT NOT NULL,
            author_name TEXT NOT NULL,
            author_avatar TEXT NOT NULL,
            images TEXT NOT NULL,
            amenities TEXT DEFAULT '["Wi-Fi 📶", "Mess Food 🍽️"]',
            created_at TEXT NOT NULL
        )
    ''')
    add_column_if_not_exists(cursor, 'rooms', 'amenities', "TEXT DEFAULT '[\"Wi-Fi 📶\", \"Mess Food 🍽️\"]'")

    # Events Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            iso_date TEXT,
            time TEXT NOT NULL,
            venue TEXT NOT NULL,
            location TEXT,
            campus TEXT NOT NULL,
            category TEXT NOT NULL,
            organizer TEXT NOT NULL,
            image TEXT NOT NULL,
            rsvps_count INTEGER DEFAULT 0,
            has_rsvp INTEGER DEFAULT 0
        )
    ''')
    add_column_if_not_exists(cursor, 'events', 'iso_date', "TEXT")
    add_column_if_not_exists(cursor, 'events', 'venue', "TEXT DEFAULT 'DSU Campus'")

    conn.commit()
    conn.close()

def seed_real_dsu_data(cursor):
    # Clear and re-populate with authentic Dayananda Sagar University content
    cursor.execute("DELETE FROM knots")
    cursor.execute("DELETE FROM knot_comments")
    cursor.execute("DELETE FROM confessions")
    cursor.execute("DELETE FROM confession_comments")
    cursor.execute("DELETE FROM rooms")
    cursor.execute("DELETE FROM events")

    # Seed User
    cursor.execute('''
        INSERT OR REPLACE INTO users (id, google_id, name, email, verified_email, branch, year, campus, avatar, profile_complete)
        VALUES ('u-1', NULL, 'Dhruv Gupta', 'dhruv.gupta@dsu.edu.in', 1, 'Computer Science & Engineering', '3rd Year', 'ks-layout',
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', 1)
    ''')

    # Real DSU Knots Threads
    knots = [
        ('k-1', 'Harohalli Shuttle Bus timings from Banashankari & Silk Institute Metro?',
         'Does anyone have the updated 2026 timetable for the official DSU University shuttle buses? Especially the morning 7:45 AM batch from Banashankari Bus Stand and the feeder shuttle from Silk Institute Metro Station on Kanakapura Green Line. Please drop the schedule below!',
         'General', 'kanakapura', 'Ananya Iyer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 42, 1, 3, '[]', '2026-08-18T14:32:00Z'),
        ('k-2', 'DSU CIE-2 Internals & Math-IV Engineering Revision Resources',
         'With the second Continuous Internal Evaluation (CIE) coming up next week, can seniors share previous year question papers for Math-IV (Probability & Statistics) and Operating Systems? Also, does professor give marks for VTU-format solutions or strictly autonomous DSU answer schemes?',
         'Academics', 'ks-layout', 'Rohan Das', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 67, 1, 3, '[]', '2026-08-18T16:15:00Z'),
        ('k-3', 'DSU Hackathon "Dayananda Sagar Innovates 2026" - Team Formation',
         'The AIC-DSU (Atal Incubation Center) is hosting a 36-hour national hackathon with cash prize pool of 1.5 Lakhs! Tracks include Generative AI, Smart Healthcare, and FinTech. Looking for 1 UI/UX designer and 1 backend developer proficient in Python/FastAPI. Hit me up if interested!',
         'Coding', 'kanakapura', 'Karthik Raja', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', 94, 0, 4, '[]', '2026-08-18T18:00:00Z'),
        ('k-4', 'Best lunch spots near KS Layout Campus - Sagar Food Court vs Kadirenahalli Cross',
         'Rank your top 3 affordable hangout food spots around KS Layout 1st/2nd Stage. Sagar Canteen dosa is classic, but looking for good roll joints, thali meals, and tea stalls between afternoon breaks.',
         'Campus Life', 'ks-layout', 'Pooja Hegde', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', 53, 0, 2, '[]', '2026-08-19T08:20:00Z')
    ]
    cursor.executemany('''
        INSERT INTO knots (id, title, content, category, campus, author_name, author_avatar, upvotes, starred, comments_count, upvoted_by, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ''', knots)

    # Real DSU Knot Comments
    knot_comments = [
        ('c-1', 'k-1', 'The Banashankari shuttle leaves sharp at 7:50 AM from TTMC Gate 2. Silk Institute Metro pickup runs every 20 mins from 8:15 AM to 9:15 AM.', 'Siddharth M', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', '2026-08-18T15:10:00Z'),
        ('c-2', 'k-1', 'Make sure to carry your physical DSU Student ID card, security checks it before boarding the Kanakapura highway bus.', 'Priya Sharma', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', '2026-08-18T16:00:00Z'),
        ('c-3', 'k-1', 'Pro tip: Download Namma Metro app, Silk Institute is terminal station so you always get a seat on the return journey!', 'Varun K', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', '2026-08-18T18:45:00Z'),
        ('c-4', 'k-2', 'DSU evaluation strictly follows class slide notes and textbook references. Solved papers are uploaded on the DSU LMS portal under "Engineering Resources".', 'Neha Patil', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', '2026-08-18T17:00:00Z'),
        ('c-5', 'k-2', 'Watch Gajendra Purohit on YouTube for Probability Distributions, helped me score O grade in Math-III.', 'Sameer Joshi', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', '2026-08-18T17:30:00Z'),
        ('c-6', 'k-3', 'I am an AIML 3rd year student working with PyTorch and React. Would love to join the team! DM on WhatsApp.', 'Pooja Hegde', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', '2026-08-18T19:00:00Z')
    ]
    cursor.executemany('''
        INSERT INTO knot_comments (id, knot_id, content, author_name, author_avatar, created_at)
        VALUES (?,?,?,?,?,?)
    ''', knot_comments)

    # Real DSU Anonymous Confessions
    confessions = [
        ('conf-1', 'I accidentally walked into the Mechanical Engineering Faculty meeting in Heritage Block thinking it was the Python seminar room, and sat through a 15-minute budget debate before anyone noticed. The Dean just smiled at me when I finally sneaked out.', 'ks-layout', 'Funny', 86, '{"heart":34,"fire":28,"skull":22,"cry":2}', '{}', 'Silent Cadet', 2, '2026-08-18T14:30:00Z'),
        ('conf-2', 'To the student who picked up my blue DSU spiral lab record from the Central Library 2nd floor cubicle on Friday: please drop it at the lost & found desk! My CIE submission deadline is tomorrow.', 'kanakapura', 'Exams', 52, '{"heart":8,"fire":12,"skull":14,"cry":18}', '{}', 'Shadow Scholar', 1, '2026-08-18T19:45:00Z'),
        ('conf-3', 'I have tested every single coffee vending machine across KS Layout Dental, Pharmacy, and Engineering blocks. The machine on 3rd floor CSE wing makes the undisputed best filter coffee at ₹15.', 'ks-layout', 'Campus Life', 114, '{"heart":55,"fire":42,"skull":15,"cry":2}', '{}', 'Midnight Sagarite', 2, '2026-08-19T06:20:00Z')
    ]
    cursor.executemany('''
        INSERT INTO confessions (id, content, campus, category, likes_count, reactions, user_reactions, anonymous_name, comments_count, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    ''', confessions)

    # Real DSU Confession Comments
    conf_comments = [
        ('cc-1', 'conf-1', 'Classic DSU moment! At least you didn\'t get assigned departmental committee duties 😂', 'Anonymous Tiger', '2026-08-18T15:00:00Z'),
        ('cc-2', 'conf-1', 'Dean probably thought you were the most attentive student in the faculty!', 'Anonymous Ninja', '2026-08-18T16:10:00Z'),
        ('cc-3', 'conf-2', 'Check with the librarian at front desk, they clear tables every evening at 7:30 PM.', 'Anonymous Owl', '2026-08-18T20:00:00Z'),
        ('cc-4', 'conf-3', 'Can confirm! The 3rd floor CSE machine is always refilled first by the canteen staff.', 'Ghost Coder', '2026-08-19T07:15:00Z')
    ]
    cursor.executemany('''
        INSERT INTO confession_comments (id, confession_id, content, author_name, created_at)
        VALUES (?,?,?,?,?)
    ''', conf_comments)

    # Real DSU Roommate / PG Listings
    rooms = [
        ('r-1', 'DSU On-Campus Girls Hostel (Block-B) - 2 Seater Sharing Vacancy',
         'Looking for a female roommate for a 2-seater room in DSU Harohalli Campus Girls Hostel Block-B. Room features attached washroom, study desks, high-speed campus Wi-Fi, 3-times hygienic mess meals, and 24x7 power backup. CSE/AIML/ECE student preferred.',
         6800, 'kanakapura', 'College Hostel', 'Girls Only', '2 Seater', 'College Hostel', 'Computer Science & Engineering', '+91 98765 43210', 'Meera Nair',
         'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
         json.dumps(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80']),
         json.dumps(["Wi-Fi 📶", "Mess Food 🍽️", "Attached Bath 🚿", "Power Backup ⚡", "CCTV Security 🔒"]),
         '2026-08-17T09:00:00Z'),
        ('r-2', 'Royal Comfort PG near KS Layout 2nd Stage (5 Mins to DSU Gate)',
         '1 spot available for male student in a 2-seater executive PG room near KS Layout 2nd Stage, right behind Dayananda Sagar College campus. Includes high-speed optical fiber Wi-Fi, daily North/South Indian meals, washing machine, hot water, and lift.',
         5500, 'ks-layout', 'Sharing PG / Room', 'Boys Only', '2 Seater', 'Private PG', 'Any Branch', '+91 99887 76655', 'Siddharth Sen',
         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
         json.dumps(['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80']),
         json.dumps(["Wi-Fi 📶", "2x Food 🍛", "Washing Machine 🧺", "Hot Water ♨️"]),
         '2026-08-18T12:00:00Z'),
        ('r-3', 'Harohalli Green Valley PG - 3 Seater Budget Room (Close to Main Gate)',
         'Spacious 3-seater room in Green Valley PG on Harohalli Main Road, 400m from DSU Campus gate. Includes 3-time meals, power backup, study library, and bike parking. Ideal for 1st & 2nd year students.',
         4200, 'kanakapura', 'Sharing PG / Room', 'Boys Only', '3 Seater', 'Private PG', 'School of Engineering', '+91 91234 56789', 'Kunal Verma',
         'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
         json.dumps(['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80']),
         json.dumps(["Wi-Fi 📶", "3x Food 🍽️", "Bike Parking 🛵", "Hot Water ♨️"]),
         '2026-08-19T06:30:00Z')
    ]
    cursor.executemany('''
        INSERT INTO rooms (id, title, description, rent, campus, room_type, gender_pref, seater_type, hostel_type, preferred_branch, contact, author_name, author_avatar, images, amenities, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', rooms)

    # Real Dayananda Sagar University Campus Events & Fests
    events = [
        ('ev-1', 'DERBY 2026 - DSU Flagship Annual Cultural Fest & DJ Night',
         'The biggest university festival of the year! 3 days of high-voltage celebrations: Battle of the Bands, Street Dance Battles, National Fashion Show "GlamSagar", Pro-DJ Night featuring top Indian EDM artists, food carnivals, and gaming tournaments. Open to all DSU schools & campuses!',
         'Aug 22, 2026', '2026-08-22T10:00:00', '10:00 AM - 10:00 PM', 'Harohalli Campus Grounds & Amphitheatre', 'Harohalli Campus Grounds & Amphitheatre', 'kanakapura', 'Cultural & Fests',
         'DSU Student Cultural Council',
         'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80', 380, 0),
        ('ev-2', 'DSU Hackathon "Dayananda Sagar Innovates 2026" (36h Hackfest)',
         'AIC-DSU Foundation 36-hour national hackathon. Build scalable projects across GenAI, Autonomous Tech, and FinTech. Cash prize pool: ₹1,50,000 + direct incubation grants and sponsor internship fast-track interviews!',
         'Aug 26, 2026', '2026-08-26T09:00:00', '9:00 AM - 6:00 PM', 'AIC-DSU Innovation Center, Harohalli', 'AIC-DSU Innovation Center, Harohalli', 'kanakapura', 'Hackathons',
         'DSU Innovation & Entrepreneurship Club',
         'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80', 145, 1),
        ('ev-3', 'IEEE Tech-Vision: Generative AI & Deep Learning Masterclass',
         'Hands-on workshop on Large Language Models, Multi-agent Architecture, and Computer Vision by Google DeepMind & industry practitioners. E-Certificates and project credits for all attendees.',
         'Aug 29, 2026', '2026-08-29T14:00:00', '2:00 PM - 5:00 PM', 'Dr. Premachandra Sagar Auditorium, Dental Block, KS Layout', 'Dr. Premachandra Sagar Auditorium, Dental Block, KS Layout', 'ks-layout', 'Workshops',
         'DSU IEEE Student Branch',
         'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', 210, 0),
        ('ev-4', 'SPARDHA 2026 - DSU Inter-Campus Football & Cricket Cup',
         'Annual sports clash between KS Layout & Harohalli campuses! Knockout 7-a-side football, T10 cricket, basketball, and badminton championships. Register your branch teams with the sports directorate.',
         'Sep 04, 2026', '2026-09-04T08:30:00', '8:30 AM - 5:30 PM', 'DSU Sports Complex & Turf Ground, Harohalli', 'DSU Sports Complex & Turf Ground, Harohalli', 'kanakapura', 'Sports',
         'DSU Directorate of Sports',
         'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', 178, 0)
    ]
    cursor.executemany('''
        INSERT INTO events (id, title, description, date, iso_date, time, venue, location, campus, category, organizer, image, rsvps_count, has_rsvp)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', events)

if __name__ == '__main__':
    init_db()
    conn = get_db()
    cursor = conn.cursor()
    seed_real_dsu_data(cursor)
    conn.commit()
    conn.close()
    print("✅ Dayananda Sagar University (DSU) Real Campus Data Seeded Successfully!")
