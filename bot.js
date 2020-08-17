const { Client } = require('discord.js')
const debug = require('debug')('neptunebot:bot')

const settings = require('./settings.json')
const commandModule = require('./modules/command')

debug('init bot client')
const client = new Client()

client.once('ready', () => {
  debug('bot is ready')
  commandModule.init(client)
})

client.on('message', (msg) => {
  if (msg.author.bot || !msg.content) return
  if (msg.content.startsWith(settings.prefix || '!')) {
    // Commands
    commandModule.run(msg, client)
  } else {
    // Chatting Point
  }
})

module.exports = client
