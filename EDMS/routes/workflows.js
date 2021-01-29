const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')
const Admin = require('../models/Administrator')
const Organiser = require('../models/Organiser')
const Manager = require('../models/Manager')
const mainProcess = require('../models/MainProcess')
const MainProcess = require('../models/MainProcess')
const sharedWorkflow = require('../models/SharedWorkflows')
const file = require('../models/File')
const File = require('../models/File')
const change = require('../models/Change')
const reject = require('../models/Reject')
const WorkUnit = require('../models/WorkUnit')
const Administrator = require('../models/Administrator')

router.get('/allworkflows', async (req, res) => {

    if (res.locals.userid) {

        const workflows = await Workflow.find({ deleteDate: null }).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
            , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }, { path: 'managerId', model: Manager }]).lean().exec();
        const oldworkflows = await Workflow.find(({ deleteDate: { $exists: true, $ne: null } })).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
            , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }]).lean().exec();
        const wunits = await WorkUnit.find().lean().exec();

        return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows, wunits: wunits })

    }
    else {
        res.redirect('/registeredusers/register')
    }

})

router.post('/disable', async (req, res) => {
    if (res.locals.userid) {
        //workflow
        await Workflow.findOneAndUpdate({ _id: req.body.workflowid }, { deleteDate: Date.now() }).exec()
        //shared workflow
        await sharedWorkflow.updateMany({ workflowId: req.body.workflowid, deleteDate: null }, { deleteDate: Date.now() }).exec() // for
        //{ deleteDate: Date.now() }
        //fıle
        await file.updateMany({ workflowId: req.body.workflowid, deleteDate: null, approvalStatus: 4 }, { deleteDate: Date.now(), approvalStatus: 5 }).exec() // for

        await file.updateMany({ workflowId: req.body.workflowid, deleteDate: null }, { deleteDate: Date.now() }).exec() // for
        //change
        // const change1 = await change.findOneAndUpdate({ fileNo: filed.fileNo }, { deleteDate: Date.now() }).exec() // ?
        //reject
        // await reject.findOneAndUpdate({ changeId: change1._id }, { deleteDate: Date.now() }).exec() // ?
        // console.log(filed)
        res.redirect('/')

    } else {
        res.redirect('/')
    }

})


router.get('/treeview', async (req, res) => {
    if (res.locals.userid) {
  
      var workUnits = await WorkUnit.find({
        endDate: null
      }).lean().exec()
      var mainProcesses = await MainProcess.find({
        deleteDate: null
      }).lean().exec()
      var workflows = await Workflow.find({
        deleteDate: null
      }).lean().exec()
      var files = await File.find({
        deleteDate: null
      }).lean().exec()
      //var files = await File.find({endDate:null}).exec()
      var result = []
      var k = []
      var m = []
      var n = []
      workUnits.forEach(workUnit => {
        m = []
        var mainProc = mainProcesses.filter(x => x.workUnitId.toString() === workUnit._id.toString());
        if (mainProc == null) {
          m = [{
            mainProcess: null,
            workflows: []
          }]
        } else {
          mainProc.forEach(mp => {
            var workf = workflows.filter(x => x.mainProcessId.toString() === mp._id.toString());
  
            if (workf == null) {
              m.push({
                mainProcess: mp,
                workflows: []
              })
            } else {
              n = []
              workf.forEach(wf => {
                var fileFiltered =  files.filter(x => x.workflowId.toString() === wf._id.toString());
                if(fileFiltered == null){
                  n.push({workflow:wf.workprocessName,files:[]})
                }else{
                  n.push({workflow:wf.workprocessName,files:fileFiltered})
                }
  
              })
              m.push({
                mainProcess: mp.mainProcessName,
                workflows: n
              })
            }
          })
        }
        k.push({
          workUnit: workUnit.workUnitName,
          mainProcesses: m
        })
  
      })
      return res.render('site/treeview', {
        workUnits: k
      });
    } else {
      res.redirect('/registeredusers/register')
    }
  })

module.exports = router
