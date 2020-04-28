const express = require('express')
const router = express.Router()

const discordAuth = require('./discordAuth')
const settings = require('../settings.json')

// Remove register OAuth flag
// when the user gets out of register page
// (GET request only)
//
// First, Backup the value and delete from session
router.get('*', (req, _res, next) => {
  console.log(req.session)
  req.registerStep = req.session.registerStep
  req.regDiscordOAuth = req.session.regDiscordOAuth
  req.regDiscordOAuthData = req.session.regDiscordOAuthData

  delete req.session.registerStep
  delete req.session.regDiscordOAuth
  delete req.session.regDiscordOAuthData
  next()
})
// If the requested page matches to the registration flow, restore it
router.get(['/register',
  '/register/discord',
  '/login/discord/callback'], (req, _res, next) => {
  console.log('rest')
  req.session.registerStep = req.registerStep || 1
  req.session.regDiscordOAuth = req.regDiscordOAuth
  req.session.regDiscordOAuthData = req.regDiscordOAuthData
  next()
})

// Main Page
router.get('/', (req, res) => {
  res.render('index', { id: req.session.userID })
})

// Dedicated Login Page
router.get('/login', (req, res) => {
  // Redirect when logged in
  if (req.session.userID) res.redirect('/')
  else res.render('login')
})

// Register Page
router.get('/register', (req, res) => {
  // Redirect when logged in
  if (req.session.userID) { res.redirect('/'); return }

  res.render('register', {
    step: req.session.registerStep,
    tos: 'ToS goes here',
    privacy: 'Privacy Policy goes here',
    discordAuth: req.session.regDiscordOAuthData
  })
})

router.post('/register', (req, res) => {
  if (req.session.userID) { res.redirect('/'); return }
  switch (req.session.registerStep) {
    case 1:
      if (req.body.privacy !== 'on' || req.body.tos !== 'on') {
        res.redirect('./register')
        return
      }
      req.session.registerStep++
      break
    case 2:
      if (req.session.regDiscordOAuthData == null || typeof req.session.regDiscordOAuthData !== 'object') {
        req.session.regDiscordOAuthData = null
        break
      } else {
        req.session.registerStep = 3
      }
      break
    default:
      res.redirect('./register')
      return
  }
  res.render('register', {
    step: req.session.registerStep || 1,
    tos: '',
    privacy: '',
    discordAuth: req.session.regDiscordOAuthData
  })
})

// Redirect to Discord OAuth2 (Login) (Currently unused)
router.get('/login/discord', (req, res) => {
  res.redirect(discordAuth.loginURL(settings.auth))
})

// When called back from Discord
router.get('/login/discord/callback', async (req, res) => {
  const code = req.query.code || ''
  if (code.length < 1) {
    if (req.session.regDiscordOAuth) {
      req.session.regDiscordOAuthData = null
      res.redirect('/register')
    } else res.redirect('/')
    return
  }

  discordAuth.authorize(settings.auth, code).then((d) => {
    // Check if this callback was made in registration
    if (req.session.regDiscordOAuth) {
      // Duplication check
      if (req.dataMgr.discord[d.userData.id]) {
        req.session.regDiscordOAuthData = false
        res.redirect('/register')
      } else {
        req.session.regDiscordOAuthData = d.userData
        res.redirect('/register')
      }
    } else {
      // TODO WIP
      if (!req.authData[d.userData.id]) req.authData[d.userData.id] = d.userData
      req.session.userID = d.userData.id

      // Logged in. Redirect to Main Page.
      // TODO redirect_url support
      res.redirect('/')
    }
  }).catch((err) => {
    console.error(err)
    if (!settings.development) res.sendStatus(400)
    else res.status(400).send('<pre>' + err.stack + '</pre>')
  })
})

// Redirect to Discord OAuth2 (Register)
router.get('/register/discord', (req, res) => {
  console.log(req.session)
  if (req.session.registerStep === 2) {
    req.session.regDiscordOAuth = true
    res.redirect(discordAuth.loginURL(settings.auth))
  } else res.redirect('/')
})

// Old code support
router.all((_req, _res, next) => { next() })

module.exports = router
