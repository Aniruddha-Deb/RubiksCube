from flask_socketio import Namespace, emit
from flask import request
import logging

class BotNamespace(Namespace):

    def __init__(self, app, prefix):
        super().__init__(prefix)
        self.app = app

    def on_connect(self):
        print("Bot Connected")
        self.app.bot_sid = request.sid

    def on_disconnect(self):
        print("Bot Disconnected")

    def on_pounce(self, data):
        print("Pounce by ", data)
        emit('pounce', data, namespace='/frontend', to=self.app.frontend_sid)

class FrontendNamespace(Namespace):

    def __init__(self, app, prefix):
        super().__init__(prefix)
        self.app = app

    def on_connect(self):
        print("Frontend Connected")
        self.app.frontend_sid = request.sid

    def on_disconnect(self):
        print("Frontend Disconnected")