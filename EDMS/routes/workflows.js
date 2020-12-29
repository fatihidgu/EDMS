const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')
const Admin = require('../models/Administrator')

router.get('/allworkflows', async (req, res) => {

    if (res.locals.userid) {
        //console.log(req.session)
        // const file = await File.findById(fileId).exec();
        // const workflow = await Workflow.findById(file.workflowId).exec();
        // const mainProcess = await MainProcess.findById(workflow.mainProcessId).exec();
        // const workUnit = await WorkUnit.findById(file.workUnitId).exec();
        //const file_type = await WorkflowFileType.findById(file.workflowFileTypeId).exec();
        const workflows = await Workflow.find({ deleteDate: null }).lean().exec();
        const oldworkflows = await Workflow.find(({ deleteDate: { $exists: true, $ne: null } })).lean().exec();
        const admin = await Admin.findOne(({ registeredUserId: res.locals.userid })).lean().exec();
        if (admin) {
            const adminworkflows = await Workflow.find({ creatorId: admin._id, deleteDate: null }).lean().exec();
            return res.render('site/workflows', { workflows: workflows, adminworkflows: adminworkflows, oldworkflows: oldworkflows, acada: admin.acad, adminId: admin._id })
        }
        else {
            console.log("admin yok")
        }
        return res.render('site/workflows', { workflows: workflows, oldworkflows: oldworkflows })

    }
    else {
        res.redirect('/registeredusers/register')
    }

})

module.exports = router