from flask_socketio import Namespace, emit
from flask import request
import json
from rubikscube.model import Team

class BotNamespace(Namespace):

    def __init__(self, app, prefix):
        super().__init__(prefix)
        self.app = app

    def on_connect(self):
        print("Bot Connected")
        self.app.bot_sid = request.sid
        emit('num_teams', self.app.num_teams)

    def on_reg_teams(self, data):
        """
        Team data is in JSON: [
        {
            tno: 1,
            members: [ "discord_id_1", "discord_id_2", ...]
        },
        {
            ...
        }]
        """
        self.app.quiz.bot_teams_initialized = True
        teams = json.loads(data)
        print(data)
        for team in teams:
            self.app.quiz.add_team(Team(team['tno'], team['members']))

    def on_pounce(self, data):
        """
        data json format: {
            tno: #,
            discord_id: <id>,
            pounce: <pounce text>
        }
        """
        print("Pounce by ", data)
        pounce = json.loads(data)
        self.app.quiz.get_team(pounce['tno']).register_pounce(pounce['pounce'])
        if self.app.frontend_sid:
            emit('pounce', pounce['tno'], namespace='/frontend', to=self.app.frontend_sid)

    def on_pounce_opened(self, data):
        if self.app.frontend_sid:
            emit('pounce_opened', namespace='/frontend', to=self.app.frontend_sid)

    def on_pounce_closed(self, data):
        if self.app.frontend_sid:
            emit('pounce_closed', namespace='/frontend', to=self.app.frontend_sid)

    def on_disconnect(self):
        print("Bot Disconnected")

class FrontendNamespace(Namespace):

    def __init__(self, app, prefix):
        super().__init__(prefix)
        self.app = app

    def on_connect(self):
        print("Frontend Connected")
        self.app.frontend_sid = request.sid
        emit('num_teams', self.app.num_teams)

    def on_pounce_open(self):
        self.app.quiz.pounce_open = True
        for team in self.app.quiz.teams:
            self.app.quiz.teams[team].curr_pounce = ""
            self.app.quiz.teams[team].pounced = False
            self.app.quiz.teams[team].bounce = False
        if self.app.bot_sid and self.app.bot_teams_initialized:
            emit('pounce_open', "", namespace='/bot', to=self.app.bot_sid)
        elif not self.app.bot_sid:
            emit('pounce_opened', "ERROR: Bot has not connected", namespace='/frontend')
        elif not self.app.bot_teams_initialized:
            emit('pounce_opened', "ERROR: Bot has not initialized teams", namespace='/frontend')

    def on_pounce_close(self):
        self.app.quiz.pounce_open = False
        if self.app.bot_sid and self.app.bot_teams_initialized:
            emit('pounce_open', "", namespace='/bot', to=self.app.bot_sid)
        elif not self.app.bot_sid:
            emit('pounce_opened', "ERROR: Bot has not connected", namespace='/frontend')
        elif not self.app.bot_teams_initialized:
            emit('pounce_opened', "ERROR: Bot has not initialized teams", namespace='/frontend')

    def on_score(self, data):
        """
        {
            tno: 1,
            curr_score: 10,
            new_score: 20,
            score_delta: 10
        }
        """
        score_data = json.loads(data)
        team = self.app.quiz.get_team(score_data['tno'])
        if score_data['curr_score'] == team.curr_score:
            team.scores.append(score_data['new_score'])
            team.new_score = score_data['new_score']
        else:
            print("CRITICAL: scores do not match")

    def on_get_question(self, data):
        """
        incoming request: just qcode
        return data format: {
            qcode: <qcode>,
            question: <question>,
            answer: <answer>
        }
        """
        question = self.app.quiz.get_question(data)
        if question is None:
            emit('question', "ERROR: Question with given key does not exist", namespace='/frontend')
        else:
            response = {
                'qcode': question.code,
                'question': question.question,
                'answer': question.answer,
                'attempted': question.attempted
            }
            emit('question', json.dumps(response), namespace='/frontend')

    def on_disconnect(self):
        print("Frontend Disconnected")