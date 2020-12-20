const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')

router.get('/allworkflows', (req, res) => {
    ////console.log(req.session.userId)
    if (req.session.userId) {
        //console.log(req.session)
        Workflow.find({ deletedate: null }).lean().then(workflows => {
            //console.log(workflows.acad)
            Workflow.find({ creatorid: req.session.userId, deletedate: null }).lean().then(myworkflows => {
                Workflow.find(({ deletedate: { $exists: true, $ne: null } })).lean().then(oldworkflows => {
                    return res.render('site/workflows', { workflows: workflows, myworkflows: myworkflows, oldworkflows: oldworkflows })
                })
            })
        })
    }
    else {
        res.redirect('/registeredusers/register')
    }

})

module.exports = router