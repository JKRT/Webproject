from twiddler import app
from gevent.wsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
http_server = WSGIServer(('', 7777), app ,handler_class=WebSocketHandler)
http_server.serve_forever()
