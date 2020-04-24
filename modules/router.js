const express = require('express')

const router = express.Router()

router.get('/', (_req, res) => {
  res.render('index')
})

// Old code support
router.all((_req, _res, next) => { next() })

module.exports = router
