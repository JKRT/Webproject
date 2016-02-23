from flask import Flask
UPLOAD_FOLDER = "twiddler/static/media"
app = Flask(__name__, static_url_path='')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
import twiddler.server
