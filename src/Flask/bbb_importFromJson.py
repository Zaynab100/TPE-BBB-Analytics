import os
import glob
import duckdb
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

json_rep = "C:\\Users\\maria\\Documents\\tpe\\my-b-app\\Data"
con = duckdb.connect('C:\\Users\\maria\\Documents\\tpe\\bbb_database.db')

# Vérifier la connexion et les tables
if con is None:
    print("Échec de la connexion à la base de données.")
else:
    print("Connexion à la base de données réussie.")
    tables = con.execute("SHOW TABLES;").fetchall()


def insert_users(connection, data):
    for userKey, userData in data["users"].items():
        # Vérification avant insertion
        exists = connection.execute(
            "SELECT 1 FROM User WHERE user_id = ?",
            (userKey,)
        ).fetchone()

        if not exists:
            connection.execute(
                "INSERT INTO User(user_id, ext_id, name) VALUES(?, ?, ?)",
                (userKey, userData["extId"], userData["name"])
            )
    print("Insertion dans User terminée (doublons ignorés)")


def insert_session(connection, data):
    exists = connection.execute(
        "SELECT 1 FROM Session WHERE session_id = ?",
        (data["intId"],)
    ).fetchone()

    if not exists:
        connection.execute(
            "INSERT INTO Session(session_id, ext_id, name, created_on, ended_on, download_data_enabled) "
            "VALUES(?, ?, ?, ?, ?, ?)",
            (data["intId"], data["extId"], data["name"], data["createdOn"],
             data["endedOn"], data["downloadSessionDataEnabled"])
        )
    print("Insertion dans Session terminée (doublons ignorés)")


def insert_User_Session(connection, data):
    for userKey, userData in data["users"].items():
        exists = connection.execute(
            "SELECT 1 FROM User_Session WHERE session_id = ? AND user_id = ?",
            (data["intId"], userKey)
        ).fetchone()

        if not exists:
            connection.execute(
                "INSERT INTO User_Session(session_id, user_id, is_moderator, is_dial_in, "
                "registered_on, left_on, total_of_messages, last_talk_started_on, total_time, user_left_flag) "
                "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    data["intId"], userKey, userData["isModerator"], userData["isDialIn"],
                    userData["intIds"][userData["extId"]]["registeredOn"],
                    userData["intIds"][userData["extId"]]["leftOn"],
                    userData["totalOfMessages"], userData["talk"]["lastTalkStartedOn"],
                    userData["talk"]["totalTime"], userData["intIds"][userData["extId"]]["userLeftFlag"]
                )
            )
    print("Insertion dans User_Session terminée (doublons ignorés)")


def insert_emojis(connection, data):
    for userKey, userData in data["users"].items():
        for emoji in userData["emojis"]:
            # Vérifier si l'emoji existe déjà
            exists = connection.execute(
                "SELECT 1 FROM Emoji WHERE session_id = ? AND user_id = ? AND name = ? AND sent_on = ?",
                (data["intId"], userKey, emoji["name"], emoji["sentOn"])
            ).fetchone()

            if not exists:
                connection.execute(
                    "INSERT INTO Emoji(session_id, user_id, name, sent_on) VALUES(?, ?, ?, ?)",
                    (data["intId"], userKey, emoji["name"], emoji["sentOn"])
                )
    print("Insertion dans Emoji terminée (doublons ignorés)")

def insert_screenshare(connection, data):
    for screen in data["screenshares"]:
        exists = connection.execute(
            "SELECT 1 FROM ScreenShare WHERE session_id = ? AND started_on = ?",
            (data["intId"], screen["startedOn"])
        ).fetchone()

        if not exists:
            connection.execute(
                "INSERT INTO ScreenShare(started_on, stopped_on, session_id) "
                "VALUES(?, ?, ?)",
                (screen["startedOn"], screen["stoppedOn"], data["intId"])
            )
    print("Insertion dans ScreenShare terminée (doublons ignorés)")


