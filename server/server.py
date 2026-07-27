import http.server
import socketserver
import json
import os
import time
import urllib.parse
import urllib.request
from database import init_db, get_db

def verify_google_token(id_token):
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print("Google token verification network call failed:", e)
    return None

PORT = 5000

class KnotSpotHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def respond_json(self, data, status=200):
        self.send_response(status)
        self.send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def get_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length).decode('utf-8')
        try:
            return json.loads(body)
        except Exception:
            return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        conn = get_db()
        cursor = conn.cursor()

        if path == '/api/user':
            cursor.execute("SELECT * FROM users ORDER BY created_at DESC LIMIT 1")
            row = cursor.fetchone()
            if row:
                u = dict(row)
                u['profileComplete'] = bool(u.pop('profile_complete', 1))
                self.respond_json(u)
            else:
                self.respond_json(None)

        elif path == '/api/knots':
            cursor.execute("SELECT * FROM knots ORDER BY created_at DESC")
            rows = [dict(r) for r in cursor.fetchall()]
            for r in rows:
                r['authorName'] = r.pop('author_name', '')
                r['authorAvatar'] = r.pop('author_avatar', '')
                r['commentsCount'] = r.pop('comments_count', 0)
                r['createdAt'] = r.pop('created_at', '')
                r['starred'] = bool(r['starred'])
            self.respond_json(rows)

        elif path == '/api/knots/comments':
            knot_id = params.get('knotId', [''])[0]
            cursor.execute("SELECT * FROM knot_comments WHERE knot_id = ? ORDER BY created_at ASC", (knot_id,))
            rows = [dict(r) for r in cursor.fetchall()]
            for r in rows:
                r['authorName'] = r.pop('author_name', '')
                r['authorAvatar'] = r.pop('author_avatar', '')
                r['knotId'] = r.pop('knot_id', '')
                r['createdAt'] = r.pop('created_at', '')
            self.respond_json(rows)

        elif path == '/api/confessions':
            cursor.execute("SELECT * FROM confessions ORDER BY created_at DESC")
            rows = [dict(r) for r in cursor.fetchall()]
            for r in rows:
                r['likesCount'] = r.pop('likes_count', 0)
                r['commentsCount'] = r.pop('comments_count', 0)
                r['createdAt'] = r.pop('created_at', '')
            self.respond_json(rows)

        elif path == '/api/confessions/comments':
            confession_id = params.get('confessionId', [''])[0]
            cursor.execute("SELECT * FROM confession_comments WHERE confession_id = ? ORDER BY created_at ASC", (confession_id,))
            rows = [dict(r) for r in cursor.fetchall()]
            for r in rows:
                r['authorName'] = r.pop('author_name', '')
                r['confessionId'] = r.pop('confession_id', '')
                r['createdAt'] = r.pop('created_at', '')
            self.respond_json(rows)

        elif path == '/api/rooms':
            cursor.execute("SELECT * FROM rooms ORDER BY created_at DESC")
            rows = [dict(r) for r in cursor.fetchall()]
            for r in rows:
                r['authorName'] = r.pop('author_name', '')
                r['authorAvatar'] = r.pop('author_avatar', '')
                r['roomType'] = r.pop('room_type', '')
                r['genderPref'] = r.pop('gender_pref', 'Any Gender')
                r['seaterType'] = r.pop('seater_type', '2 Seater')
                r['hostelType'] = r.pop('hostel_type', 'Private PG')
                r['preferredBranch'] = r.pop('preferred_branch', 'Any Branch')
                r['createdAt'] = r.pop('created_at', '')
                r['images'] = json.loads(r.get('images', '[]'))
            self.respond_json(rows)

        elif path == '/api/events':
            cursor.execute("SELECT * FROM events")
            rows = [dict(r) for r in cursor.fetchall()]
            for r in rows:
                r['rsvpsCount'] = r.pop('rsvps_count', 0)
                r['hasRsvp'] = bool(r.pop('has_rsvp', 0))
            self.respond_json(rows)

        else:
            self.respond_json({'error': 'Not Found'}, 404)

        conn.close()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.get_body()

        conn = get_db()
        cursor = conn.cursor()

        if path == '/api/user':
            user_id = body.get('id', 'u-' + str(int(time.time())))
            cursor.execute('''
                INSERT OR REPLACE INTO users (id, name, email, branch, year, campus, avatar, profile_complete)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            ''', (user_id, body.get('name'), body.get('email'), body.get('branch'), body.get('year', '1st Year'),
                  body.get('campus'), body.get('avatar')))
            conn.commit()
            conn.close()
            self.respond_json(body)

        elif path == '/api/auth/google':
            id_token = body.get('idToken')
            branch = body.get('branch', 'CSE')
            campus = body.get('campus', 'ks-layout')
            
            verified_data = None
            if id_token:
                verified_data = verify_google_token(id_token)
            
            # If Google token verification succeeded or fallback student data provided
            if verified_data:
                google_id = verified_data.get('sub')
                email = verified_data.get('email')
                name = verified_data.get('name', body.get('name', 'DSU Student'))
                picture = verified_data.get('picture', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80')
                email_verified = 1 if (verified_data.get('email_verified') == 'true' or verified_data.get('email_verified') is True) else 0

                user_id = f"g-{google_id}"
                cursor.execute('''
                    INSERT INTO users (id, google_id, name, email, verified_email, branch, year, campus, avatar, profile_complete)
                    VALUES (?, ?, ?, ?, ?, ?, '1st Year', ?, ?, 1)
                    ON CONFLICT(email) DO UPDATE SET
                        google_id=excluded.google_id,
                        name=excluded.name,
                        verified_email=excluded.verified_email,
                        branch=excluded.branch,
                        campus=excluded.campus,
                        avatar=excluded.avatar,
                        profile_complete=1
                ''', (user_id, google_id, name, email, email_verified, branch, campus, picture))
                conn.commit()

                cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
                row = cursor.fetchone()
                if row:
                    u = dict(row)
                    u['profileComplete'] = bool(u.pop('profile_complete', 1))
                    u['verifiedEmail'] = bool(u.pop('verified_email', 0))
                    conn.close()
                    self.respond_json(u)
                    return
            
            # Fallback error for invalid or unverified token
            conn.close()
            self.respond_json({'error': 'Invalid or unverified Google Auth ID token'}, 400)

        elif path == '/api/logout':
            cursor.execute("DELETE FROM users")
            conn.commit()
            conn.close()
            self.respond_json({'message': 'Logged out successfully'})

        elif path == '/api/knots':
            knot_id = "k-" + str(int(time.time() * 1000))
            created_at = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            
            # Fetch user
            cursor.execute("SELECT name, avatar FROM users ORDER BY created_at DESC LIMIT 1")
            user = cursor.fetchone()
            author_name = user['name'] if user else body.get('authorName', 'Anonymous student')
            author_avatar = user['avatar'] if user else body.get('authorAvatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80')

            cursor.execute('''
                INSERT INTO knots (id, title, content, category, campus, author_name, author_avatar, upvotes, starred, comments_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?)
            ''', (knot_id, body.get('title'), body.get('content'), body.get('category'), body.get('campus'), author_name, author_avatar, created_at))
            conn.commit()
            conn.close()
            
            self.respond_json({
                'id': knot_id, 'title': body.get('title'), 'content': body.get('content'),
                'category': body.get('category'), 'campus': body.get('campus'),
                'authorName': author_name, 'authorAvatar': author_avatar,
                'upvotes': 0, 'starred': False, 'commentsCount': 0, 'createdAt': created_at
            })

        elif path == '/api/knots/upvote':
            knot_id = body.get('id')
            cursor.execute("UPDATE knots SET upvotes = upvotes + 1 WHERE id = ?", (knot_id,))
            cursor.execute("SELECT upvotes FROM knots WHERE id = ?", (knot_id,))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            self.respond_json({'upvotes': row['upvotes'] if row else 0})

        elif path == '/api/knots/comments':
            comment_id = "c-" + str(int(time.time() * 1000))
            created_at = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            
            cursor.execute("SELECT name, avatar FROM users ORDER BY created_at DESC LIMIT 1")
            user = cursor.fetchone()
            author_name = user['name'] if user else "Student"
            author_avatar = user['avatar'] if user else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"

            cursor.execute('''
                INSERT INTO knot_comments (id, knot_id, content, author_name, author_avatar, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (comment_id, body.get('knotId'), body.get('content'), author_name, author_avatar, created_at))
            
            cursor.execute("UPDATE knots SET comments_count = comments_count + 1 WHERE id = ?", (body.get('knotId'),))
            conn.commit()
            conn.close()

            self.respond_json({
                'id': comment_id, 'knotId': body.get('knotId'), 'content': body.get('content'),
                'authorName': author_name, 'authorAvatar': author_avatar, 'createdAt': created_at
            })

        elif path == '/api/confessions':
            conf_id = "conf-" + str(int(time.time() * 1000))
            created_at = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            cursor.execute('''
                INSERT INTO confessions (id, content, campus, likes_count, comments_count, created_at)
                VALUES (?, ?, ?, 0, 0, ?)
            ''', (conf_id, body.get('content'), body.get('campus'), created_at))
            conn.commit()
            conn.close()
            self.respond_json({
                'id': conf_id, 'content': body.get('content'), 'campus': body.get('campus'),
                'likesCount': 0, 'commentsCount': 0, 'createdAt': created_at
            })

        elif path == '/api/confessions/like':
            conf_id = body.get('id')
            cursor.execute("UPDATE confessions SET likes_count = likes_count + 1 WHERE id = ?", (conf_id,))
            cursor.execute("SELECT likes_count FROM confessions WHERE id = ?", (conf_id,))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            self.respond_json({'likesCount': row['likes_count'] if row else 0})

        elif path == '/api/confessions/comments':
            comment_id = "cc-" + str(int(time.time() * 1000))
            created_at = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            animals = ['Tiger', 'Ninja', 'Owl', 'Panda', 'Falcon', 'Wolf', 'Eagle']
            author_name = "Anonymous " + animals[int(time.time()) % len(animals)]

            cursor.execute('''
                INSERT INTO confession_comments (id, confession_id, content, author_name, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (comment_id, body.get('confessionId'), body.get('content'), author_name, created_at))
            cursor.execute("UPDATE confessions SET comments_count = comments_count + 1 WHERE id = ?", (body.get('confessionId'),))
            conn.commit()
            conn.close()
            self.respond_json({
                'id': comment_id, 'confessionId': body.get('confessionId'), 'content': body.get('content'),
                'authorName': author_name, 'createdAt': created_at
            })

        elif path == '/api/rooms':
            room_id = "r-" + str(int(time.time() * 1000))
            created_at = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

            cursor.execute("SELECT name, avatar FROM users ORDER BY created_at DESC LIMIT 1")
            user = cursor.fetchone()
            author_name = user['name'] if user else "Student"
            author_avatar = user['avatar'] if user else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
            img_url = body.get('imageUrl') or "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"

            gender_pref = body.get('genderPref', 'Any Gender')
            seater_type = body.get('seaterType', '2 Seater')
            hostel_type = body.get('hostelType', 'Private PG')
            preferred_branch = body.get('preferredBranch', 'Any Branch')

            cursor.execute('''
                INSERT INTO rooms (id, title, description, rent, campus, room_type, gender_pref, seater_type, hostel_type, preferred_branch, contact, author_name, author_avatar, images, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (room_id, body.get('title'), body.get('description'), int(body.get('rent', 0)), body.get('campus'),
                  body.get('roomType'), gender_pref, seater_type, hostel_type, preferred_branch, body.get('contact'), author_name, author_avatar, json.dumps([img_url]), created_at))
            conn.commit()
            conn.close()

            self.respond_json({
                'id': room_id, 'title': body.get('title'), 'description': body.get('description'),
                'rent': int(body.get('rent', 0)), 'campus': body.get('campus'), 'roomType': body.get('roomType'),
                'genderPref': gender_pref, 'seaterType': seater_type, 'hostelType': hostel_type, 'preferredBranch': preferred_branch,
                'contact': body.get('contact'), 'authorName': author_name, 'authorAvatar': author_avatar,
                'images': [img_url], 'createdAt': created_at
            })

        elif path == '/api/events/rsvp':
            event_id = body.get('id')
            cursor.execute("SELECT has_rsvp, rsvps_count FROM events WHERE id = ?", (event_id,))
            row = cursor.fetchone()
            if row:
                new_rsvp = 0 if row['has_rsvp'] else 1
                new_count = row['rsvps_count'] + 1 if new_rsvp else row['rsvps_count'] - 1
                cursor.execute("UPDATE events SET has_rsvp = ?, rsvps_count = ? WHERE id = ?", (new_rsvp, new_count, event_id))
                conn.commit()
                conn.close()
                self.respond_json({'hasRsvp': bool(new_rsvp), 'rsvpsCount': new_count})
            else:
                conn.close()
                self.respond_json({'error': 'Event not found'}, 404)

        else:
            conn.close()
            self.respond_json({'error': 'Not Found'}, 404)

def run_server():
    init_db()
    server = socketserver.TCPServer(('', PORT), KnotSpotHTTPRequestHandler)
    print(f"DSU KnotSpot Backend Server running on http://localhost:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    run_server()
