const express = require('express')
const router = express.Router()

const { sha256 } = require('js-sha256')
const Flake = require('flake-idgen')

const discordAuth = require('./discordAuth')
const settings = require('../settings.json')

const specialChars = [' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '9', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~']

// Remove register OAuth flag
// when the user gets out of register page
// (GET request only)
//
// First, Backup the value and delete from session
router.get('*', (req, _res, next) => {
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
  '/register/checkuser',
  '/login/discord/callback'], (req, _res, next) => {
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
  else res.render('login', { failed: false })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body

  const udata = Array.from(req.dataMgr.accounts).find((d) => d[1].username === username)
  if(udata && udata[1].password === sha256(password)) {
    req.session.userID = udata[0]
    res.redirect('/')
  } else res.render('login', { failed: true })
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

router.post('/register', async (req, res) => {
  if (req.session.userID) { res.redirect('/'); return }
  switch (req.session.registerStep) {
    case 1:
      if (req.body.privacy !== 'on' || req.body.tos !== 'on') {
        res.redirect('./register')
        return
      }
      req.session.registerStep = 2
      break
    case 2:
      if (req.session.regDiscordOAuthData == null || typeof req.session.regDiscordOAuthData !== 'object') {
        req.session.regDiscordOAuthData = null
        break
      } else {
        req.session.registerStep = 3
      }
      break
    case 3: {
      // Actual Registration
      const username = req.body.uname
      const password = req.body.password

      if (req.dataMgr.accounts.has(username)) break
      let ur = true
      username.split('').forEach(function (c) {
        if (!/[a-zA-Z0-9_-]/.test(c)) ur = false
      })
      if (!ur) break

      if (password.length < 8) break
      let cap = false; let low = false; let num = false; let ch = false; let other = false
      password.split('').forEach(function (c) {
        if (!/^[0-9A-Za-z]$/.test(c) && !specialChars.includes(c)) other = true
        else if (/^[0-9]$/.test(c)) num = true
        else if (/^[a-z]$/.test(c)) low = true
        else if (/^[A-Z]$/.test(c)) cap = true
        else if (specialChars.includes(c)) ch = true
      })
      if (other || !cap || !low || !num || !ch) break

      console.log('ok')
      // Account Register Process
      const flake = new Flake({
        epoch: 1546300800000, // 2019/1/1 0:0:0 UTC
        datacenter: 0, // 0: User ID
        worker: 0 // 0: Generated when signup normally
      })

      const getFlake = async () => {
        return new Promise((resolve, reject) => {
          flake.next((err, id) => {
            if (err) reject(err)
            else resolve(parseInt('0x' + id.toString('hex')))
          })
        })
      }

      const id = await getFlake()
      const hashpw = sha256(password)
      req.dataMgr.accounts.set(id, {
        username,
        password: hashpw,
        OAuth: { discord: req.session.regDiscordOAuthData.id }
      })
      req.dataMgr.discord.set(req.session.regDiscordOAuthData.id, req.session.regDiscordOAuthData)

      console.log('[Account Registration] id: ' + id + ' / username: ' + username)
      req.session.registerStep = 4
      break
    }
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
      if (req.dataMgr.discord.has(d.userData.id)) {
        req.session.regDiscordOAuthData = false
        res.redirect('/register')
      } else {
        req.session.regDiscordOAuthData = d.userData
        res.redirect('/register')
      }
    } else {
      // TODO WIP
      /*
      if (!req.authData[d.userData.id]) req.authData[d.userData.id] = d.userData
      req.session.userID = d.userData.id

      // Logged in. Redirect to Main Page.
      // TODO redirect_url support
      res.redirect('/')
      */
      res.send('REGISTER OAUTH FAIL')
    }
  }).catch((err) => {
    console.error(err)
    if (!settings.development) res.sendStatus(400)
    else res.status(400).send('<pre>' + err.stack + '</pre>')
  })
})

// Redirect to Discord OAuth2 (Register)
router.get('/register/discord', (req, res) => {
  if (req.session.registerStep === 2) {
    req.session.regDiscordOAuth = true
    res.redirect(discordAuth.loginURL(settings.auth))
  } else res.redirect('/')
})

router.get('/register/checkuser', (req, res) => {
  if (req.dataMgr.accounts.has(req.query.name)) res.send('Exist')
  else res.send('Not Exist')
})

// Old code support
router.all((_req, _res, next) => { next() })

module.exports = router
