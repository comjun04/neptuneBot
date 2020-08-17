const { readFileSync, writeFileSync } = require('fs')
const path = require('path').resolve()
const https = require('https')
const express = require('express')
const debug = require('debug')('neptunebot')

// const pointModule = require('./modules/point')
const dataMgr = require('./modules/dataManager')
const settings = require(path + '/settings.json')
const authData = require(path + '/auth/authData.json')

debug('starting NeptuneBot')

debug('loading discord bot')
const bot = require('./bot')

debug('loading web server')
const web = require('./web')

if (!settings.features) settings.features = {}
if (settings.features.serverStatus == null) settings.features.serverStatus = true
if (settings.features.verifiedCheck == null) settings.features.verifiedCheck = true

bot.settings = settings

let ssl
if (!settings.development) ssl = { cert: readFileSync(path + '/auth/teaddy-cert.pem'), key: readFileSync(path + '/auth/teaddy-key.pem') }

dataMgr.startAutosave()

// Include data to req object
web.use((req, _res, next) => {
  req.dataMgr = dataMgr
  next()
})

let server
if (settings.development) server = web
else server = https.createServer(ssl, web)
server.listen(settings.port, () => {
  console.log('Neptune Bot is not running on http://localhost:' + settings.port)
})

bot.login(settings.token)
/*
  .then(() => {
    if (settings.features.verifiedCheck) {
      console.log('Verification Check Enabled.')
      setInterval(() => bot.guilds.get(settings.guildId).members.forEach((member) => {
        let verified = false
        Object.keys(authData).forEach((key) => {
          if (member.id === authData[key].discord.id && authData[key].verified) verified = true
        })

        if (verified && !member.roles.has(settings.roleId)) member.addRole(settings.roleId)
        if (!verified && member.roles.has(settings.roleId)) member.removeRole(settings.roleId)
      }), 1000)
    }

    if (settings.features.serverStatus) {
      console.log('Server Status display enabled.')
      setInterval(() => {
        let botCount = 0
        bot.guilds.get(settings.guildId).members.forEach((member) => { if (member.user.bot) botCount++ })
        bot.guilds.get(settings.guildId).channels.get(settings.statsChannel.all).setName('All: ' + bot.guilds.get(settings.guildId).members.size)
        bot.guilds.get(settings.guildId).channels.get(settings.statsChannel.humans).setName('Humans: ' + (bot.guilds.get(settings.guildId).members.size - botCount))
        bot.guilds.get(settings.guildId).channels.get(settings.statsChannel.bots).setName('Bots: ' + botCount)
      }, 1000)
    }
  })
  */

// TODO Delete
setInterval(() => { writeFileSync(path + '/auth/authData.json', JSON.stringify(authData)) }, 1000)
