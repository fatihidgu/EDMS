const express = require('express')
const router = express.Router()
const User = require('../models/RegisteredUser')
const Mainprocess = require('../models/MainProcess')

router.get('/', (req, res) => {
    res.redirect('/workflows/allworkflows')
})

router.get('/mainprocess', (req, res) => {
    Mainprocess.find({ deleteDate: null }).lean().then(mainprocesses => {
        res.render('site/mainprocess',{mainprocesses:mainprocesses})
    })

   
})
router.post('/mainprocess', (req, res) => {

    const mainname = req.body.workprocess
    const mainno = req.body.workprocessno
    if(typeof mainname === 'object'){
        for (let index = 0; index < mainname.length; index++) {
            Mainprocess.create({
                mainProcessName: mainname[index], 
                mainProcessNo: mainno[index]
            })
    }
    }else{
        Mainprocess.create({
            mainProcessName: mainname, 
            mainProcessNo: mainno
        })
    }



   return res.redirect('mainprocess')
})

router.get('/roles', (req, res) => {
    console.log(res.locals.userid)
    if (res.locals.userid && !res.locals.isblocked && res.locals.admin) {
        User.find().lean().then(us => {
            // console.log(us)

            res.render('site/roles', { user: us })
        })

    }
    else {
        res.redirect('/registeredusers/login')
    }
})

router.get('/ornek', (req, res) => {
    User.find().lean().then(us => {
        res.send(({ user: us }))
    })
})

router.post('/roles', (req, res) => {
    User.findOneAndUpdate({ email: req.body.email }, { ...req.body }).then(us => {
        //console.log("Denedik bakak",us)
    })



    res.redirect('/roles')
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