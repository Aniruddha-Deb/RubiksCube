from os import environ
from flask import Flask, session
from rubikscube import api, config, bot
import threading, queue, asyncio

class RubiksApp(Flask):

    def __init__(self, name, *args, **kwargs):
        super().__init__(name, *args, **kwargs)

        self.event_queue = queue.Queue()

    def create_bot(self, bot_token, prefix):
        self.bot = bot.ErnoBot(evt_queue=self.event_queue, prefix=prefix)
        self.bot_token = bot_token

    def run_bot(self):
        self.bot.run(self.bot_token)
