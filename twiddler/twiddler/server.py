from flask import *
from twiddler import app
from werkzeug import secure_filename

import os
import json
import uuid
import database_helper


#active users should contain the websocket and the email adress
active_users = dict()
def bound_email(socket):
    for k, v in active_users.items():
        if v is socket: 
            return k;
    return None

@app.route('/websocket')
def websocket():
    print "Client request received."
    print "Attempting to bind WebSocket..."
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        print "Socket bound between client and server!"
    else:
        return json.dumps({"success": False,
               "message": "Failed to bind socket!"})
    try:
        while True:
            print "Waiting..."
            message = ws.receive()
            if message == None:
                print "Client closed socket?"
                email = bound_email(ws)
                if email != None:
                    del active_users[email]
                return
            print "Message received with contents '" + message + "'."

            message = json.loads(message)
            token = message["token"] ; email = ""
            refresh = False;
            #If this is the case the user has a token and we can just refresh the socket.
            if len(message) == 1:
                email = json.loads(database_helper.get_user_data_by_token(token))["data"]["email"]
                refresh = True
            elif len(message) == 2:
                email = message["email"]
            else:
                #The case when we recieve a message without contents. 
                print "Keeping the conncetion alive"
                ws.send("Keeping the dream alive")
                ws.close()
                return json.dumps({"success": True,
                                   "message": "Socket is kept alive"})


            print "Attempting to validate user with the given token..."
            query = json.loads(database_helper.get_user_data_by_token(token))

            if not query["success"]:
                ws.close()
                print "Query failed. Oops?"
                return json.dumps({"success": False,
                       "message": "Initial query failed!"})
            if refresh:
                print "Refresh requested"
                active_users[email] = ws
            #Decide what to do from the message, autologout process
            elif email in active_users:
                print "Closing all active sockets of user..."
                #Ta bort alla hans tokens fy fan.
                database_helper.sign_out_all(email,token)
                active_users[email].send("close")
                active_users[email] = ws
                print "User has now the current socket session!"
            elif email not in active_users:
                print "No active sockets Nice!"
                active_users[email] = ws
                print "User has now the current socket session!"
            print "Active users are: '" + json.dumps(active_users.keys()) + "'."
    except Exception,e:
        print e
        ws.send("406: Shit happens yo")
        ws.close()
        return json.dumps({"success": False,
               "message": "Something went very wrong..."})

    print "Seems we got out of the loop? Wat?"
    return json.dumps({"success": True,
           "message": "Successfully linked socket with user! Yay!"})

@app.route('/media_socket')
def media_socket():
    print "Client request recieved @media_socket"
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        print "media_socket bound between client and server!"
    else:
        return json.dumps({"success": False,
                           "message": "Failed to bind socket!"})
    while True:
        print "Waiting..."
        print "Preparing to send data to the server"
        token = "" 
        message = ws.receive()
        message = json.loads(message)
        if message == None:
            print "Recieved empty message"
        else:
            print message
            token = message["token"]
        #Check to see what update should be sent back to the client
        if message["message"] == "post":
            print "Return post data from the database"
        elif message["message"] == "signup":
            print "Fetching signup related data"
            data = database_helper.get_gender_statistics(token)
            print data
            ws.send(data)
        elif message["message"] == "post":
            print "Fetching post related statistics"
            data = database_helper.get_post_statistics(token)
            print data
            ws.send(data);

    return json.dumps({"success": True,
                       "message": "Socket closing down!"})

@app.route('/', methods=['GET'])
def index():
    return app.send_static_file('client.html')

@app.route('/Welcome', methods=['GET'])
def welcome():
    return app.send_static_file('client.html')

@app.route('/Browse', methods=['GET'])
def browse():
    return app.send_static_file('client.html')

@app.route('/Home', methods=['GET'])
def home():
    return app.send_static_file('client.html')

@app.route('/Account', methods=['GET'])
def account():
    return app.send_static_file('client.html')

@app.route('/sign_in', methods=['POST'])
def sign_in(username = None , password = None):
    username = request.form['email'] 
    password = request.form['password'] 
    if username == None or password == None: 
        return json.dumps({"success": False, "message": "Wrong username or password."})
    return database_helper.sign_in(username, password)

@app.route('/sign_up', methods = ['POST'])
def sign_up( email = None, password = None, first_name = None , 
             family_name = None, gender = None, city = None ,country = None ):

    input_dict = { "email": request.form['email'] , "password": request.form['password'],
                   "first_name": request.form['first_name'] , "family_name": request.form['family_name'] ,
                   "gender": request.form['gender'] , "country": request.form['country'] ,
                   "city": request.form['city']}

    for key,value in input_dict.items():
        if  input_dict[key] is None or input_dict[key] == "":
            return json.dumps({"success": False, "message": "Form data missing or incorrect type."})

    return database_helper.sign_up(input_dict["email"],input_dict["password"] , input_dict["first_name"] 
                                   , input_dict["family_name"] , input_dict["gender"] 
                                   , input_dict["city"] , input_dict["country"])

