const express = require('express')
const router = express.Router()



router.get('/', (req, res) => {
    res.redirect('/workflows/allworkflows')
})

module.exports = router