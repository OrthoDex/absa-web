from flask import Flask, render_template, request
import os
import lib
import socketio

app = Flask(__name__, static_url_path='', static_folder='public', template_folder='public')
app.config['STATIC_FOLDER'] = 'public'

on_heroku = os.environ.get('ON_HEROKU')

if on_heroku == "True":
    mgr = socketio.KombuManager(os.environ.get('REDISCLOUD_URL'))
else:
    mgr = socketio.KombuManager('redis://localhost:6379/12')

@app.after_request
def after_request(response):
    if app.debug:
        print("Debug mode.")
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    else:
        return response


sio = socketio.Server(client_manager=mgr, async_mode='threading')
app.wsgi_app = socketio.Middleware(sio, app.wsgi_app)

@sio.on('connect')
def connect(sid, environ):
    print('connect ', sid)

@sio.on('disconnect')
def disconnect(sid):
    print('disconnect ', sid)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    print('Video ID:' + request.form["video_id"])
    if not request.form["video_id"]:
        return "error", 400
    else:
        print('room id: ' + request.form["uid"])
        lib.tasks.run_analysis.delay(request.form["video_id"], request.form["uid"])
        return "ok", 200

if __name__ == '__main__':
    if on_heroku == "True":
        print("Main Application: Running on production.")
        port = int(os.environ.get('PORT'))
        host = '0.0.0.0'
    else:
        app.debug = True
        port = 5000
        host = '127.0.0.1'
    app.run(threaded=True, host=host, port=port)
