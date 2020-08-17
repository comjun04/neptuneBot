const express = require('express')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const cors = require('cors')

const router = require('./modules/router')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'page')

app.use(cors())
app.use('/src', express.static('src'))

app.use(session({
  name: 'teaddy-session',
  resave: false,
  saveUninitialized: false,
  secret: 'keyboard cat', // TODO load from settings.json
  store: new MemoryStore({
    checkPeriod: 1000 * 3600 // 1 hour
  })
}))

app.use(router)

// Old login page
/*
app.get('/oldlogin', async (req, res) => {
  let key = req.query.key ? req.query.key.split(';') : []
  let discordData = {}
  try {
    discordData = await discordOAuth.getUser(key[0])
  } catch (err) {
    key = []
  }
  res.render('oldlogin', { key, authUrl, authData, discordData })
})

app.get('/solve', (_req, res) => res.send({ items: ['discord', 'google'] }))
app.get('/solve/:item', (req, res) => {
  const { item } = req.params
  let code = req.query.code || ''

  code = code.split(';')

  if (code[0].length <= 0) res.redirect('/oldlogin')
  else {
    switch (item) {
      case 'discord':
        authCheck.discord(settings.auth, code, discordOAuth).then((returnData) => {
          authData[returnData.token] = { discord: returnData.userData, verified: false }
          res.redirect('/oldlogin?key=' + returnData.token)
        }).catch((err) => {
          console.error(err)
          res.sendStatus(500)
        })
        break

      case 'google':
        if (code.length !== 2) res.redirect('/oldlogin')
        if (!Object.keys(authData).includes(code[0])) res.redirect('/login')
        else {
          authCheck.google(code[1]).then((data) => {
            if (!data) res.sendStatus(401)
            else {
              authData[code[0]].google = data.body
              authData[code[0]].verified = false
              res.redirect('/oldlogin?key=' + code[0] + ';' + code[1])
            }
          }).catch(() => { res.sendStatus(401) })
        }
        break
      case 'submit':
        if (code.length !== 2) res.sendStatus(400)
        else if (!(authData[code[0]] && authData[code[0]].discord && authData[code[0]].google)) res.sendStatus(401)
        else {
          authData[code[0]].verified = true
          bot.channels.get(settings.channelId)
            .send('<@' + authData[code[0]].discord.id + '>님의 인증이 완료되었습니다.')
          res.redirect(settings.inviteUrl)
        }
        break
    }
  }
})
*/

module.exports = app
