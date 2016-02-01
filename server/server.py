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


if __name__ == '__main__':
    app.run(debug=True)
