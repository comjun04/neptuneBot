const express = require('express')
const router = express.Router()

const discordAuth = require('./discordAuth')
const settings = require('../settings.json')

// Main Page
router.get('/', (req, res) => {
  res.render('index', { user: req.session.user })
})

router.get('/login', (req, res) => {
  // Redirect when logged in
  if (req.session.user) res.redirect('/')
  else res.redirect('/login/discord')
})

// Redirect to Discord OAuth2 (Login)
router.get('/login/discord', (_, res) => {
  res.redirect(discordAuth.loginURL(settings.auth))
})

// When called back from Discord
router.get('/login/discord/callback', async (req, res) => {
  const code = req.query.code || ''
  if (code.length < 1) return res.sendStatus(400)

  discordAuth.authorize(settings.auth, code)
    .then((d) => {
      // TODO Login pass
      req.session.user = d
      res.redirect('/')
    }).catch((err) => {
      console.error(err)
      if (!settings.development) res.sendStatus(400)
      else res.status(400).send('<pre>' + err.stack + '</pre>')
    })
})

// Old code support
router.all((_req, _res, next) => { next() })

module.exports = router
