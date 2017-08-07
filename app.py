from flask import Flask, render_template, request
import os
from submit_form import SimpleForm
from tasks import run_analysis
import socketio

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ["SECRET_KEY"]

mgr = socketio.KombuManager('redis://localhost:6379/12')
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
    form = SimpleForm()
    return render_template('index.html', form=form)

@app.route('/analyze', methods=['POST'])
def analyze():
    print('Video ID:' + request.form["video_id"])
    if not request.form["video_id"]:
        return "error", 400
    else:
        print('room id: ' + request.form["uid"])
        run_analysis.delay(request.form["video_id"], request.form["uid"])
        return "ok", 200

if __name__ == '__main__':
    app.run(threaded=True)
