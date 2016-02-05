#Function to access and control the database , used by server to access the database

import sqlite3
import json
import uuid
import hashlib
from time import localtime, strftime

def generate_hash(password):
    return hashlib.sha256(password).hexdigest()

def get_user_id(cursor, token):
    cursor.execute("SELECT user_id FROM tokens WHERE id=?", (token,))
    try:
        a =  cursor.fetchone()[0]
        return a
    except: 
        return None

def sign_in(email, password):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, generate_hash(password)))
    if cursor.fetchone() != None:
        token = generate_token()
        cursor.execute("INSERT INTO tokens VALUES(?, (SELECT id FROM users WHERE email=?))", (token, email))
        connection.commit()
        connection.close()
        return  json.dumps({"success": True,
                            "message": "Successfully signed in.", "data": token})
    else: 
        connection.close()
        return json.dumps({"success": False,
                           "message": "Wrong username or password."})

def sign_up(email, password, first_name, 
            family_name, gender, city, country):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM users WHERE email=?", (email,))
    if cursor.fetchone() != None:
        connection.close()
        return  json.dumps({"success": False,
                            "message": "User already exists."})
    cursor.execute("INSERT INTO users VALUES(NULL, ?, ?, ?, ?, ?, ?, ?)",
                   (first_name, family_name, email, city, country, generate_hash(password), gender))
    connection.commit()
    connection.close();
    return  json.dumps({"success": True,
                        "message": "Ha en bra dag kompis!"})


def sign_out(token):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM tokens WHERE id=?", (token,))
  
    if cursor.fetchone() != None:
        #TODO!!!!!! Remove a token from the user
        connection.execute("DELETE FROM tokens WHERE id=?", (token,))
        connection.commit()
        connection.close()
        return  json.dumps({"success": True,
                            "message": "Successfully signed out."})
    else: 
        connection.close()
        return  json.dumps({"success": False,
                            "message": "You are not signed in."})


def change_password(token,old_password,new_password):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM tokens WHERE id=?", (token,))
   
    if cursor.fetchone() == None:
        return json.dumps({"success": False, "message": "You are not logged in."})
        
    else:
        user_id = get_user_id(cursor, token)
        cursor.execute("SELECT * FROM users WHERE id=? AND password=?", (user_id, generate_hash(old_password)))
        if cursor.fetchone() != None:
            cursor.execute("UPDATE users SET password=? WHERE id=?", (generate_hash(new_password), user_id))
            connection.commit()
            connection.close()
            return json.dumps( {"success": True, "message": "Password changed."} )
        else:
            connection.close()
            return json.dumps({"success": False, "message": "Wrong password."})


def get_user_data_by_token(token):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    user_id = get_user_id(cursor,token)
    cursor.execute("SELECT first_name,family_name,email,city,country,gender FROM users WHERE id=?", (user_id,))
    cursorObject = cursor.fetchone()
    
    if cursorObject == None:
        connection.close()
        return json.dumps( {"success": False, "message": "You are not signed in."})
    else:
        match = {"firstname": cursorObject[0] , "familyname":cursorObject[1] , "email": cursorObject[2] 
                 , "city": cursorObject[3] , "country": cursorObject[4] , "gender": cursorObject[5]}   
        connection.close()
        return json.dumps({"success": True, "message": "User data retrieved.", "data": match})
    
def get_user_data_by_email(token,email):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    user_id = get_user_id(cursor,token)
    cursor.execute("SELECT * FROM users WHERE id=?",(user_id,))

    if cursor.fetchone() == None:
        connection.close()
        return json.dumps( {"success": False, "message": "You are not signed in."})
    
    cursor.execute("SELECT first_name,family_name,email,city,country,gender FROM users WHERE email=?",(email,))
    cursorObject = cursor.fetchone()

    if cursorObject  == None:
        connection.close()
        return json.dumps( {"success": False, "message": "No such user."})
    else:
        match = {"firstname": cursorObject[0] , "familyname":cursorObject[1] , "email": cursorObject[2] 
                 , "city": cursorObject[3] , "country": cursorObject[4] , "gender": cursorObject[5]}   
        connection.close()
        return json.dumps({"success": True, "message": "User data retrieved.", "data": match})


def get_user_messages_by_token(token):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    user_id = get_user_id(cursor,token)
    cursor.execute("SELECT * FROM users WHERE id=?",(user_id,))

    if cursor.fetchone() == None:
        connection.close()
        return json.dumps({"success": False, "message": "You are not logged in."})

    messages = []
    for row in cursor.execute("SELECT contents FROM messages WHERE recipient_id=? ORDER BY sent_date ASC",
                             (user_id, ) ):
        messages.append(row[0])
    connection.close()
    return json.dumps({"success": True, "message": "User data retrieved.", "data": messages})


def get_user_messages_by_email(token,email):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    user_id = get_user_id(cursor,token)
    cursor.execute("SELECT * FROM users WHERE id=?",(user_id,))
    
    if cursor.fetchone() == None:
        connection.close()
        return json.dumps( {"success": False, "message": "You are not signed in."})
        
    cursor.execute("SELECT first_name FROM users WHERE email=?",(email,))
    if cursor.fetchone() == None:
        connection.close()
        return json.dumps( {"success": False, "message": "No such user."})

    messages = []
    for row in cursor.execute("SELECT contents FROM messages WHERE recipient_id=(SELECT id FROM users WHERE email=? ) ORDER BY sent_date ASC" , (email, ) ):
        messages.append(row[0])
    connection.close()
    return json.dumps({"success": True, "message": "User data retrieved.", "data": messages})



def post_message(token, message, email):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    user_id = get_user_id(cursor,token)
    cursor.execute("SELECT * FROM users WHERE id=?",(user_id,))

    if cursor.fetchone() == None:
        connection.close()
        return json.dumps( {"success": False, "message": "You are not signed in."})
        

    try:
        sender_id = user_id;
        cursor.execute("SELECT id from users WHERE email=? " , (email,))
        recipient_id = cursor.fetchone()[0]
    except:
        connection.close()
        return json.dumps( {"success": False, "message": "No such user."})
        
    cursor.execute("INSERT INTO messages VALUES(NULL, ?, ?, ?, ?)", 
                   (sender_id,recipient_id,strftime("%Y-%m-%d %H:%M:%S", localtime()), message))
    connection.commit()
    connection.close()                
    return json.dumps({"success": True, "message": "Message posted"})            

def generate_token():
    return str(uuid.uuid4()).replace('-', '')
