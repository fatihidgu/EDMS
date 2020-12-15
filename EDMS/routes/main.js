const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')
const exphbs=require('express-handlebars');
const app = express();

router.get('/', (req, res) => {
    //console.log(req.session.userId)
    if(req.session.userId){
    console.log(req.session)
Workflow.find({deletedate:null}).lean().then(workflows => {
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
    res.render('site/onchange')
})
router.get('/editworkunit', (req, res) => {
    res.render('site/editworkunits')
})

module.exports = router