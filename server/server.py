from flask import *

import json
import database_helper

app = Flask(__name__)

@app.route('/sign_in', methods=['POST'])
def sign_in(username = None , password = None):
    username = request.form['email1'] 
    password = request.form['password1'] 
    if username == None or password == None: 
        return json.dumps({"success": False, "message": "Wrong username or password."})
    return database_helper.sign_in(username, password)


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

@app.route('/get_user_data_by_token' , methods=['POST'])
def get_user_data_by_token(token = None):
    token = request.form['token']
    if token == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_data_by_token(token)

@app.route('/get_user_data_by_email', methods=['POST'])
def get_user_data_by_email(token = None , email = None):
    token = request.form['token']
    email = request.form['email']

    if token == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_data_by_email(token, email)


@app.route('/get_user_messages_by_token' , methods=['POST'])
def get_user_messages_by_token(token = None): 
    token = request.form['token']

    if token == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_messages_by_token(token)

@app.route('/get_user_messages_by_email' , methods=['POST'])
def get_user_messages_by_email(token = None, email = None): 
    token = request.form['token']
    email = request.form['email']

    if token == None or email == None:
        return json.dumps({"success": False, "message": "You are not signed in."})
    return database_helper.get_user_messages_by_email(token, email)

@app.route('/post_message',methods = ['POST'])
def post_message(token = None,message = None ,email = None): 
    token = request.form['token']
    message = request.form['message']
    email = request.form['email']

    if token == None or message == None or email == None:  
        return json.dumps({"success": False, "message": "You are not signed in."})

if __name__ == '__main__':
    app.run(debug=True)
