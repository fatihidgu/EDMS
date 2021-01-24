const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')
const Admin = require('../models/Administrator')
const Organiser = require('../models/Organiser')
const Manager = require('../models/Manager')
const mainProcess = require('../models/MainProcess')
const sharedWorkflow = require('../models/SharedWorkflows')
const file = require('../models/File')
const change = require('../models/Change')
const reject = require('../models/Reject')

router.get('/allworkflows', async (req, res) => {

    if (res.locals.userid) {
        //console.log(req.session)
        // manager ıd organıser ıd ve admın ıd
        // const file = await File.findById(fileId).exec();
        // const workflow = await Workflow.findById(file.workflowId).exec();
        // const mainProcess = await MainProcess.findById(workflow.mainProcessId).exec();
        // const workUnit = await WorkUnit.findById(file.workUnitId).exec();
        //const file_type = await WorkflowFileType.findById(file.workflowFileTypeId).exec();
        const workflows = await Workflow.find({ deleteDate: null }).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }]).lean().exec();
        //console.log(workflows[0].creatorId.registeredUserId)
        const oldworkflows = await Workflow.find(({ deleteDate: { $exists: true, $ne: null } })).lean().exec();

        const admin = await Admin.findOne(({ registeredUserId: res.locals.userid })).lean().exec();
        const organiser = await Organiser.findOne(({ registeredUserId: res.locals.userid })).lean().exec();
        const manager = await Manager.findOne(({ registeredUserId: res.locals.userid })).lean().exec();

        return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows })
        if (admin || organiser || manager) {
            //const adminworkflows = await Workflow.find({ creatorId: admin._id, deleteDate: null }).lean().exec();
            //acada: admin.acad,
            //adminworkflows: adminworkflows,
        }
        else {
            //console.log("admin yok")
            return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows })
        }
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
        await sharedWorkflow.findOneAndUpdate({ workflowId: req.body.workflowid,deleteDate:null }).exec() // for
        //{ deleteDate: Date.now() }
        //fıle
       const filed = await file.findOneAndUpdate({ workflowId: req.body.workflowid }, { deleteDate: Date.now() }).exec() // for
        //change
       const change1= await change.findOneAndUpdate({ fileNo: filed.fileNo }, { deleteDate: Date.now() }).exec() // ?
        //reject
        await reject.findOneAndUpdate({ changeId:change1._id}, { deleteDate: Date.now() }).exec() // ?
       console.log(filed)
        res.redirect('/')

    } else {
        res.redirect('/')
    }

})

module.exports = router