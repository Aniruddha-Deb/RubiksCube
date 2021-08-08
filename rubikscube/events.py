from flask_socketio import Namespace, emit
from flask import request
import json

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
            members: [
                {name: 'Name', discord_id: 'Discord ID'}, ...
            ]
        },
        {
            ...
        }]
        """
        teams = json.loads(data)
        for team in teams:
            self.app.add_team(Team(team['tno'], team['members']))

    def on_pounce(self, data):
        """
        data json format: {
            tno: #,
            discord_id: <id>,
            pounce: <pounce text>
        }
        """
        print("Pounce by ", data)
        self.app.quiz.teams[data['tno']].register_pounce(data)
        emit('pounce', data['tno'], namespace='/frontend', to=self.app.frontend_sid)

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
        # TODO implement
        pass

    def on_pounce_close(self):
        # TODO implement
        pass

    def on_score_pounce(self):
        # TODO implement
        pass

    def on_score_bounce(self):
        # TODO implement
        pass

    # Should this be a HTTP request rather than something on WebSocket?
    # Arguments for the HTTP req are that it's more naturally framed as a get 
    # request, whereas I'll need to write a blueprint and do all that stuff when
    # the socket is already established, which is just extra work
    def on_get_question(self, data):
        """
        data format: {
            qcode: <qcode>
        }
        """
        emit('question', json.dumps(self.app.quiz.get_question(data['qcode'])), namespace='/frontend')

    def on_disconnect(self):
        print("Frontend Disconnected")