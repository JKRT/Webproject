#Function to access and control the database , used by server to access the database

import sqlite3
import json
import uuid
import hmac
import hashlib
import datetime
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

def valid_token(email, hmact, message):
    with Database() as cursor:
        cursor.execute("SELECT id from users WHERE email=?", (email,))
        user_id = cursor.fetchone()
        if user_id == None:
            return None
        user_id = user_id[0]

        candidate_tokens = cursor.execute("SELECT id FROM tokens WHERE user_id=?", (user_id,))
        for candidate_token in candidate_tokens:
            h = hmac.new(str(candidate_token[0]), str(message), hashlib.sha1)
            if str(hmact) == h.hexdigest(): 
                return str(candidate_token[0])
        return None

def get_user_id(cursor, token):
    cursor.execute("SELECT user_id FROM tokens WHERE id=?", (token,))
    try:
        uid =  cursor.fetchone()[0]
        return uid
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

def sign_out_all(email, token):
    with Database() as cursor:
        cursor.execute("SELECT * FROM tokens WHERE id=?", (token,))
        if cursor.fetchone() == None:
            return json.dumps( {"success": False, "message": "No such user."})
        cursor.execute("SELECT id from users WHERE email=?", (email,))
        if cursor.fetchone() == None:
            return json.dumps( {"success": False, "message": "No such user."})

        cursor.execute("DELETE FROM tokens WHERE tokens.id IN (SELECT tokens.id FROM tokens JOIN users ON tokens.user_id=users.id WHERE users.email=? AND NOT tokens.id=?)", (email,token))
        return  json.dumps({"success": True, "message": "Successfully signed out all."})

def generate_token():
    return str(uuid.uuid4()).replace('-', '')

def get_post_statistics(email):
    with Database() as cursor:
        print "get post statistics"
        user_id = ""
    
        try:
            cursor.execute("SELECT id FROM users WHERE email=?", (email,))
            user_id =  cursor.fetchone()[0]
            print "user_id " +  ":" + user_id
        except Exception as e:
            print type(e)
    
        data_cursor = ""
        post_per_day_data = []
        
        cursor.execute("SELECT * FROM users WHERE id=?",(user_id,))
        if cursor.fetchone() == None:
            return json.dumps( {"success": False, "message": "You are not signed in."})
       
        data = []
        for row in cursor.execute("SELECT sent_date FROM messages"):
            data.append(row);
        post_per_day_data = get_weekday_stats(data)
        print "post_per_day data:" + str(post_per_day_data)
        
        #Get post ratio data from the user
        post_ratio_data = []
        cursor.execute("SELECT COUNT(*) FROM messages where sender_id=?",(user_id,) )
        sent = cursor.fetchone()
        cursor.execute("SELECT COUNT(*) FROM messages where recipient_id=?",(user_id,) )
        recieved = cursor.fetchone()
        post_ratio_data.append(sent)
        post_ratio_data.append(recieved)
        print post_ratio_data
        total_data = {"postData": [post_ratio_data,post_per_day_data] }
        return json.dumps(total_data)


def get_gender_statistics():
    with Database() as cursor:
        cursor.execute("select COUNT(*) from users where gender='male'");
        males = cursor.fetchone()
        cursor.execute("select COUNT(*) from users where gender='hen'");
        hens = cursor.fetchone()
        cursor.execute("select COUNT(*) from users where gender='female'");
        females = cursor.fetchone()
        data = {"genderStatistics": [males[0],hens[0],females[0]] }
        
        return json.dumps(data)



#Converts date data into date statistics. 
def get_weekday_stats(data):
    print "get_weekday_stats"
    data_set = []
    #Type conversions
    for row in data:
        row = ''.join(row)
        data_set.append(row)

    for i in range(0, len(data_set)):
        data_set[i] = (data_set[i].split()[0])
        data_set[i] = data_set[i].split('-')
    
    for i in range(0,len(data_set)):
        data_set[i] = (datetime.datetime(int(data_set[i][0]), int(data_set[i][1]),int( data_set[i][2])).weekday())

    #Reset the counters
    weekdays = [0 , 0  , 0  , 0  , 0  ,  0  , 0 ]

    for row in data_set:
        if row == 0:
            weekdays[0] += 1
        elif row == 1:
            weekdays[1] += 1
        elif row == 2:
            weekdays[2] += 1
        elif row == 3:
            weekdays[3] += 1
        elif row == 4:
            weekdays[4] += 1
        elif row == 5:
            weekdays[5] += 1
        elif row == 6:
            weekdays[6] += 1
    
    return weekdays
