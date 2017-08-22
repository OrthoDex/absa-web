from celery import Celery
import lib.get_comments as GC
import lib.absa as AB
import os
import socketio
from flask import json

celery = Celery('tasks', broker=os.environ.get("REDIS_URL"))

@celery.task
def run_analysis(video_id, room_id):
    mgr = socketio.KombuManager(os.environ.get('REDISCLOUD_URL'), write_only=True)

    youtube = GC.GetComments()

    print("Celery: Initialized YouTube retriever.")
    mgr.emit('comments', data=json.dumps({"message": "Initialized YouTube retriever."}), room=room_id)

    results = youtube.comments_list(part='snippet, replies', videoId=video_id, maxResults=100, fields='items')
    if results != "404":
        print("Celery: Retrieve YouTube Comments.")

        mgr.emit('comments', data=json.dumps({"message": "Retrieve YouTube Comments."}), room=room_id)
        mgr.emit('comments', data=json.dumps({"message": "Running Analysis. This will take some time.."}), room=room_id)

        data_values = AB.analyze(results)
        print("Celery: Analysis Complete")

        mgr.emit('comments', data=json.dumps({"message": "Analysis Complete"}), room=room_id)
        mgr.emit('comments', data=json.dumps(data_values), room=room_id)

    else:
        print("Http 404!")
        mgr.emit('comments', data=json.dumps({"error": "An error has ocurred. It could be that the video does not exist. Please try again later."}), room=room_id)
