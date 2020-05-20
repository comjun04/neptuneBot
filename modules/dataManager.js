const fs = require('fs')
const path = require('path')

const a = require('../data/accounts.json')
const d = require('../data/discord.json')
const g = require('../data/google.json')
const accounts = a.length > 0 ? new Map(a) : new Map()
const discord = d.length > 0 ? new Map(d) : new Map()
const google = g.length > 0 ? new Map(g) : new Map()

function startAutosave () {
  setInterval(() => {
    fs.writeFileSync(path.join(path.resolve(), 'data', 'accounts.json'), JSON.stringify(Array.from(accounts)))
    fs.writeFileSync(path.join(path.resolve(), 'data', 'discord.json'), JSON.stringify(Array.from(discord)))
    fs.writeFileSync(path.join(path.resolve(), 'data', 'google.json'), JSON.stringify(Array.from(google)))
    console.log('All Data saved')
  }, 60000)
}

module.exports = {
  startAutosave,
  accounts,
  discord,
  google
}
