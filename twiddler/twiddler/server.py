from flask import *
from twiddler import app

import json
import database_helper

class AutoLogin:
    @app.route('/example')
    def example():
        print "Enter example"
        if request.environ.get('wsgi.websocket'):
            print "if 1"
            ws = request.environ['wsgi.websocket']
            print ws
            while True:
                message = ws.receive()
                print "while"
                ws.send(message)
                return


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
    print token + ':' + message + ':' + email
    if token == None or message == None or email == None:  
        return json.dumps({"success": False, "message": "You are not signed in."})
    else:
        return database_helper.post_message(token, message, email)

if __name__ == '__main__':
    #app.run(debug=True)
    pass
