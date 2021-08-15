from os import environ
from flask import Flask, session
from rubikscube import config, model
import threading, queue, asyncio

class RubiksApp(Flask):

    def __init__(self, name, config_obj, *args, **kwargs):
        super().__init__(name, *args, **kwargs)

        self.num_teams = config_obj.NUM_TEAMS
        self.question_file = config_obj.QUESTION_FILE

        self.bot_sid = None
        self.frontend_sid = None

        self.quiz = model.Quiz(self.num_teams, self.question_file)