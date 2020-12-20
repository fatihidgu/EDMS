const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.redirect('/workflows/allworkflows')
    })

router.get('/editworkunit', (req, res) => {
    if (req.session.userId) {
        res.render('site/editworkunits')
    }
    else {
        res.redirect('/registeredusers/login')
    }
})




module.exports = router