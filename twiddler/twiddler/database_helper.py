7#Function to access and control the database , used by server to access the database

import sqlite3
import json
import uuid
import hashlib
from time import localtime, strftime

class Database:
    def __init__(self):
        self.connection = sqlite3.connect("twiddler/database.db")
        self.cursor = self.connection.cursor()

    def __enter__(self):
        return self.cursor

    def __exit__(self, exc_type, exc_value, traceback):
        self.connection.commit()
        self.connection.close()

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
    with Database() as cursor:
        cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, generate_hash(password)))
        if cursor.fetchone() != None:
            token = generate_token()
            cursor.execute("INSERT INTO tokens VALUES(?, (SELECT id FROM users WHERE email=?))", (token, email))
            return  json.dumps({"success": True,
                                "message": "Successfully signed in.",
                                "data": token})
        else:
            return json.dumps({"success": False,
                               "message": "Wrong username or password."})

def sign_up(email, password, first_name, family_name, gender, city, country): 
    with Database() as cursor:
        cursor.execute("SELECT * FROM users WHERE email=?", (email,))
        if cursor.fetchone() != None:
            return  json.dumps({"success": False, "message": "User already exists."})
        cursor.execute("INSERT INTO users VALUES(NULL, ?, ?, ?, ?, ?, ?, ?)",
                           (first_name, family_name, email, city, country, generate_hash(password), gender))
        return  json.dumps({"success": True,  "message": "Ha en bra dag kompis!"})

def sign_out(token):
    with Database() as cursor:
        cursor.execute("SELECT * FROM tokens WHERE id=?", (token,))
        if cursor.fetchone() != None:
            cursor.execute("DELETE FROM tokens WHERE id=?", (token,))
            return  json.dumps({"success": True, "message": "Successfully signed out."})
        else:
            return  json.dumps({"success": False, "message": "You are not signed in."})

def change_password(token,old_password,new_password):
    with Database() as cursor:
        cursor.execute("SELECT * FROM tokens WHERE id=?", (token,))
        if cursor.fetchone() == None:
            return json.dumps({"success": False, "message": "You are not logged in."})
        else:
            user_id = get_user_id(cursor, token)
            cursor.execute("SELECT * FROM users WHERE id=? AND password=?", (user_id, generate_hash(old_password)))
            if cursor.fetchone() != None:
                cursor.execute("UPDATE users SET password=? WHERE id=?", (generate_hash(new_password), user_id))
                return json.dumps( {"success": True, "message": "Password changed."} )
            else:
                return json.dumps({"success": False, "message": "Wrong password."})
    
def get_user_data_by_token(token):
    with Database() as cursor:
        user_id = get_user_id(cursor,token)
        cursor.execute("SELECT first_name,family_name,email,city,country,gender FROM users WHERE id=?", (user_id,))
        cursorObject = cursor.fetchone()
        
        if cursorObject == None:
            return json.dumps( {"success": False, "message": "You are not signed in."})
        else:
             match = {"firstname": cursorObject[0] , "familyname":cursorObject[1] , "email": cursorObject[2]
                      , "city": cursorObject[3] , "country": cursorObject[4] , "gender": cursorObject[5]}   
             return json.dumps({"success": True, "message": "User data retrieved.", "data": match})

def get_user_data_by_email(token,email):
    with Database() as cursor:
        user_id = get_user_id(cursor,token)
        cursor.execute("SELECT * FROM users WHERE id=?",(user_id,))
        if cursor.fetchone() == None:
            return json.dumps( {"success": False, "message": "You are not signed in."})

        cursor.execute("SELECT first_name,family_name,email,city,country,gender FROM users WHERE email=?",(email,))
        cursorObject = cursor.fetchone()

        if cursorObject  == None:
            return json.dumps( {"success": False, "message": "No such user."})
        else:
            match = {"firstname": cursorObject[0] , "familyname":cursorObject[1] , "email": cursorObject[2] 
                 , "city": cursorObject[3] , "country": cursorObject[4] , "gender": cursorObject[5]} 
            return json.dumps({"success": True, "message": "User data retrieved.", "data": match})

def get_user_messages_by_token(token):
    with Database() as cursor:
        user_id = get_user_id(cursor,token)
        cursor.execute("SELECT * FROM users WHERE id=?",(user_id,))
        if cursor.fetchone() == None:
            return json.dumps({"success": False, "message": "You are not logged in."})

        messages = []
        for row in cursor.execute("SELECT sender_id, contents FROM messages WHERE recipient_id=? ORDER BY sent_date ASC"
                                  ,(user_id, )):
            sender_email = cursor.execute("SELECT email FROM users WHERE id=?", (row[0],)).fetchone()
            messages.append({"writer": sender_email[0], "content": row[1]})
        return json.dumps({"success": True, "message": "User data retrieved.", "data": messages})

def get_user_messages_by_email(token,email):
    with Database() as cursor:
        user_id = get_user_id(cursor,token)
        recipient_id = None
        try:
            cursor.execute("SELECT id from users WHERE email=? " , (email,))
            recipient_id = cursor.fetchone()[0]
        except:
            print "Exception caught"
            return json.dumps( {"success": False, "message": "No such user."})
        
        cursor.execute("SELECT * FROM users WHERE id=?",(user_id,))
        if cursor.fetchone() == None:
            return json.dumps( {"success": False, "message": "You are not signed in."})
        cursor.execute("SELECT first_name FROM users WHERE email=?",(email,))
        
        if cursor.fetchone() == None:
            return json.dumps( {"success": False, "message": "No such user."})
            
        messages = []
        message_cursor = cursor.execute("SELECT users.email, messages.contents FROM messages INNER JOIN users ON users.id=messages.sender_id AND messages.recipient_id=? ORDER BY messages.sent_date DESC", 
                                            (recipient_id,)).fetchall()
        for row in message_cursor:
            messages.append({"writer": row[0], "content": row[1]})
        return json.dumps({"success": True, "message": "User data retrieved.", "data": messages})     

def post_message(token, message, email):
    with Database() as cursor:
        user_id = get_user_id(cursor,token)
        cursor.execute("SELECT * FROM users WHERE id=?",(user_id,))
        if cursor.fetchone() == None:
            return json.dumps( {"success": False, "message": "You are not signed in."})
        try:
            sender_id = user_id;
            cursor.execute("SELECT id from users WHERE email=? " , (email,))
            recipient_id = cursor.fetchone()[0]
        except:
            return json.dumps( {"success": False, "message": "No such user."})

        cursor.execute("INSERT INTO messages VALUES(NULL, ?, ?, ?, ?)", 
                       (sender_id,recipient_id,strftime("%Y-%m-%d %H:%M:%S", localtime()), message))
        return json.dumps({"success": True, "message": "Message posted"}) 

# def sign_out_all(email, token):
#     with Database() as cursor:
#         cursor.execute("SELECT * FROM tokens WHERE id=?", (token,))
#         if cursor.fetchone() == None: return json.dumps( {"success": False, "message": "No such user."}
#         cursor.execute("SELECT id from users WHERE email=? " , (email,))
#         if cursor.fetchone() == None: return json.dumps( {"success": False, "message": "No such user."}

#         cursor.execute("DELETE FROM tokens WHERE NOT id=?", (token,))
#         return  json.dumps({"success": True, "message": "Successfully signed out."})

def generate_token():
    return str(uuid.uuid4()).replace('-', '')
