const express = require('express')
const router = express.Router()


router.get('/', (req, res) => {
    res.render('site/index')
})
router.get('/onchangefiles', (req, res) => {
    res.render('site/onchange')
})



module.exports = router