def insert_poll(connection, data):
    for pollId, poll in data["polls"].items():
        exists = connection.execute(
            "SELECT 1 FROM poll WHERE poll_id = ?",
            (pollId,)
        ).fetchone()

        if not exists:
            connection.execute(
                "INSERT INTO poll(poll_id, poll_type, anonymous, multiple, question, "
                "option, anonymousAnswers, createdOn, session_id) "
                "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    pollId, poll["pollType"], poll["anonymous"], poll["multiple"],
                    poll["question"], poll["options"], poll["anonymousAnswers"],
                    poll["createdOn"], data["intId"]
                )
            )
    print("Insertion dans poll terminée (doublons ignorés)")


def insert_reaction(connection, data):
    for userKey, userData in data["users"].items():
        for reaction in userData["reactions"]:
            # Vérifier si la réaction existe déjà
            result = connection.execute(
                "SELECT 1 FROM Reaction WHERE session_id = ? AND user_id = ? AND name = ? AND sent_on = ?",
                (data["intId"], userKey, reaction["name"], reaction["sentOn"])
            ).fetchone()

            # Insérer seulement si la réaction n'existe pas
            if not result:
                connection.execute(
                    "INSERT INTO Reaction(session_id, user_id, name, sent_on) VALUES(?, ?, ?, ?)",
                    (data["intId"], userKey, reaction["name"], reaction["sentOn"])
                )
    print("Insertion dans Reaction terminée (doublons ignorés)")

def insert_webcam(connection, data):
    for userKey, userData in data["users"].items():
        for webcam in userData["webcams"]:
            exists = connection.execute(
                "SELECT 1 FROM WebCam WHERE session_id = ? AND user_id = ? AND started_on = ?",
                (data["intId"], userKey, webcam["startedOn"])
            ).fetchone()

            if not exists:
                connection.execute(
                    "INSERT INTO WebCam(session_id, user_id, started_on, stopped_on) "
                    "VALUES(?, ?, ?, ?)",
                    (data["intId"], userKey, webcam["startedOn"], webcam["stoppedOn"])
                )
    print("Insertion dans WebCam terminée (doublons ignorés)")


def insert_presentation_slide(connection, data):
    for slide in data["presentationSlides"]:
        exists = connection.execute(
            "SELECT 1 FROM PresentationSlides WHERE session_id = ? AND presentation_id = ? AND page_num = ?",
            (data["intId"], slide["presentationId"], slide["pageNum"])
        ).fetchone()

        if not exists:
            connection.execute(
                "INSERT INTO PresentationSlides(session_id, presentation_id, page_num, set_on, presentation_name) "
                "VALUES(?, ?, ?, ?, ?)",
                (
                    data["intId"], slide["presentationId"], slide["pageNum"],
                    slide["setOn"], slide["presentationName"]
                )
            )
    print("Insertion dans PresentationSlides terminée (doublons ignorés)")


def insert_answers(connection, data):
    for userKey, userData in data["users"].items():
        for pollId, answer in userData["answers"].items():
            exists = connection.execute(
                "SELECT 1 FROM Answers WHERE poll_id = ? AND user_id = ?",
                (pollId, userKey)
            ).fetchone()

            if not exists:
                connection.execute(
                    "INSERT INTO Answers(poll_id, user_id, answer) VALUES(?, ?, ?)",
                    (pollId, userKey, json.dumps(answer))
                )
    print("Insertion dans Answers terminée (doublons ignorés)")


# Traitement des fichiers
for fichier in glob.glob(os.path.join(json_rep, "*.json")):
    with open(fichier, "r", encoding="utf-8") as file:
        print("Traitement du fichier : " + fichier)
        json_data = json.load(file)

        # Insérer les données avec gestion des doublons
        insert_users(con, json_data)
        insert_session(con, json_data)
        insert_User_Session(con, json_data)
        insert_emojis(con, json_data)
        insert_screenshare(con, json_data)
        insert_poll(con, json_data)
        insert_reaction(con, json_data)
        insert_webcam(con, json_data)
        insert_presentation_slide(con, json_data)
        insert_answers(con, json_data)

