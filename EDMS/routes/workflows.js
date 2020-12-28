const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')
const Admin = require('../models/Administrator')

router.get('/allworkflows', (req, res) => {
    
    if (res.locals.userid) {
        //console.log(req.session)
        Workflow.find({ deletedate: null }).lean().then(workflows => {
            //console.log(workflows.acad)
            Workflow.find({ creatorId: req.session.userId, deletedate: null }).lean().then(myworkflows => {
                Workflow.find(({ deletedate: { $exists: true, $ne: null } })).lean().then(oldworkflows => {
                    Admin.findOne(({ registeredUserId: res.locals.userid })).lean().then(admin => {
                        return res.render('site/workflows', { workflows: workflows, myworkflows: myworkflows, oldworkflows: oldworkflows, acada:admin.acad, adminId:admin._id })
                    })
                  
                })
            })
        })
    }
    else {
        res.redirect('/registeredusers/register')
    }

})

module.exports = router