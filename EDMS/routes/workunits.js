const express = require('express')
const router = express.Router()
const WorkUnit = require('../models/WorkUnit')
const RegisteredUser = require('../models/RegisteredUser')
const Organiser = require('../models/Organiser')
const Manager = require('../models/Manager')


router.get('/allworkunits', async (req, res) => {
  if (res.locals.userid) {

    const workUnitManager = await Manager.find({}).populate({
      path: 'workUnitId',
      select: 'workUnitCode workUnitName'
    }).populate({
      path: 'registeredUserId',
      select: 'email'
    }).exec();

    var workunits = []
    var oldworkunits = []
    var myworkunits = []

    workUnitManager.forEach(b => {
      if (b.endDate != null) {
        oldworkunits.push({
          workUnitId: b.workUnitId._id,
          workUnitName: b.workUnitId.workUnitName,
          workUnitCode: b.workUnitId.workUnitCode
        })
      } else {
        workunits.push({
          workUnitId: b.workUnitId._id,
          workUnitName: b.workUnitId.workUnitName,
          workUnitCode: b.workUnitId.workUnitCode,
          managerEmail: b.registeredUserId.email
        })

        if (b.registeredUserId._id == req.session.userId) {
          myworkunits.push({
            workUnitId: b.workUnitId._id,
            workUnitName: b.workUnitId.workUnitName,
            workUnitCode: b.workUnitId.workUnitCode,
            managerEmail: b.registeredUserId.email
          })
        }
      }

    });



    return res.render('site/workunits', {
      workunits: workunits,
      myworkunits: myworkunits,
      oldworkunits: oldworkunits
    })

  } else {
    res.redirect('/registeredusers/register')
  }

})

router.get('/treeview', async (req, res) => {
  if (res.locals.userid) {

    workflows1 = {
      name: "wf1",
      files: [{
        name: "a",
        id: 1
      }, {
        name: "b",
        id: 2
      }, {
        name: "c",
        id: 3
      }]
    }
    workflows2 = {
      name: "wf2",
      files: [{
        name: "aa",
        id: 1
      }, {
        name: "bb",
        id: 2
      }, {
        name: "cc",
        id: 3
      }]
    }
    workflows3 = {
      name: "wf3",
      files: [{
        name: "x",
        id: 1
      }, {
        name: "y",
        id: 2
      }, {
        name: "z",
        id: 3
      }]
    }
    workflows4 = {
      name: "wf4",
      files: [{
        name: "xx",
        id: 1
      }, {
        name: "yy",
        id: 2
      }, {
        name: "zz",
        id: 3
      }]
    }
    mainProcesses1 = {
      name: "Aprocess",
      workflows: [workflows1, workflows2]
    }
    mainProcesses2 = {
      name: "Bprocess",
      workflows: [workflows2, workflows4]
    }
    mainProcesses3 = {
      name: "Cprocess",
      workflows: [workflows3, workflows4]
    }
    workUnit1 = {
      name: "İK",
      mainProcesses: [mainProcesses1, mainProcesses2]
    }
    workUnit2 = {
      name: "REK",
      mainProcesses: [mainProcesses1, mainProcesses2]
    }
    workUnit3 = {
      name: "MF",
      mainProcesses: [mainProcesses3]
    }
    workUnits = [workUnit1, workUnit2, workUnit3]
    console.log(workUnits)


    return res.render('site/treeview', {
      workUnits: workUnits
    });
  } else {
    res.redirect('/registeredusers/register')
  }
})


router.post('/editworkunit/:id?', async (req, res) => {
  try{
    if (req.session.userId) {
      console.log("hello")
      if (req.params.id) {
        console.log("body",req.body)
        var edit = 0
        if(req.body.edit){
           edit = req.body.edit
           if(req.body.save){
             
           }
        }
        const workUnit = await WorkUnit.findById(req.params.id).exec();

        const workUnitManager = await Manager.find({
          workUnitId: workUnit._id,
          endDate: null
        }, 'registeredUserId').populate({
          path: 'registeredUserId',
          select: 'name surname email'
        }).exec()

        const manager = await Manager.find({
          workUnitId: workUnit._id,
          endDate: null
        }, 'registeredUserId').populate({
          path: 'registeredUserId',
          select: 'name surname email'
        }).exec()

        const organisers = await Organiser.find({
          workUnitId: workUnit._id,
          endDate: null
        }, 'registeredUserId').populate({
          path: 'registeredUserId',
          select: 'name surname email'
        }).exec()
        a = []
        organisers.forEach(organiser => a.push({
          organiserId: organiser._id,
          name: organiser.registeredUserId.name,
          surname: organiser.registeredUserId.surname,
          email: organiser.registeredUserId.email
        }))

        res.render('site/editworkunits', {
          create: "0",
          edit:edit,
          work_unit_id: workUnit._id,
          work_unit_code: workUnit.workUnitCode,
          work_unit_name: workUnit.workUnitName,
          acad: workUnit.acad,
          organisers: a
        })
      } else {
        res.render('site/editworkunits', {
          create: "1",
          edit:"1"
        })
      }

    } else {
      res.redirect('/registeredusers/login')
    }
  }catch(err){
    console.log("error",err);
  }

})

module.exports = router
