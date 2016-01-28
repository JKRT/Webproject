from flask import *
import uuid
import json

app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello World! hello'

@app.route('/user/<username>')
def show_user_profile(username):
    # show the user profile for that user
    return 'User %s' % username

@app.errorhandler(404)
def page_not_found(error):
    return render_template('Det smoeg sig visst in ett litet fel sorry kompis'), 404

@app.route('/get', methods=['POST', 'GET'])
def get_niklas():
    if request.method == "GET":
        return "Hej kompis"


@app.route('/login', methods=['POST'])
def sign_in():
    if valid_login(request.form['email1'],
                   request.form['password1']):
        return json.dumps({"success": True,
                           "message": "Successfully signed in.",
                           "data": generate_token()})
    else:
        return json.dumps({"success": False,
                           "message": "Wrong username or password."})


def valid_login(email, password):
    return True


def generate_token():
    return str(uuid.uuid4()).replace('-', '')


if __name__ == '__main__':
    app.run(debug=True)