'''
# Vérifier si la table User existe
if ('User',) in tables:
    result = con.sql("SELECT * FROM USER;").fetchall()
    print("Contenu de la table USER :", result)
else:
    print("La table 'USER' n'existe pas dans la base de données.")

# Vérifier si la table Session existe
if ('Session',) in tables:
    result = con.sql("SELECT * FROM Session;").fetchall()
    print("Contenu de la table Session :", result)
else:
    print("La table 'Session' n'existe pas dans la base de données.")


# Vérifier si la table User_Session existe
if ('User_Session',) in tables:
    result = con.sql("SELECT * FROM User_Session;").fetchall()
    print("Contenu de la table User_Session :", result)
else:
    print("La table 'User_Session' n'existe pas dans la base de données.")

# Vérifier si la table Emoji existe
if ('Emoji',) in tables:
    result = con.sql("SELECT * FROM Emoji;").fetchall()
    print("Contenu de la table Emoji :", result)
else:
    print("La table 'Emoji' n'existe pas dans la base de données.")

# Vérifier si la table ScreenShare existe
if ('ScreenShare',) in tables:
    result = con.sql("SELECT * FROM ScreenShare;").fetchall()
    print("Contenu de la table ScreenShare :", result)
else:
    print("La table 'ScreenShare' n'existe pas dans la base de données.")


# Vérifier si la table ScreenShare existe
if ('WebCam',) in tables:
    result = con.sql("SELECT * FROM WebCam;").fetchall()
    print("Contenu de la table WebCam :", result)
else:
    print("La table 'WebCam' n'existe pas dans la base de données.")


# Vérifier si la table PresentationSlides existe
if ('PresentationSlides',) in tables:
    result = con.sql("SELECT * FROM PresentationSlides;").fetchall()
    print("Contenu de la table PresentationSlides :", result)
else:
    print("La table 'PresentationSlides' n'existe pas dans la base de données.")
'''

def onlineTime(connection, sessionId, userId):
    cursor = connection.execute(
        "SELECT registered_on, left_on FROM User_Session WHERE session_id=? AND user_id=?;",
        (sessionId, userId)
    )
    result = cursor.fetchone()  # Récupère une ligne

    if result:
        registered_on, left_on = result
        # Calcul du temps de connexion (en millisecondes)
        online_time = left_on - registered_on
        # Conversion en secondes
        seconds = online_time // 1000

        # Récupérer le nom de l'utilisateur
        cursor = connection.execute(
            "SELECT name FROM User WHERE user_id = ?",
            (userId,)
        )
        user_name_result = cursor.fetchone()

        userName = user_name_result[
            0] if user_name_result else "Nom inconnu"  # Si aucun nom trouvé, mettre une valeur par défaut

        return {
            "user_id": userId,
            "user_name":userName,
            "online_time": seconds
        }
    else:
        return {
            "user_id": userId,
            "error": "Aucune session trouvée"
        }

#onlineTime(con,"79f81e55a8b4797efeef1807f2eb0b78ba650536-1737724796621","w_duioh7r2k0ic-1")


def talkTime(connection, sessionId, userId):
    cursor = connection.execute(
        "SELECT total_time FROM User_Session WHERE session_id=? AND user_id=?;",
        (sessionId, userId)
    )
    result = cursor.fetchone()

    if result:
        total_time = result[0]  # Le total_time récupéré
        seconds = total_time // 1000  # Conversion en secondes
        # Récupérer le nom de l'utilisateur
        cursor = connection.execute(
            "SELECT name FROM User WHERE user_id = ?",
            (userId,)
        )
        user_name_result = cursor.fetchone()

        userName = user_name_result[
            0] if user_name_result else "Nom inconnu"  # Si aucun nom trouvé, mettre une valeur par défaut

        return {
            "user_id": userId,
            "user_name" : userName,
            "talk_time": seconds
        }
    else:
        # Retourne None si aucune donnée valide n'est trouvée
        return None

#talkTime(con,"79f81e55a8b4797efeef1807f2eb0b78ba650536-1737724796621","w_duioh7r2k0ic-1")

