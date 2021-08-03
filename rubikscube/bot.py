import re
import time

import discord
from discord.ext import commands
from discord.utils import find, get

ROLE_QM = "Quizmaster"

TEAM_TEXTS = "Team Text Channels"
TEAM_VCS = "Team Voice Channels"

TEAM_PREFIX = "Team "

class ErnoBot(commands.Bot):

    def __init__(self, evt_queue, prefix):
        intents = discord.Intents.default()
        intents.members = True
        super().__init__(command_prefix=prefix, intents=intents)
        self.event_queue = evt_queue
        self.add_cog(TeamCog(self))
        self.add_cog(PounceCog(self))

    async def on_ready(self):
        print("Discord bot is now ready")

class Team:
    
    def __init__(self, team_name, role):
        self.score = 0
        self.name = team_name
        self.role = role
        self.members = []
        self.pounce = ""
        self.text_channel = None
        self.voice_channel = None
    
    def __str__(self):
        return f"{self.name} @ {self.score}: {self.members}"

class TeamCog(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        self.teams = {}
        self.rt = -1;

    @commands.command(name="tc", help="Load teams into memory")
    @commands.has_any_role(ROLE_QM)
    async def team_load(self, ctx, n: int):
        print("Loading teams")
        guild = ctx.guild
        team_range = range(1,n+1)
        roles = [role for role in guild.roles if role.name.startswith(TEAM_PREFIX) and
                int(role.name.split(" ")[1]) in team_range]
        
        print(roles)
        print(self.rt)
        if self.rt == -1:
            # have not created any teams. Need to create teams
            print("Creating teams")
            for role in roles:
                team = Team(role.name, role)
                tno = int(role.name.split(" ")[1])
                print(f"{role.name}: {tno}")
                self.teams[role.name] = team
                team.text_channel = get(guild.text_channels, name=f"team-{tno}")
                team.voice_channel = get(guild.voice_channels, name=f"team-{tno}")

        self.rt = time.time()
        members = await guild.fetch_members().flatten()

        for team in self.teams:
            self.teams[team].members.clear()

        for member in members:
            for role in member.roles:
                if role in roles:
                    self.teams[role.name].members.append(member)
                    break

        for team in self.teams:
            print(self.teams[team])

    @commands.command(name="ts", help="Scores teams")
    @commands.has_any_role(ROLE_QM)
    async def score(self, ctx, score: int, *teams: int):
        for team in teams:
            tname = TEAM_PREFIX+str(team)
            self.teams[tname].score += score
            curr_score = self.teams[tname].score
            await self.teams[tname].text_channel.send(f"You got {score} points for that question. Current score: {curr_score}")

    @commands.command(name="td", help="Specifies direct to which team")
    @commands.has_any_role(ROLE_QM)
    async def direct_to(self, ctx, team: int):
        for key in self.teams:
            await self.teams[key].text_channel.send(f"Next question direct to team {team}")
        
    @commands.command(name="tl", help="Shows score leaderboard")
    @commands.has_any_role(ROLE_QM)
    async def leaderboard(self, ctx):
        scores = ""
        for team in self.teams:
            scores += f"{self.teams[team].name}: {self.teams[team].score}\n"
        for team in self.teams:
            await self.teams[team].text_channel.send(scores)

class PounceCog(commands.Cog):
    
    def __init__(self, bot):
        self.bot = bot
        self.teams = self.bot.get_cog("TeamCog").teams
        self.pounce_open = False

    @commands.command(name="p", help="pounce on active question")
    async def pounce(self, ctx, *, arg):
        p_eligible = False
        team_name = None
        for role in ctx.author.roles:
            if role.name.startswith(TEAM_PREFIX):
                p_eligible = True
                team_name = role.name
        
        if self.pounce_open and p_eligible:
            self.teams[team_name].pounce = arg
            await ctx.send(f"Team {team_name}: Your pounce has been registered")
        elif p_eligible and not self.pounce_open:
            await ctx.send("Could not register pounce: window closed or no question active")

    @commands.command(name="pc", help="Closes pounce")
    @commands.has_any_role(ROLE_QM)
    async def pounce_close(self, ctx):
        if self.pounce_open:
            self.pounce_open = False
            pounces = ""
            for team in self.teams:
                pounces += f"{self.teams[team].name}: {self.teams[team].pounce}\n"
                await self.teams[team].text_channel.send("Pounce is now closed")
            
            await ctx.send("Closed pounce")
            # fingers crossed the QM does it from his own channel, otherwise 
            # everyone will get to see everyone else's pounces :/
            await ctx.send(pounces)
        else:
            await ctx.send("Could not close pounce, a pounce window might not be open")

    
    @commands.command(name="po", help="Opens pounce")
    @commands.has_any_role(ROLE_QM)
    async def pounce_open(self, ctx):
        if not self.pounce_open:
            self.pounce_open = True
            for team in self.teams:
                await self.teams[team].text_channel.send("Pounce is now open!")
                self.teams[team].pounce = ""
            await ctx.send("Opened pounce")
        else:
            await ctx.send("Could not open pounce, pounce window might already be open")