@app.route('/sign_out', methods=['POST'])
def sign_out(email = None, hmac = None, salt = None):
    email = request.form['email'] # Note, token is not required.
    hmac = request.form['hmac'] ; salt = request.form['salt']
    token = database_helper.valid_token(email, hmac, salt)
    if token == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.sign_out(token)


@app.route('/change_password' , methods=['POST'])
def change_password(old_password=None, new_password=None, email=None, hmac=None, salt=None):
    old_password = request.form['oldPassword']
    new_password = request.form['newPassword']
    email = request.form['email'] # Note, token is not required.
    hmac = request.form['hmac'] ; salt = request.form['salt']
    token = database_helper.valid_token(email, hmac, salt)

    #Initial handling before talking to the database.
    if old_password == None or new_password == None or token == None:
        return json.dumps({"success": False, "message": "You are not logged in."})
    else:
        return database_helper.change_password(token,old_password, new_password)

@app.route('/get_user_data_by_token' , methods=['GET'])
def get_user_data_by_token(email = None, hmac = None, salt = None):
    email = request.args.get('email', '') # Note, token is not required.
    hmac = request.args.get('hmac', '') ; salt = request.args.get('salt', '')
    token = database_helper.valid_token(email, hmac, salt)

    if token == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_data_by_token(token)

@app.route('/get_user_data_by_email', methods=['GET'])
def get_user_data_by_email(email = None, semail = None, hmac = None, salt = None):
    email = request.args.get('email', '');
    semail = request.args.get('semail', '') # Note, token is not required.
    hmac = request.args.get('hmac', '') ; salt = request.args.get('salt', '')
    token = database_helper.valid_token(semail, hmac, salt)

    if token == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_data_by_email(token, email)


@app.route('/get_user_messages_by_token' , methods=['GET'])
def get_user_messages_by_token(email = None, hmac = None, salt = None):
    email = request.args.get('email', '') # Note, token is not required.
    hmac = request.args.get('hmac', '') ; salt = request.args.get('salt', '')
    token = database_helper.valid_token(email, hmac, salt)

    if token == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_messages_by_token(token)

@app.route('/get_user_messages_by_email' , methods=['GET'])
def get_user_messages_by_email(email = None, semail = None, hmac = None, salt = None):
    email = request.args.get('email', '');
    semail = request.args.get('semail', '') # Note, token is not required.
    hmac = request.args.get('hmac', '') ; salt = request.args.get('salt', '')
    token = database_helper.valid_token(semail, hmac, salt)

    if token == None or email == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_messages_by_email(token, email)

ALLOWED_EXTENSIONS = ["png", "jpg", "ogg", "mp4"]

def valid_media(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in set(ALLOWED_EXTENSIONS)

@app.route('/post_message',methods = ['POST'])
def post_message(message = None, media = None, email = None, semail = None, hmac = None, salt = None):
    message = request.form['message']
    media = request.files.get('media')
    email = request.form['email']

    semail = request.form['semail'] # Note, token is not required.
    hmac = request.form['hmac'] ; salt = request.form['salt']
    token = database_helper.valid_token(semail, hmac, salt)

    if media != None:
        if valid_media(media.filename):
            salt = str(uuid.uuid4())
            filename = secure_filename(media.filename)
            media.save(os.path.join(app.config['UPLOAD_FOLDER'], salt + "_" +  filename))
            information = "Media '{}' uploaded to server by '{}' in folder '{}'."
            print information.format(media.filename, email, app.config['UPLOAD_FOLDER'])
            print "Effective path is: '{}/{}'".format(app.config['UPLOAD_FOLDER'], salt + "_" + filename)
            filename = salt + "_" + filename
            try:
                media_tag = ""
                media_path = "media/" + filename
                if filename[-3:] in ALLOWED_EXTENSIONS[:2]:
                    media_tag = "<img src='" + media_path + "' width=290>"
                elif filename[-3:] in ALLOWED_EXTENSIONS[-2:]:
                    mp4_source = "<source src='" + media_path + "' type='video/mp4'>"
                    ogg_source = "<source src='" + media_path + "' type='video/ogg'>"
                    media_tag = "<video width=290 controls>" + mp4_source + ogg_source + "</video>"
                message = media_tag + message + "<br>"
            except:
                pass
        else: 
            return json.dumps({"success": False, "message": "Media not supported."})
            # Maybe check credentials first? Do this in the database_helper or not? Hmmmmmmmm.
            # File name is generated with a uuid4 salt: UUID4_FILE.EXT.

    if token == None or message == None or email == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    else: 
        return database_helper.post_message(token, message, email)

if __name__ == '__main__':
    #app.run(debug=True)
    pass
