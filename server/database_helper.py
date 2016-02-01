#Function to access and control the database , used by server to access the database

import sqlite3
import json
import uuid

def sign_in(email, password):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))

    if cursor.fetchone() != None:
        token = generate_token()
        cursor.execute("UPDATE users SET token=? WHERE email=? AND password=?", (token, email, password))
        connection.commit()
        connection.close()
        return  json.dumps({"success": True,
                            "message": "Successfully signed in.", "data": token})
    else: 
        connection.close()
        return json.dumps({"success": False,
                           "message": "Wrong username or password."})

def sign_out(token):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE token=?", (token,))
    if cursor.fetchone() != None:
        cursor.execute("UPDATE users SET token=NULL WHERE token=?", (token,))
        connection.commit()
        connection.close()
        return  json.dumps({"success": True,
                            "message": "Successfully signed out."})
    else: 
        connection.close()
        return  json.dumps({"success": False,
                            "message": "You are not signed in."})


def generate_token():
    return str(uuid.uuid4()).replace('-', '')
