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
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

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
                upvoted_by_raw = r.pop('upvoted_by', '[]')
                try:
                    r['upvotedBy'] = json.loads(upvoted_by_raw) if upvoted_by_raw else []
                except Exception:
                    r['upvotedBy'] = []
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
                r['anonymousName'] = r.pop('anonymous_name', 'Anonymous Student')
                reactions_raw = r.pop('reactions', '{}')
                user_reactions_raw = r.pop('user_reactions', '{}')
                try:
                    r['reactions'] = json.loads(reactions_raw) if reactions_raw else {"heart": r['likesCount'], "fire": 0, "skull": 0, "cry": 0}
                except Exception:
                    r['reactions'] = {"heart": r['likesCount'], "fire": 0, "skull": 0, "cry": 0}
                try:
                    r['userReactions'] = json.loads(user_reactions_raw) if user_reactions_raw else {}
                except Exception:
                    r['userReactions'] = {}
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
                images_raw = r.pop('images', '[]')
                amenities_raw = r.pop('amenities', '[]')
                try:
                    r['images'] = json.loads(images_raw) if images_raw else []
                except Exception:
                    r['images'] = []
                try:
                    r['amenities'] = json.loads(amenities_raw) if amenities_raw else ["Wi-Fi 📶", "Mess Food 🍽️"]
                except Exception:
                    r['amenities'] = ["Wi-Fi 📶", "Mess Food 🍽️"]
            self.respond_json(rows)

        elif path == '/api/events':
            cursor.execute("SELECT * FROM events")
            rows = [dict(r) for r in cursor.fetchall()]
            for r in rows:
                r['rsvpsCount'] = r.pop('rsvps_count', 0)
                r['hasRsvp'] = bool(r.pop('has_rsvp', 0))
                r['isoDate'] = r.pop('iso_date', None) or '2026-08-20T10:00:00'
                r['venue'] = r.get('venue') or r.get('location') or 'DSU Campus'
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
            
            conn.close()
            self.respond_json({'error': 'Invalid or unverified Google Auth ID token'}, 400)

        elif path == '/api/logout':
            # Safe logout: Do NOT wipe users table
            user_id = body.get('userId') or body.get('id')
            if user_id:
                # Optionally clear session or specific temporary user
                pass
            conn.close()
            self.respond_json({'message': 'Logged out successfully', 'success': True})

        elif path == '/api/knots':
            knot_id = body.get('id') or ("k-" + str(int(time.time() * 1000)))
            created_at = body.get('createdAt') or time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            
            cursor.execute("SELECT name, avatar FROM users ORDER BY created_at DESC LIMIT 1")
            user = cursor.fetchone()
            author_name = body.get('authorName') or (user['name'] if user else 'Anonymous student')
            author_avatar = body.get('authorAvatar') or (user['avatar'] if user else 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80')

            cursor.execute('''
                INSERT OR REPLACE INTO knots (id, title, content, category, campus, author_name, author_avatar, upvotes, starred, comments_count, upvoted_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (knot_id, body.get('title'), body.get('content'), body.get('category'), body.get('campus'),
                  author_name, author_avatar, body.get('upvotes', 0), 1 if body.get('starred') else 0,
                  body.get('commentsCount', 0), json.dumps(body.get('upvotedBy', [])), created_at))
            conn.commit()
            conn.close()
            
            self.respond_json({
                'id': knot_id, 'title': body.get('title'), 'content': body.get('content'),
                'category': body.get('category'), 'campus': body.get('campus'),
                'authorName': author_name, 'authorAvatar': author_avatar,
                'upvotes': body.get('upvotes', 0), 'starred': bool(body.get('starred')),
                'commentsCount': body.get('commentsCount', 0), 'upvotedBy': body.get('upvotedBy', []),
                'createdAt': created_at
            })

        elif path == '/api/knots/upvote':
            knot_id = body.get('id')
            user_email = body.get('userEmail') or 'guest'
            
            cursor.execute("SELECT upvotes, upvoted_by FROM knots WHERE id = ?", (knot_id,))
            row = cursor.fetchone()
            if row:
                current_upvotes = row['upvotes']
                try:
                    upvoted_by = json.loads(row['upvoted_by']) if row['upvoted_by'] else []
                except Exception:
                    upvoted_by = []
                
                if user_email in upvoted_by:
                    upvoted_by.remove(user_email)
                    current_upvotes = max(0, current_upvotes - 1)
                else:
                    upvoted_by.append(user_email)
                    current_upvotes += 1

                cursor.execute("UPDATE knots SET upvotes = ?, upvoted_by = ? WHERE id = ?",
                               (current_upvotes, json.dumps(upvoted_by), knot_id))
                conn.commit()
                conn.close()
                self.respond_json({'upvotes': current_upvotes, 'upvotedBy': upvoted_by, 'id': knot_id})
            else:
                conn.close()
                self.respond_json({'error': 'Knot not found'}, 404)

        elif path == '/api/knots/star':
            knot_id = body.get('id')
            cursor.execute("SELECT starred FROM knots WHERE id = ?", (knot_id,))
            row = cursor.fetchone()
            if row:
                new_star = 0 if row['starred'] else 1
                cursor.execute("UPDATE knots SET starred = ? WHERE id = ?", (new_star, knot_id))
                conn.commit()
                conn.close()
                self.respond_json({'id': knot_id, 'starred': bool(new_star)})
            else:
                conn.close()
                self.respond_json({'error': 'Knot not found'}, 404)

        elif path == '/api/knots/comments':
            comment_id = body.get('id') or ("c-" + str(int(time.time() * 1000)))
            created_at = body.get('createdAt') or time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            
            cursor.execute("SELECT name, avatar FROM users ORDER BY created_at DESC LIMIT 1")
            user = cursor.fetchone()
            author_name = body.get('authorName') or (user['name'] if user else "Student")
            author_avatar = body.get('authorAvatar') or (user['avatar'] if user else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80")

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
            conf_id = body.get('id') or ("conf-" + str(int(time.time() * 1000)))
            created_at = body.get('createdAt') or time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            category = body.get('category') or 'General'
            anon_name = body.get('anonymousName') or 'Anonymous Student'
            reactions = json.dumps(body.get('reactions', {'heart': 0, 'fire': 0, 'skull': 0, 'cry': 0}))
            user_reactions = json.dumps(body.get('userReactions', {}))

            cursor.execute('''
                INSERT OR REPLACE INTO confessions (id, content, campus, category, likes_count, reactions, user_reactions, anonymous_name, comments_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (conf_id, body.get('content'), body.get('campus'), category, body.get('likesCount', 0),
                  reactions, user_reactions, anon_name, body.get('commentsCount', 0), created_at))
            conn.commit()
            conn.close()
            self.respond_json({
                'id': conf_id, 'content': body.get('content'), 'campus': body.get('campus'),
                'category': category, 'likesCount': body.get('likesCount', 0),
                'reactions': body.get('reactions', {'heart': 0, 'fire': 0, 'skull': 0, 'cry': 0}),
                'userReactions': body.get('userReactions', {}), 'anonymousName': anon_name,
                'commentsCount': body.get('commentsCount', 0), 'createdAt': created_at
            })

        elif path == '/api/confessions/react':
            conf_id = body.get('id')
            reaction_type = body.get('reactionType', 'heart')
            user_email = body.get('userEmail') or 'guest'

            cursor.execute("SELECT reactions, user_reactions, likes_count FROM confessions WHERE id = ?", (conf_id,))
            row = cursor.fetchone()
            if row:
                try:
                    reactions = json.loads(row['reactions']) if row['reactions'] else {'heart': 0, 'fire': 0, 'skull': 0, 'cry': 0}
                except Exception:
                    reactions = {'heart': 0, 'fire': 0, 'skull': 0, 'cry': 0}
                try:
                    user_reactions = json.loads(row['user_reactions']) if row['user_reactions'] else {}
                except Exception:
                    user_reactions = {}

                current_reaction = user_reactions.get(user_email)
                if current_reaction == reaction_type:
                    reactions[reaction_type] = max(0, reactions.get(reaction_type, 0) - 1)
                    del user_reactions[user_email]
                else:
                    if current_reaction:
                        reactions[current_reaction] = max(0, reactions.get(current_reaction, 0) - 1)
                    reactions[reaction_type] = reactions.get(reaction_type, 0) + 1
                    user_reactions[user_email] = reaction_type

                total_likes = sum(reactions.values())
                cursor.execute("UPDATE confessions SET reactions = ?, user_reactions = ?, likes_count = ? WHERE id = ?",
                               (json.dumps(reactions), json.dumps(user_reactions), total_likes, conf_id))
                conn.commit()
                conn.close()
                self.respond_json({'id': conf_id, 'reactions': reactions, 'userReactions': user_reactions, 'likesCount': total_likes})
            else:
                conn.close()
                self.respond_json({'error': 'Confession not found'}, 404)

        elif path == '/api/confessions/like':
            conf_id = body.get('id')
            cursor.execute("UPDATE confessions SET likes_count = likes_count + 1 WHERE id = ?", (conf_id,))
            cursor.execute("SELECT likes_count FROM confessions WHERE id = ?", (conf_id,))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            self.respond_json({'likesCount': row['likes_count'] if row else 0})

        elif path == '/api/confessions/comments':
            comment_id = body.get('id') or ("cc-" + str(int(time.time() * 1000)))
            created_at = body.get('createdAt') or time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            author_name = body.get('authorName')
            if not author_name:
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
            room_id = body.get('id') or ("r-" + str(int(time.time() * 1000)))
            created_at = body.get('createdAt') or time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

            cursor.execute("SELECT name, avatar FROM users ORDER BY created_at DESC LIMIT 1")
            user = cursor.fetchone()
            author_name = body.get('authorName') or (user['name'] if user else "Student")
            author_avatar = body.get('authorAvatar') or (user['avatar'] if user else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80")
            
            img_list = body.get('images')
            if not img_list:
                img_url = body.get('imageUrl') or "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"
                img_list = [img_url]

            gender_pref = body.get('genderPref', 'Any Gender')
            seater_type = body.get('seaterType', '2 Seater')
            hostel_type = body.get('hostelType', 'Private PG')
            preferred_branch = body.get('preferredBranch', 'Any Branch')
            amenities = body.get('amenities', ["Wi-Fi 📶", "Mess Food 🍽️"])

            cursor.execute('''
                INSERT OR REPLACE INTO rooms (id, title, description, rent, campus, room_type, gender_pref, seater_type, hostel_type, preferred_branch, contact, author_name, author_avatar, images, amenities, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (room_id, body.get('title'), body.get('description'), int(body.get('rent', 0)), body.get('campus'),
                  body.get('roomType'), gender_pref, seater_type, hostel_type, preferred_branch, body.get('contact'),
                  author_name, author_avatar, json.dumps(img_list), json.dumps(amenities), created_at))
            conn.commit()
            conn.close()

            self.respond_json({
                'id': room_id, 'title': body.get('title'), 'description': body.get('description'),
                'rent': int(body.get('rent', 0)), 'campus': body.get('campus'), 'roomType': body.get('roomType'),
                'genderPref': gender_pref, 'seaterType': seater_type, 'hostelType': hostel_type, 'preferredBranch': preferred_branch,
                'contact': body.get('contact'), 'authorName': author_name, 'authorAvatar': author_avatar,
                'images': img_list, 'amenities': amenities, 'createdAt': created_at
            })

        elif path == '/api/events/rsvp':
            event_id = body.get('id')
            cursor.execute("SELECT has_rsvp, rsvps_count FROM events WHERE id = ?", (event_id,))
            row = cursor.fetchone()
            if row:
                new_rsvp = 0 if row['has_rsvp'] else 1
                new_count = row['rsvps_count'] + 1 if new_rsvp else max(0, row['rsvps_count'] - 1)
                cursor.execute("UPDATE events SET has_rsvp = ?, rsvps_count = ? WHERE id = ?", (new_rsvp, new_count, event_id))
                conn.commit()
                conn.close()
                self.respond_json({'id': event_id, 'hasRsvp': bool(new_rsvp), 'rsvpsCount': new_count})
            else:
                conn.close()
                self.respond_json({'error': 'Event not found'}, 404)

        else:
            conn.close()
            self.respond_json({'error': 'Not Found'}, 404)

def run_server():
    init_db()
    socketserver.TCPServer.allow_reuse_address = True
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
