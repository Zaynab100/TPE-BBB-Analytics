from datetime import datetime

from flask import jsonify, render_template
import duckdb
import requests
from flask import Flask
from flask_cors import CORS

from bbb_importFromJson import talkTime, Nombre_Emojis, webCamTime, onlineTime, totalMessage, Nombre_Reaction

app = Flask(__name__)
CORS(app)
DB_PATH = 'C:\\Users\\maria\\Documents\\tpe\\bbb_database.db'


def fetch_data(query):
    """ Exécute une requête et retourne les résultats sous forme de JSON """
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            data = con.execute(query).fetchall()
            columns = [desc[0] for desc in con.execute(f"PRAGMA table_info({query.split(' ')[3]})").fetchall()]
            return [dict(zip(columns, row)) for row in data]
    except Exception as e:
        return {"error": str(e)}


@app.route('/api/<session_id>/GetUser', methods=['GET'])
def get_user(session_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM User WHERE user_id IN (SELECT user_id FROM User_Session WHERE session_id = '{session_id}')"
    return jsonify(fetch_data(query))


@app.route('/api/<user_id>/GetSessions', methods=['GET'])
def get_Sessions(user_id):
    if not user_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM Session WHERE session_id IN (SELECT session_id FROM User_Session WHERE user_id = '{user_id}')"
    return jsonify(fetch_data(query))


@app.route('/api/GetUser', methods=['GET'])
def get_users():
    try:
        # Utiliser fetch_data pour récupérer les utilisateurs
        users = fetch_data("SELECT * FROM User")  # Requête SQL pour récupérer les utilisateurs

        # Vérification de la longueur des utilisateurs
        print("aaaaa", len(users))

        return jsonify(users)

    except Exception as e:
        # Gestion des erreurs en cas de problème
        return jsonify({"error": str(e)}), 500  # Retourne l'erreur 500 si quelque chose échoue


@app.route('/api/GetSession', methods=['GET'])
def get_session():
    try:
        # Utiliser fetch_data pour récupérer les sessions
        sessions = fetch_data("SELECT * FROM Session")  # Requête SQL pour récupérer les sessions
        # Retourner les résultats au format JSON
        return jsonify(sessions)
    except Exception as e:
        # Gestion des erreurs en cas de problème
        return jsonify({"error": str(e)}), 500  # Retourne l'erreur 500 si quelque chose échoue




@app.route('/api/GetSession/<session_id>', methods=['GET'])
def get_session_id(session_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM Session WHERE session_id = '{session_id}'"
    return jsonify(fetch_data(query))


@app.route('/api/<session_id>/GetPoll', methods=['GET'])
def get_poll(session_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM Poll WHERE session_id = '{session_id}'"
    return jsonify(fetch_data(query))


@app.route('/api/GetAnswers', methods=['GET'])
def get_answers():
    return jsonify(fetch_data("SELECT * FROM Answers"))


@app.route('/api/<session_id>/GetPresentationSlides', methods=['GET'])
def get_presentation_slides(session_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM PresentationSlides WHERE session_id = '{session_id}'"
    return jsonify(fetch_data(query))


@app.route('/api/<session_id>/GetScreenShare', methods=['GET'])
def get_screen_share(session_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM ScreenShare WHERE session_id  = '{session_id}'"
    return jsonify(fetch_data(query))


@app.route('/api/GetUserSession', methods=['GET'])
def get_user_session():
    return jsonify(fetch_data("SELECT * FROM User_Session"))


@app.route('/api/<session_id>/GetReaction', methods=['GET'])
def get_reaction_session(session_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM Reaction WHERE session_id = '{session_id}'"
    return jsonify(fetch_data(query))


@app.route('/api/<session_id>/<user_id>/GetReaction', methods=['GET'])
def get_reaction(session_id, user_id):
    if not session_id or not user_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM Reaction WHERE session_id = '{session_id}' AND user_id= '{user_id}'"
    return jsonify(fetch_data(query))


@app.route('/api/<session_id>/GetEmoji', methods=['GET'])
def get_emoji_session(session_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM Emoji WHERE session_id = '{session_id}'"
    return jsonify(fetch_data(query))


@app.route('/api/<session_id>/<user_id>/GetEmoji', methods=['GET'])
def get_emoji(session_id, user_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            # Liste pour stocker les résultats des temps de parole
            nb_emojis = []

            # Récupération du temps de parole pour l'utilisateur donné
            result = webCamTime(con, session_id, user_id)
            if result:  # Ne rajouter que si le résultat est valide
                nb_emojis.append(result)

                # Retourner les résultats dans un format JSON
                return jsonify({
                    "nb_emojis": nb_emojis
                }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/<user_id>/GetEmojiUser', methods=['GET'])
def get_emoji_sessionUser(session_id, user_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM Emoji WHERE session_id = '{session_id}' AND user_id= '{user_id}'"
    return jsonify(fetch_data(query))


@app.route('/api/<session_id>/GetWebCam', methods=['GET'])
def get_webCam(session_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    query = f"SELECT * FROM webCam WHERE session_id =  '{session_id}'"
    return jsonify(fetch_data(query))


@app.route('/api/<session_id>/<user_id>/GetWebCam', methods=['GET'])
def get_webcam_by_user(session_id, user_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            # Liste pour stocker les résultats des temps de parole
            webcam_times = []

            # Récupération du temps de parole pour l'utilisateur donné
            result = webCamTime(con, session_id, user_id)
            if result:  # Ne rajouter que si le résultat est valide
                webcam_times.append(result)

        # Retourner les résultats dans un format JSON
        return jsonify({
            "webcam_times": webcam_times
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/<user_id>/GetTalkTime', methods=['GET'])
def get_talktime_by_user(session_id, user_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            if not session_id:
                return jsonify({"error": "session_id is required"}), 400
            if not user_id:
                return jsonify({"error": "user_id is required"}), 400

            result = talkTime(con, session_id, user_id)
            if result:
                talk_time = result

            return jsonify({
                "talk_time": talk_time
            }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/<user_id>/GetOnlineTime', methods=['GET'])
def get_onlinetime_by_user(session_id, user_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            if not session_id:
                return jsonify({"error": "session_id is required"}), 400
            if not user_id:
                return jsonify({"error": "user_id is required"}), 400

            result = onlineTime(con, session_id, user_id)
            if result:
                online_time = result

            return jsonify({
                "online_time": online_time
            }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/user_activity_timeline', methods=['GET'])
def get_user_activity_timeline(session_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            query = '''
                WITH time_points AS (
                    SELECT registered_on AS timestamp, 1 AS change 
                    FROM User_Session 
                    WHERE session_id = ?
                    UNION ALL
                    SELECT left_on AS timestamp, -1 AS change 
                    FROM User_Session 
                    WHERE session_id = ? AND left_on IS NOT NULL
                ),
                numbered_points AS (
                    SELECT 
                        timestamp,
                        SUM(change) OVER (ORDER BY timestamp) AS active_users,
                        ROW_NUMBER() OVER (ORDER BY timestamp) AS row_num
                    FROM time_points
                    WHERE timestamp IS NOT NULL
                )
                SELECT 
                    timestamp,
                    active_users,
                    COALESCE(
                        (SELECT active_users 
                         FROM numbered_points prev
                         WHERE prev.row_num = curr.row_num - 1), 0) AS previous_users
                FROM numbered_points curr
                ORDER BY timestamp
            '''
            data = con.execute(query, [session_id, session_id]).fetchall()

            result = [{
                "timestamp": datetime.fromtimestamp(row[0] / 1000).isoformat(),
                "timestamp_raw": row[0],
                "active_users": row[1],
                "previous_users": row[2]
            } for row in data]

            return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": "Database error",
            "details": str(e)
        }), 500


@app.route('/api/<session_id>/talktimes', methods=['GET'])
def get_all_talk_times(session_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            # Récupérer tous les user_ids pour cette session
            user_query = "SELECT user_id FROM User_Session WHERE session_id = ?"
            user_ids = [row[0] for row in con.execute(user_query, [session_id]).fetchall()]

            # Liste pour stocker les résultats des temps de parole
            talk_times = []

            # Parcours de chaque user_id pour récupérer le temps de parole
            for user_id in user_ids:
                result = talkTime(con, session_id, user_id)
                if result:  # Ne rajouter que les utilisateurs avec un temps de parole valide
                    talk_times.append(result)

        # Retourner les résultats dans un format JSON
        return jsonify({
            "talk_times": talk_times
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/onlinetimes', methods=['GET'])
def get_all_online_times(session_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            # Récupérer tous les user_ids pour cette session
            user_query = "SELECT user_id FROM User_Session WHERE session_id = ?"
            user_ids = [row[0] for row in con.execute(user_query, [session_id]).fetchall()]

            # Liste pour stocker les résultats des temps de parole
            online_times = []

            # Parcours de chaque user_id pour récupérer le temps de parole
            for user_id in user_ids:
                result = onlineTime(con, session_id, user_id)
                if result:  # Ne rajouter que les utilisateurs avec un temps de parole valide
                    online_times.append(result)

        # Retourner les résultats dans un format JSON
        return jsonify({
            "online_times": online_times
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/WebCamtimes', methods=['GET'])
def get_all_webcam_times(session_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            # Récupérer tous les user_ids pour cette session
            user_query = "SELECT user_id FROM User_Session WHERE session_id = ?"
            user_ids = [row[0] for row in con.execute(user_query, [session_id]).fetchall()]

            # Liste pour stocker les résultats des temps de parole
            webcam_times = []

            # Parcours de chaque user_id pour récupérer le temps de parole
            for user_id in user_ids:
                result = webCamTime(con, session_id, user_id)
                if result:  # Ne rajouter que les utilisateurs avec un temps de parole valide
                    webcam_times.append(result)

        # Retourner les résultats dans un format JSON
        return jsonify({
            "webcam_times": webcam_times
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/nbEmojis', methods=['GET'])
def get_nb_of_emojis(session_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            # Récupérer tous les user_ids pour cette session
            user_query = "SELECT user_id FROM User_Session WHERE session_id = ?"
            user_ids = [row[0] for row in con.execute(user_query, [session_id]).fetchall()]

            # Liste pour stocker les résultats des temps de parole
            nb_emojis = []

            # Parcours de chaque user_id pour récupérer le temps de parole
            for user_id in user_ids:
                result = Nombre_Emojis(con, session_id, user_id)
                if result:  # Ne rajouter que les utilisateurs avec un temps de parole valide
                    nb_emojis.append(result)

        # Retourner les résultats dans un format JSON
        return jsonify({
            "nb_emojis": nb_emojis
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/nbReactions', methods=['GET'])
def get_nb_of_reactions(session_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            # Récupérer tous les user_ids pour cette session
            user_query = "SELECT user_id FROM User_Session WHERE session_id = ?"
            user_ids = [row[0] for row in con.execute(user_query, [session_id]).fetchall()]

            # Liste pour stocker les résultats des temps de parole
            nb_reactions = []

            # Parcours de chaque user_id pour récupérer le temps de parole
            for user_id in user_ids:
                result = Nombre_Reaction(con, session_id, user_id)
                if result:  # Ne rajouter que les utilisateurs avec un temps de parole valide
                    nb_reactions.append(result)

        # Retourner les résultats dans un format JSON
        return jsonify({
            "nb_reactions": nb_reactions
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/totalMessage', methods=['GET'])
def get_total_Message(session_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            # Récupérer tous les user_ids pour cette session
            user_query = "SELECT user_id FROM User_Session WHERE session_id = ?"
            user_ids = [row[0] for row in con.execute(user_query, [session_id]).fetchall()]

            # Liste pour stocker les résultats des temps de parole
            nb_message = []

            # Parcours de chaque user_id pour récupérer le temps de parole
            for user_id in user_ids:
                result = totalMessage(con, session_id, user_id)
                if result:  # Ne rajouter que les utilisateurs avec un temps de parole valide
                    nb_message.append(result)

        # Retourner les résultats dans un format JSON
        return jsonify({
            "nb_message": nb_message
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/GetUserSession', methods=['GET'])
def get_session_user(session_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            query = "SELECT user_id, is_moderator, is_dial_in,registered_on, left_on FROM User_Session WHERE session_id = ?"
            cursor = con.execute(query, [session_id])
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()

            result = [dict(zip(columns, row)) for row in rows]

            return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/<session_id>/Scores', methods=['GET'])
def get_all_user_scores(session_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            # Récupération des identifiants utilisateur pour cette session
            user_query = "SELECT user_id FROM User_Session WHERE session_id = ?"
            user_rows = con.execute(user_query, [session_id]).fetchall()

            duration_query = "SELECT ended_on-created_on FROM Session WHERE session_id = ?"
            durations_rows = con.execute(duration_query, [session_id]).fetchall()

            # Vérifie si des résultats ont été renvoyés
            if durations_rows and durations_rows[0][0] is not None:
                duree = int(durations_rows[0][0])/1000

            emojis_query = "SELECT count(*) as nb_emojis FROM Emoji WHERE session_id = ?"
            emojis_rows = con.execute(emojis_query, [session_id]).fetchall()
            if emojis_rows:
                nb_emojis = emojis_rows[0][0]

            reactions_query = "SELECT count(*) as nb_reactions FROM Reaction WHERE session_id = ?"
            reactions_rows = con.execute(reactions_query, [session_id]).fetchall()
            if reactions_rows:
                nb_reactions = reactions_rows[0][0]

            message_query = "SELECT SUM(total_of_messages) as total_message FROM User_Session WHERE session_id = ?"
            message_rows = con.execute(message_query, [session_id]).fetchall()
            if message_rows:
                nb_message = message_rows[0][0]

            scores = []

            for row in user_rows:
                user_id = row[0]

                # Calcul des différents paramètres avec valeur par défaut à 0 si None
                talk_time = (talkTime(con, session_id, user_id) or {}).get("talk_time", 0)
                online_time = (onlineTime(con, session_id, user_id) or {}).get("online_time", 0)
                webcam_time = (webCamTime(con, session_id, user_id) or {}).get("webcam_time", 0)
                total_messages = (totalMessage(con, session_id, user_id) or {}).get("nb_message", 0)
                emojis = (Nombre_Emojis(con, session_id, user_id) or {}).get("nb_emojis", 0)
                reactions = (Nombre_Reaction(con, session_id, user_id) or {}).get("nb_reactions", 0)

                # Normalisation des scores pour chaque métrique
                norm_talk_time = (0.2*talk_time / duree )
                norm_online_time = (0.25*online_time / duree )
                norm_webcam_time = (0.2*webcam_time / duree)
                norm_total_messages = (0.15*total_messages / nb_message ) if nb_message > 0 else 0
                norm_emojis = (0.1*emojis / nb_emojis ) if nb_emojis > 0 else 0
                norm_reactions = (0.1*reactions / nb_reactions) if nb_reactions > 0 else 0

                # Calcul du score final (moyenne des scores normalisés)
                score = (
                                norm_talk_time +
                                norm_online_time +
                                norm_webcam_time +
                                norm_total_messages +
                                norm_emojis +
                                norm_reactions
                        ) *100

                scores.append({
                    "user_id": user_id,
                    "score": round(score,2)
                })

            return jsonify({
                "session_id": session_id,
                "scores": scores
            }), 200

    except Exception as e:
        print("Erreur lors du calcul des scores:", e)  # ✅ Log utile côté serveur
        return jsonify({"error": str(e)}), 500

@app.route('/api/<user_id>/AllSessionScores', methods=['GET'])
def get_user_scores_in_all_sessions(user_id):
    try:
        with duckdb.connect(DB_PATH, read_only=True) as con:
            # Récupérer toutes les sessions de cet utilisateur
            session_query = '''SELECT us.session_id, s.name as session_name FROM User_Session us JOIN Session s ON us.session_id = s.session_id WHERE us.user_id = ?'''
            session_rows = con.execute(session_query, [user_id]).fetchall()
            # Récupérer le nom de l'utilisateur
            user_name_query = "SELECT name ,ext_id FROM User WHERE user_id = ?"
            user_name_row = con.execute(user_name_query, [user_id]).fetchone()
            user_name = user_name_row[0] if user_name_row else "Inconnu"
            user_ext = user_name_row[1] if user_name_row else "Inconnu"

            scores = []

            for session_id, session_name in session_rows:

                # Calcul de la durée de session
                duration_query = "SELECT ended_on - created_on FROM Session WHERE session_id = ?"
                duration_row = con.execute(duration_query, [session_id]).fetchone()
                duree = int(duration_row[0]) / 1000 if duration_row and duration_row[0] is not None else 1

                # Nombre total d’emojis dans cette session
                emojis_query = "SELECT count(*) FROM Emoji WHERE session_id = ?"
                nb_emojis = con.execute(emojis_query, [session_id]).fetchone()[0]

                # Nombre total de réactions dans cette session
                reactions_query = "SELECT count(*) FROM Reaction WHERE session_id = ?"
                nb_reactions = con.execute(reactions_query, [session_id]).fetchone()[0]

                # Nombre total de messages dans cette session
                message_query = "SELECT SUM(total_of_messages) FROM User_Session WHERE session_id = ?"
                nb_message = con.execute(message_query, [session_id]).fetchone()[0] or 1

                # Données utilisateur
                talk_time = (talkTime(con, session_id, user_id) or {}).get("talk_time", 0)
                online_time = (onlineTime(con, session_id, user_id) or {}).get("online_time", 0)
                webcam_time = (webCamTime(con, session_id, user_id) or {}).get("webcam_time", 0)
                total_messages = (totalMessage(con, session_id, user_id) or {}).get("nb_message", 0)
                emojis = (Nombre_Emojis(con, session_id, user_id) or {}).get("nb_emojis", 0)
                reactions = (Nombre_Reaction(con, session_id, user_id) or {}).get("nb_reactions", 0)

                # Normalisation
                norm_talk_time = (0.2 * talk_time / duree)
                norm_online_time = (0.25 * online_time / duree)
                norm_webcam_time = (0.2 * webcam_time / duree)
                norm_total_messages = (0.15 * total_messages / nb_message) if nb_message > 0 else 0
                norm_emojis = (0.1 * emojis / nb_emojis) if nb_emojis > 0 else 0
                norm_reactions = (0.1 * reactions / nb_reactions) if nb_reactions > 0 else 0

                # Score final
                score = (
                    norm_talk_time +
                    norm_online_time +
                    norm_webcam_time +
                    norm_total_messages +
                    norm_emojis +
                    norm_reactions
                ) * 100

                scores.append({
                    "session_id": session_id,
                    "session_name": session_name,
                    "score": round(score, 2)
                })

            return jsonify({
                "user_id": user_id,
                "user_name": user_name,
                "user_ext":user_ext,
                "scores_by_session": scores
            }), 200

    except Exception as e:
        print("Erreur lors du calcul des scores utilisateur:", e)
        return jsonify({"error": str(e)}), 500



# Démarre l'application Flask
if __name__ == '__main__':
    app.run(debug=True)
