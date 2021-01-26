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
const WorkUnit = require('../models/WorkUnit')
const Administrator = require('../models/Administrator')

router.get('/allworkflows', async (req, res) => {

    if (res.locals.userid) {
        //console.log(req.session)
        // manager ıd organıser ıd ve admın ıd
        // const file = await File.findById(fileId).exec();
        // const workflow = await Workflow.findById(file.workflowId).exec();
        // const mainProcess = await MainProcess.findById(workflow.mainProcessId).exec();
        // const workUnit = await WorkUnit.findById(file.workUnitId).exec();
        //const file_type = await WorkflowFileType.findById(file.workflowFileTypeId).exec();
        //console.log(workflows[0].creatorId.registeredUserId)
        const workflows = await Workflow.find({ deleteDate: null }).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
            , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }, { path: 'managerId', model: Manager }]).lean().exec();
        const oldworkflows = await Workflow.find(({ deleteDate: { $exists: true, $ne: null } })).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
            , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }]).lean().exec();
        const wunits = await WorkUnit.find().lean().exec();

        const adminid = await Administrator.find({ registeredUserId: res.locals.userid, endDate: null })
        const orgid = await Organiser.find({ registeredUserId: res.locals.userid, endDate: null }).lean().exec();
        const managerid = await Manager.find({ registeredUserId: res.locals.userid, endDate: null }).lean().exec();

        if (adminid.length != 0 && orgid.length != 0 && managerid.length != 0) {

            const myworkflows = await Workflow.find(({ $and: [{ deleteDate: null }, { $or: [{ creatorId: adminid._id }, { organiserId1: orgid._id }, { organiserId: orgid._id }, { organiserId2: orgid._id }, { managerId: managerid._id }] }] })).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
                , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }, { path: 'managerId', model: Manager }]).lean().exec();//
            return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows, wunits: wunits, myworkflows: myworkflows })
        }
        else if (orgid.length != 0 && managerid.length != 0) {
            const myworkflows = await Workflow.find(({ $and: [{ deleteDate: null }, { $or: [{ organiserId1: orgid._id }, { organiserId: orgid._id }, { organiserId2: orgid._id }, { managerId: managerid._id }] }] })).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
                , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }, { path: 'managerId', model: Manager }]).lean().exec();//
            return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows, wunits: wunits, myworkflows: myworkflows })

        }
        else if (adminid.length != 0 && managerid.length != 0) {

            const myworkflows = await Workflow.find(({ $and: [{ deleteDate: null }, { $or: [{ creatorId: adminid._id }, { managerId: managerid._id }] }] })).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
                , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }, { path: 'managerId', model: Manager }]).lean().exec();//
            return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows, wunits: wunits, myworkflows: myworkflows })
        }
        else if (adminid.length != 0 && orgid.length != 0) {
            const myworkflows = await Workflow.find(({ $and: [{ deleteDate: null }, { $or: [{ creatorId: adminid._id }, { organiserId1: orgid._id }, { organiserId: orgid._id }, { organiserId2: orgid._id }] }] })).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
                , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }, { path: 'managerId', model: Manager }]).lean().exec();//
            return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows, wunits: wunits, myworkflows: myworkflows })
        }
        else if (adminid.length != 0) {
            const myworkflows = await Workflow.find(({ $and: [{ deleteDate: null }, { $or: [{ creatorId: adminid._id }] }] })).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
                , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }, { path: 'managerId', model: Manager }]).lean().exec();//
            return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows, wunits: wunits, myworkflows: myworkflows })

        }
        else if (orgid.length != 0) {
            const myworkflows = await Workflow.find(({ $and: [{ deleteDate: null }, { $or: [{ organiserId1: orgid._id }, { organiserId: orgid._id }, { organiserId2: orgid._id }] }] })).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
                , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }, { path: 'managerId', model: Manager }]).lean().exec();//
            return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows, wunits: wunits, myworkflows: myworkflows })
        }
        else if (managerid.length != 0) {

            const myworkflows = await Workflow.find(({ $and: [{ deleteDate: null }, { $or: [{ managerId: managerid._id }] }] })).populate([{ path: 'creatorId', model: Admin }, { path: 'organiserId', model: Organiser }, { path: 'mainProcessId', model: mainProcess }
                , { path: 'organiserId1', model: Organiser }, { path: 'organiserId2', model: Organiser }, { path: 'managerId', model: Manager }]).lean().exec();//
            return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows, wunits: wunits, myworkflows: myworkflows })
        }
        else {


            return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows, wunits: wunits })
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

module.exports = router
