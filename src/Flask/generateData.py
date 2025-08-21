import duckdb
import random
import uuid
import json

# Connexion à la base
con = duckdb.connect('C:\\Users\\maria\\Documents\\tpe\\bbb_database.db')

# Fonctions utilitaires
def random_timestamp(base, min_offset=10000, max_offset=300000):
    return base + random.randint(min_offset, max_offset)

def create_uuid():
    return str(uuid.uuid4())

# Récupérer les données de base
users = con.execute("SELECT user_id FROM User").fetchall()
sessions = con.execute("SELECT session_id, created_on, ended_on FROM Session").fetchall()

if not users or not sessions:
    print("Aucun utilisateur ou session trouvé dans la base.")
    exit(1)

# Créer des sondages par session
for session_id, created_on, _ in sessions:
    for _ in range(random.randint(1, 2)):
        poll_id = create_uuid()
        question = random.choice(["What did you learn?", "Did you like the session?"])
        options = ["Yes", "No", "Maybe"] if "like" in question else ["AI", "ML", "Web"]
        created_on_poll = random_timestamp(created_on)

        con.execute("""
            INSERT INTO Poll (
                poll_id, poll_type, anonymous, multiple, question, option,
                anonymousAnswers, createdOn, session_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            poll_id,
            "single-choice",
            False,
            False,
            question,
            json.dumps(options),
            "",
            created_on_poll,
            session_id
        ))

        user_ids = con.execute("SELECT user_id FROM User_Session WHERE session_id = ?", (session_id,)).fetchall()
        for (user_id,) in random.sample(user_ids, min(len(user_ids), random.randint(1, 5))):
            answer = [random.choice(options)]
            try:
                con.execute("""
                    INSERT INTO Answers (poll_id, user_id, answer)
                    VALUES (?, ?, ?)
                """, (poll_id, user_id, json.dumps(answer)))
            except Exception as e:
                print(f"[Poll Answer] Erreur pour {poll_id}/{user_id} : {e}")

# Lier les users à 3–5 sessions
for (user_id,) in users:
    selected_sessions = random.sample(sessions, min(len(sessions), random.randint(2, 3)))
    for session_id, created_on, ended_on in selected_sessions:
        if con.execute("""
            SELECT 1 FROM User_Session WHERE session_id = ? AND user_id = ?
        """, (session_id, user_id)).fetchone():
            continue

        session_duration = ended_on - created_on
        if session_duration < 60000:
            continue  # Trop courte pour générer des interactions crédibles

        registered_on = random.randint(created_on, ended_on - 60000)
        left_on = random.randint(registered_on + 10000, ended_on)

        is_dial = random.choice([True, False])
        user_left_flag = random.choice([True, False])

        try:
            con.execute("""
                INSERT INTO User_Session (
                    session_id, user_id, is_moderator, is_dial_in, 
                    registered_on, left_on, total_of_messages, 
                    last_talk_started_on, total_time, user_left_flag
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session_id, user_id, False, is_dial,
                registered_on, left_on, random.randint(0, 10),
                0, left_on - registered_on, user_left_flag
            ))

            # Emojis
            for _ in range(random.randint(0, 2)):
                con.execute("""
                    INSERT INTO Emoji (session_id, user_id, name, sent_on)
                    VALUES (?, ?, ?, ?)
                """, (
                    session_id, user_id,
                    random.choice(["raiseHand", "clap", "thumbsUp"]),
                    random.randint(registered_on, left_on)
                ))

            # Reactions
            for _ in range(random.randint(0, 2)):
                con.execute("""
                    INSERT INTO Reaction (session_id, user_id, name, sent_on)
                    VALUES (?, ?, ?, ?)
                """, (
                    session_id, user_id,
                    random.choice(["laugh", "surprised", "confused"]),
                    random.randint(registered_on, left_on)
                ))

            # WebCam
            if random.random() > 0.5:
                start = random.randint(registered_on, left_on - 10000)
                stop = random.randint(start + 5000, min(start + 120000, left_on))
                con.execute("""
                    INSERT INTO WebCam (session_id, user_id, started_on, stopped_on)
                    VALUES (?, ?, ?, ?)
                """, (session_id, user_id, start, stop))

        except Exception as e:
            print(f"[User_Session] Erreur {user_id}/{session_id} : {e}")

# Ajouter des slides et screenshares à chaque session
for session_id, created_on, ended_on in sessions:
    try:
        for page_num in range(1, random.randint(2, 4)):
            con.execute("""
                INSERT INTO PresentationSlides (
                    presentation_id, page_num, set_on, presentation_name, session_id
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                create_uuid(), page_num,
                random.randint(created_on, ended_on),
                "default.pdf", session_id
            ))

        if random.random() > 0.3:
            start = random.randint(created_on, ended_on - 100000)
            stop = min(ended_on, start + random.randint(100000, 300000))
            con.execute("""
                INSERT INTO ScreenShare (started_on, stopped_on, session_id)
                VALUES (?, ?, ?)
            """, (start, stop, session_id))

    except Exception as e:
        print(f"[Slides/Share] Erreur pour session {session_id} : {e}")

print("\n✅ Données générées avec succès !")