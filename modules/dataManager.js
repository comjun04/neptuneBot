const fs = require('fs')
const path = require('path')

const accounts = require('../data/accounts.json')
const discord = require('../data/discord.json')
const google = require('../data/google.json')

function startAutosave () {
  setInterval(() => {
    fs.writeFileSync(path.join(path.resolve(), 'data', 'accounts.json'), JSON.stringify(accounts))
    fs.writeFileSync(path.join(path.resolve(), 'data', 'discord.json'), JSON.stringify(discord))
    fs.writeFileSync(path.join(path.resolve(), 'data', 'google.json'), JSON.stringify(google))
  }, 60000)
}

module.exports = {
  startAutosave,
  accounts,
  discord,
  google
}
