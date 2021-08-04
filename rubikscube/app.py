from os import environ
from flask import Flask, session
from rubikscube import api, config
import threading, queue, asyncio

class RubiksApp(Flask):

    def __init__(self, name, *args, **kwargs):
        super().__init__(name, *args, **kwargs)

        self.event_queue = queue.Queue()