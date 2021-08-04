from flask_socketio import Namespace
import logging

logger = logging.getLogger('events')

class BotNamespace(Namespace):

    def on_connect(self):
        print("Bot Connected")
        logger.critical('Bot Connected')

    def on_disconnect(self):
        print("Bot Disconnected")

    def on_pounce(self, data):
        print("Pounce by ", data)

class FrontendNamespace(Namespace):

    def on_connect(self):
        print("Frontend Connected")

    def on_disconnect(self):
        print("Frontend Disconnected")