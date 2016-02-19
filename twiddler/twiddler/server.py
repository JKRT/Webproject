from flask import *
from twiddler import app

import json
import database_helper

    #active users should contain the websocket and the email adress or something like that
active_users = dict()
@app.route('/example')
def example():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        while True:
            message = ws.receive()
            ws.send(message)
        return                

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
            email = message["email"] ; token = message["token"]
            print "Attempting to validate user with the given token..."
            query = json.loads(database_helper.get_user_data_by_token(token))
            print "Active users are: '" + json.dumps(active_users.keys()) + "'."

            if not query["success"]:
                ws.close()
                print "Query failed. Oops?"
                return json.dumps({"success": False,
                       "message": "Initial query failed!"})

            #Decide what to do from the message
            if email in active_users:
                print "Closing all active sockets of user..."
                #Ta bort alla hans tokens fy fan.
                database_helper.sign_out_all(email,token)
                active_users[email].close()
                active_users[email] = ws
                print "User has now the current socket session!"
            elif email not in active_users:
                print "No active sockets... Nice!"
                active_users[email] = ws
                print "User has now the current socket session!"
            print "Active users are: '" + json.dumps(active_users.keys()) + "'."
    except:
        print "Some shit happend yo, tis bad"
        ws.send("406: Shit happens yo")
        ws.close()
        return json.dumps({"success": False,
               "message": "Something went very wrong..."})
    print "Seems we got out of the loop? Wat?"
    return json.dumps({"success": True,
           "message": "Successfully linked socket with user! Yay!"})

@app.route('/', methods=['GET'])
def index():
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
def sign_out(token = None):
    token = request.form['token'] 
    if token == None: 
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.sign_out(token)


@app.route('/change_password' , methods=['POST'])
def change_password(token = None, old_password=None ,new_password=None):
    old_password = request.form['oldPassword']
    new_password = request.form['newPassword']
    token = request.form['token']
    
    #Initial handling before talking to the database.
    if old_password == None or new_password == None or token == None:
        return json.dumps({"success": False, "message": "You are not logged in."})
    else:
        return database_helper.change_password(token,old_password, new_password)

@app.route('/get_user_data_by_token' , methods=['GET'])
def get_user_data_by_token(token = None):
    token = request.args.get('token', '');
    if token == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_data_by_token(token)

@app.route('/get_user_data_by_email', methods=['GET'])
def get_user_data_by_email(token = None , email = None):
    token = request.args.get('token', '');
    email = request.args.get('email', '');

    if token == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_data_by_email(token, email)


@app.route('/get_user_messages_by_token' , methods=['POST'])
def get_user_messages_by_token(token = None): 
    token = request.form['token']

    if token == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_messages_by_token(token)

@app.route('/get_user_messages_by_email' , methods=['GET'])
def get_user_messages_by_email(token = None, email = None): 
    token = request.args.get('token', '');
    email = request.args.get('email', '');

    if token == None or email == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_messages_by_email(token, email)

@app.route('/post_message',methods = ['POST'])
def post_message(token = None,message = None ,email = None): 
    token = request.form['token']
    message = request.form['message']
    email = request.form['email']
    # print token + ':' + message + ':' + email
    if token == None or message == None or email == None:  
        return json.dumps({"success": False, "message": "You are not signed in."})
    else:
        return database_helper.post_message(token, message, email)

if __name__ == '__main__':
    #app.run(debug=True)
    pass
