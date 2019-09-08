from celery import Celery
import lib.get_comments as GC
import lib.absa as AB
import os
import eventlet
eventlet.monkey_patch()
import socketio
from flask import json

on_heroku = os.environ.get('ON_HEROKU')

if on_heroku == 'True':
    SOCKET_IO_BROKER = os.environ.get('REDISCLOUD_URL')
    CELERY_BROKER = os.environ.get("REDIS_URL")
else:
    SOCKET_IO_BROKER = 'redis://localhost:6379/12'
    CELERY_BROKER = 'redis://localhost:6379/10'

celery = Celery('tasks', broker=CELERY_BROKER)

@celery.task(serializer='json', bind=True, default_retry_delay=5, max_retries=5)
def run_analysis(self, video_id, room_id):
    mgr = socketio.KombuManager(SOCKET_IO_BROKER, write_only=True)
    #
    # mgr.emit('results', data=json.dumps({"message": "Initialized YouTube retriever."}), room=room_id)
    # mgr.emit('results', data=json.dumps({"message": "Retrieved YouTube Comments."}), room=room_id)
    # mgr.emit('results', data=json.dumps({"message": "Running Analysis. This will take some time.."}), room=room_id)
    # mgr.emit('results', data=json.dumps({"message": "Analysis Complete"}), room=room_id)
    #
    # with open('./lib/data.json') as data_file:
    #     data_values = json.load(data_file)
    #
    # mgr.emit('results', data=json.dumps(data_values), room=room_id)

    try:
        youtube = GC.GetComments()

        print("Celery: Initialized YouTube retriever.")
        mgr.emit('results', data=json.dumps({"message": "Initialized YouTube retriever."}), room=room_id)

        results = youtube.comments_list(part='snippet, replies', videoId=video_id, maxResults=100, fields='items')

        print("Celery: Retrieved YouTube Comments.")

        mgr.emit('results', data=json.dumps({"message": "Retrieve YouTube Comments."}), room=room_id)
        mgr.emit('results', data=json.dumps({"message": "Running Analysis. This will take some time.."}), room=room_id)

        data_values = AB.analyze(results)
        print("Celery: Analysis Complete")

        mgr.emit('results', data=json.dumps({"message": "Analysis Complete"}), room=room_id)
        mgr.emit('results', data=json.dumps(data_values), room=room_id)

    except Exception as e:
        print("Celery Error ocurred!", e)
        mgr.emit('results', data=json.dumps({"error": "An error has ocurred. Restarting analysis."}), room=room_id)
        self.retry()
