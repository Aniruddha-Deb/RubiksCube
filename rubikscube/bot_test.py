import config, bot
import threading, asyncio
import multiprocessing

erno = bot.ErnoBot(evt_queue=None, prefix="q")
BOT_TOKEN = "ODcxOTk1NDkyMDUyMTE1NTE3.YQjbFg.E09GBEu2_NX0_cecLA8scl9fV80"

def bot_start():
    bot_process = multiprocessing.Process(target=erno.run, args=(BOT_TOKEN,), daemon=True)
    bot_process.start()

if __name__ == "__main__":
    bot_start()
    print("Started bot")