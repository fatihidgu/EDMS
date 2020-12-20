const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')
const WorkflowFile = require('../models/File')


router.post('/addworkflow', (req, res) => {
    const { create } = req.body
    Workflow.create({ 
       ...req.body, 
        creatorid: req.session.userId }, (error) => {
        return res.render('site/onchange', { create: create })
    }
    )
})

 router.get('/:id', (req, res) => {
    if (req.session.userId) {
        WorkflowFile.find({ deleteDate: null }).lean().then(wff => {
            Workflow.findById(req.params.id).lean().then(workf => {
                return res.render('site/onchange', { wff: wff,workf: workf })
         })
         
            
        })
    } else {
        res.redirect('/registeredusers/login')
    }

 })


module.exports = router