const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')
const WorkflowFile = require('../models/File')
const exphbs=require('express-handlebars');
const app = express();

router.get('/', (req, res) => {
    //console.log(req.session.userId)
    if(req.session.userId){
    console.log(req.session)
Workflow.find({deletedate:null}).lean().then(workflows => {
    console.log(workflows.acad)
    Workflow.find({creatorid:1,deletedate:null}).lean().then(myworkflows=>{
        Workflow.find(({deletedate:{ $exists: true, $ne: null }})).lean().then(oldworkflows => {
           return res.render('site/index', {workflows:workflows,myworkflows:myworkflows,oldworkflows:oldworkflows})
        })
    })
})
}
else{
    res.redirect('/registeredusers/register')
}

})

router.get('/onchangefiles', (req, res) => {
    if(req.session.userId){
        WorkflowFile.find({deleteDate:null}).lean().then(wff => {
            console.log(wff[0].fileNo)
                   return res.render('site/onchange',{wff:wff})
                })
        
    
}
else{
    res.redirect('/registeredusers/login')
}
})
router.get('/editworkunit', (req, res) => {
    if(req.session.userId){
    res.render('site/editworkunits')
    }
    else{
        res.redirect('/registeredusers/login')
    }
})

module.exports = router