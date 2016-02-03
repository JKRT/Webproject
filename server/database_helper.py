#Function to access and control the database , used by server to access the database

import sqlite3
import json
import uuid
from time import localtime, strftime

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


def change_password(token,old_password,new_password):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE token=?", (token,))

    if cursor.fetchone() == None:
        return json.dumps({"success": False, "message": "You are not logged in."})
        
    else:
        cursor.execute("SELECT password FROM users WHERE token=? AND password=?", (token,old_password))
        if cursor.fetchone() != None:
            cursor.execute("UPDATE users SET password=? WHERE token=?", (new_password,token))
            connection.commit()
            connection.close()
            return json.dumps( {"success": True, "message": "Password changed."} )
        else:
            connection.close()
            return json.dumps({"success": False, "message": "Wrong password."})


def get_user_data_by_token(token):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    cursor.execute("SELECT first_name,family_name,email,city,country,gender FROM users WHERE token=?", (token,))
    cursorObject = cursor.fetchone()
    
    if cursorObject  == None:
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
    cursor.execute("SELECT first_name FROM users WHERE token=?",(token,))
    
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
    cursor.execute("SELECT * FROM users WHERE token=?", (token,))
    if cursor.fetchone() == None:
        connection.close()
        return json.dumps({"success": False, "message": "You are not logged in."})

    messages = []
    for row in cursor.execute("SELECT contents FROM messages WHERE recipient_id=(SELECT id FROM users where token =? ) ORDER BY sent_date ASC" , (token, ) ):
        messages.append(row[0])
    connection.close()
    return json.dumps({"success": True, "message": "User data retrieved.", "data": messages})


def get_user_messages_by_email(token,email):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    cursor.execute("SELECT first_name FROM users WHERE token=?",(token,))
    
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
    cursor.execute("SELECT first_name FROM users WHERE token =? " , (token,))

    if cursor.fetchone() == None:
        connection.close()
        return json.dumps( {"success": False, "message": "You are not signed in."})
        

    try:
        cursor.execute("SELECT id FROM users WHERE token=? ", (token,))
        sender_id = cursor.fetchone()[0]
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
