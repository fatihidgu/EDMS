const express = require('express')
const router = express.Router()
const WorkUnit = require('../models/WorkUnit')
const RegisteredUser = require('../models/RegisteredUser')
const Manager = require('../models/Manager')


router.get('/allworkunits', async (req, res) => {
  if (res.locals.userid) {

    const workUnitManager = await Manager.find({
    }).populate({path: 'workUnitId',select: 'WorkUnitCode WorkUnitName'
    }).populate({path: 'registeredUserId',select: 'email'
    }).exec();

    var workunits = []
    var oldworkunits = []
    var myworkunits = []
    workUnitManager.forEach(b => {
      if (b.endDate != null) {
        oldworkunits.push({
          workUnitId: b.workUnitId._id,
          workUnitName: b.workUnitId.WorkUnitName,
          workUnitCode: b.workUnitId.WorkUnitCode
        })
      } else {
        workunits.push({
          workUnitId: b.workUnitId._id,
          workUnitName: b.workUnitId.WorkUnitName,
          workUnitCode: b.workUnitId.WorkUnitCode,
          managerEmail: b.registeredUserId.email
        })
        console.log("1",b.registeredUserId._id)
        console.log("2",req.session.userId)
        if(b.registeredUserId._id==req.session.userId){
          myworkunits.push({
            workUnitId: b.workUnitId._id,
            workUnitName: b.workUnitId.WorkUnitName,
            workUnitCode: b.workUnitId.WorkUnitCode,
            managerEmail: b.registeredUserId.email
          })
        }
      }

    })
    console.log(myworkunits)



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

    workflows1={name:"wf1",files:[{name:"a",id:1},{name:"b",id:2},{name:"c",id:3}]}
    workflows2={name:"wf2",files:[{name:"aa",id:1},{name:"bb",id:2},{name:"cc",id:3}]}
    workflows3={name:"wf3",files:[{name:"x",id:1},{name:"y",id:2},{name:"z",id:3}]}
    workflows4={name:"wf4",files:[{name:"xx",id:1},{name:"yy",id:2},{name:"zz",id:3}]}
    mainProcesses1={name:"Aprocess",workflows:[workflows1,workflows2]}
    mainProcesses2={name:"Bprocess",workflows:[workflows2,workflows4]}
    mainProcesses3={name:"Cprocess",workflows:[workflows3,workflows4]}
    workUnit1 ={name:"İK",mainProcesses:[mainProcesses1,mainProcesses2]}
    workUnit2 ={name:"REK",mainProcesses:[mainProcesses1,mainProcesses2]}
    workUnit3 ={name:"MF",mainProcesses:[mainProcesses3]}
    workUnits =[workUnit1,workUnit2,workUnit3]
    console.log(workUnits)


    return res.render('site/treeview',{workUnits:workUnits});
  }else{
    res.redirect('/registeredusers/register')
  }
})

module.exports = router