def webCamTime(connection, sessionId, userId):
    cursor = connection.execute(
        "SELECT stopped_on, started_on FROM WebCam WHERE session_id=? AND user_id=? AND stopped_on IS NOT NULL AND started_on IS NOT NULL;",
        (sessionId, userId)
    )
    result = cursor.fetchone()

    if result:
        stopped_on, started_on = result
        total_time = stopped_on - started_on  # durée en millisecondes
        seconds = total_time // 1000  # conversion en secondes

        # Récupérer le nom de l'utilisateur
        cursor = connection.execute(
            "SELECT name FROM User WHERE user_id = ?",
            (userId,)
        )
        user_name_result = cursor.fetchone()

        userName = user_name_result[0] if user_name_result else "Nom inconnu"

        return {
            "user_id": userId,
            "user_name": userName,
            "webcam_time": seconds
        }
    else:
        # Aucun enregistrement trouvé
        return None
# webCamTime(con, "020a5f4e51a7061470513135f00b4ba507d0968f-1737710309424", "w_anxftr1hsbtt-1")

def totalMessage(connection, sessionId, userId):
    cursor = connection.execute(
        "SELECT total_of_messages FROM User_Session WHERE session_id=? AND user_id=?;",
        (sessionId, userId)
    )
    result = cursor.fetchone()  # Récupère une ligne

    if result:
        nb_message, = result  # Décompte des emojis (valeur de la première colonne)

        # Récupérer le nom de l'utilisateur
        cursor = connection.execute(
            "SELECT name FROM User WHERE user_id = ?",
            (userId,)
        )
        user_name_result = cursor.fetchone()

        userName = user_name_result[0] if user_name_result else "Nom inconnu"

        return {
            "user_id": userId,
            "user_name": userName,
            "nb_message": nb_message
        }
    else:
        return None
#totalMessage(con,"79f81e55a8b4797efeef1807f2eb0b78ba650536-1737724796621","w_duioh7r2k0ic-1")


def Nombre_Emojis(connection, sessionId, userId):
    # Récupère le nombre d'emojis envoyés par l'utilisateur dans la session
    cursor = connection.execute(
        "SELECT count() FROM Emoji WHERE session_id=? AND user_id=?;",
        (sessionId, userId)
    )
    result = cursor.fetchone()  # Récupère une ligne

    if result:
        nombre_emojis, = result  # Décompte des emojis (valeur de la première colonne)

        # Récupérer le nom de l'utilisateur
        cursor = connection.execute(
            "SELECT name FROM User WHERE user_id = ?",
            (userId,)
        )
        user_name_result = cursor.fetchone()

        userName = user_name_result[0] if user_name_result else "Nom inconnu"

        return {
            "user_id": userId,
            "user_name": userName,
            "nb_emojis": nombre_emojis
        }
    else:
        return None


#Emojis(con,"c3505e59401a051acde0b0a82b1082ef9165b37a-1737712422440","w_qashezl0bwum-1")

def Nombre_Reaction(connection, sessionId, userId):
        # Récupère le nombre d'emojis envoyés par l'utilisateur dans la session
        cursor = connection.execute(
            "SELECT count() FROM Reaction WHERE session_id=? AND user_id=?;",
            (sessionId, userId)
        )
        result = cursor.fetchone()  # Récupère une ligne

        if result:
            nombre_reactions, = result  # Décompte des emojis (valeur de la première colonne)

            # Récupérer le nom de l'utilisateur
            cursor = connection.execute(
                "SELECT name FROM User WHERE user_id = ?",
                (userId,)
            )
            user_name_result = cursor.fetchone()

            userName = user_name_result[0] if user_name_result else "Nom inconnu"

            return {
                "user_id": userId,
                "user_name": userName,
                "nb_reactions": nombre_reactions
            }
        else:
            return None


Nombre_Reaction(con,"c3505e59401a051acde0b0a82b1082ef9165b37a-1737712422440","w_qashezl0bwum-1")
con.close()