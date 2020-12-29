const express = require('express')
const router = express.Router()
const Mainprocess = require('../models/MainProcess')
const Workunit = require('../models/WorkUnit')

router.get('/addmainprocess', (req, res) => {
    Workunit.find({ endDate: null }).lean().then(workunits => {
        Mainprocess.find({ deleteDate: null }).lean().then(mainprocesses => {
            return res.render('site/mainprocess', { mainprocesses: mainprocesses, workunits: workunits })
        })
    })
})

router.post('/addmainprocess', (req, res) => {

    const mainname = req.body.workprocess
    const mainno = req.body.workprocessno
    const mainwid = req.body.workunitid

    if (typeof mainname === 'object') {
        for (let index = 0; index < mainname.length; index++) {
            const mainnamestr = JSON.stringify(mainname[index]);
            if (mainnamestr.charAt(1) == " " || mainname[index] == "" || mainno[index] == "") {
                //console.log('olusturulamaz',mainnamestr)
            }
            else {
                Mainprocess.create({
                    mainProcessName: mainname[index],
                    mainProcessNo: mainno[index],
                    workUnitId: mainwid[index]
                })
            }

        }
        return res.redirect('/mainprocess/addmainprocess')
    } else {
        if (mainname == null || mainname.charAt(0) == ' ' || mainname == '' || mainno == "") {
            //console.log('olusturulamaz')
        }
        else {
            Mainprocess.create({
                mainProcessName: mainname,
                mainProcessNo: mainno,
                workUnitId: mainwid
            })
        }
        return res.redirect('/mainprocess/addmainprocess')
    }

})

module.exports = router