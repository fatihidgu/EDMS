const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
var app = require('../app');
const fs = require('fs');
//models
const File = require('../models/File');
const RegisteredUser = require('../models/RegisteredUser');
const Workflow = require('../models/Workflow');
const WorkUnit = require('../models/WorkUnit');
const MainProcess = require('../models/MainProcess');
const WorkflowFileType = require('../models/WorkflowFileType');
const Administrator = require('../models/Administrator');
const Manager = require('../models/Manager');
const Committee = require('../models/Committee');
const Organiser = require('../models/Organiser');
const Change = require('../models/Change');
const Reject = require('../models/Reject');



//variables
var filePath = path.join(__dirname, '..', 'uploads');

router.use(express.static('public'));
router.use(express.static('uploads'));

//UPDATE ONE File
function oneFileUpdate(filter, update) {
  File.findOneAndUpdate(filter, update, {
    new: true
  }, (err, doc) => {
    if (err) {
      //console.log("Something wrong when updating data!");
    }
  });
}

//date formatter
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [day, month, year].join('/');
}

//MOVE File PATH
function changeFilePath(currentPath, newPath) {
  fs.rename(currentPath, newPath, function(err) {
    if (err) {
      //console.log(err);
    }
  });
}


//MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, filePath)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileN = path.basename(file.originalname, ext);
    var filePath = `files/${fileN}${ext}`;

    while (fs.existsSync(('../EDMS/uploads/' + filePath))) {
      lastIndex = filePath.lastIndexOf(ext);
      filePath = filePath.slice(0, lastIndex);
      filePath = filePath + '(1)' + ext;
    }
    cb(null, filePath);
  }
})

const upload = multer({
  storage
}); // or simply { dest: 'uploads/' }



// UPLOAD FILE
router.post('/upload', upload.single('file'), async (req, res) => {
  //console.log("upload");
  //console.log(req.body);
  const file_type = await WorkflowFileType.findById(req.body.file_type_id).exec();
  const work_unit = await WorkUnit.findById(req.body.work_unit_id).exec();
  const work_process = await Workflow.findById(req.body.workflow_id).exec();
  const main_process = await MainProcess.findById(req.body.main_process_id).exec();
  const userAdmin = await RegisteredUser.findById(req.session.userId).exec();


  const admin = await Administrator.findOne({
    registeredUserId: userAdmin._id
  }).exec();
  const manager = await Manager.findOne({
    workUnitId: work_unit._id,
    endDate: null
  }).exec();

  const ext = path.extname(req.file.path);
  const oldFilePath = req.file.path;

  var fileNo = file_type.workflowFileTypeCode + "-" + main_process.mainProcessNo + "-" + work_unit.workUnitCode +
    "-" + work_process.workflowNo + "-" + "0";

  var filen = fileNo + ext
  var directory = path.join(__dirname, '..', 'uploads', 'files', work_unit.workUnitCode);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }


  const newFilePath = path.join(__dirname, '..', 'uploads', 'files', work_unit.workUnitCode, filen);
  fs.rename(oldFilePath, newFilePath, function(err) {
    if (err) {
      //console.log(err);
    }
  });
  const fileObject = new File({
    workflowId: work_process._id,
    fileNo: fileNo,
    filePath: newFilePath,
    workflowFileTypeId: file_type._id,
    creatorId: userAdmin._id,
    version: 0
  });
  fileObject.save();

  //end
  req.session.sessionFlash = {
    type: 'alert alert-success',
    message: 'Your file created Successfully.'
  }
  const address = '/onchangefiles/' + work_process._id;
  return res.redirect(address);

});

// DELETE FILE
router.post('/delete', (req, res) => {
  //console.log("delete")
  file_id = req.body.file_id;
  //console.log("delete",file_id)

  const filterId = {
    _id: file_id
  };

  var todayDate = new Date();
  var year = todayDate.getFullYear();
  var month = todayDate.getMonth() + 1;
  var day = todayDate.getDate();
  var todayStrDate = day + "-" + month + "-" + year;

  var fileAttributes = {
    approvalStatus: null,
    filePath: null,
    deleteDate: todayDate
  };
  var update = {};
  var a = []
  File.findOne(filterId, function(err, choosenFile) {
    if (err) {
      //console.log("File Approval Status Can Not Be Accessed", err);
      res.render('site/onchange');
    } else {

      fileAttributes.approvalStatus = choosenFile.approvalStatus;
      fileAttributes.filePath = choosenFile.filePath;
      const ext = path.extname(choosenFile.filePath);
      a.push({
        _id: choosenFile._id
      });

      if (fileAttributes.approvalStatus == 4) {
        fileAttributes.approvalStatus = 5;
        const oldFilePath = choosenFile.filePath;

        const fileName = choosenFile.fileNo + "(" + fileAttributes.deleteDate + ")" + ext;
        const newFilePath = path.join(__dirname, '..', 'uploads', 'oldFiles', fileName);
        //fileAttributes.approvalStatus = choosenFile.approvalStatus;
        fileAttributes.filePath = newFilePath

        oneFileUpdate(filterId, fileAttributes);
        fs.rename(oldFilePath, newFilePath, function(err) {
          if (err) {
            //console.log(err);
          }
        });
        const address = '/onchangefiles/' + choosenFile.workflowId;
        return res.redirect(address);
      } else {
        const oldFilePath = choosenFile.filePath;
        const fileName = choosenFile.fileNo + "(" + fileAttributes.deleteDate + ")" + ext;
        const newFilePath = path.join(__dirname, '..', 'uploads', 'oldFiles', fileName);
        fileAttributes.approvalStatus = choosenFile.approvalStatus;
        fileAttributes.filePath = newFilePath
        oneFileUpdate(filterId, fileAttributes);
        fs.rename(oldFilePath, newFilePath, function(err) {
          if (err) {
            //console.log(err);
          }
        });
        const address = '/onchangefiles/' + choosenFile.workflowId;
        return res.redirect(address);
      }
    }
  });

  req.session.sessionFlash = {
    type: 'alert alert-success',
    message: 'Your file deleted successfully.'
  }
  //const address = '/onchangefiles/' + a._id;
  //return res.redirect(address);
});

// DOWNLOAD FILE
router.post('/download', (req, res) => {
  file_id = req.body.file_id;
  //console.log("download")
  filter = {
    fileId: file_id
  }
  File.findById(file_id).then(file => {
    fileDownload = path.basename(file.filePath);
    //console.log(file.filePath,"-",fileDownload);
    res.download(file.filePath, fileDownload, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  });
});


//UPDATE File
router.post('/update', upload.single('file'), (req, res) => {
  //console.log("update")
  //const ext = path.extname(req.file.path);
  //const oldFilePath = req.file.path;
  //console.log("update");
  //
  id = req.body.fileId;
  filterId = {
    _id: id
  }
  File.findOne(filterId, async function(err, choosenFile) {
    if (err) {
      //console.log("File Approval Status Can Not Be Accessed", err);
      res.render('site/onchange');
    } else {

      const filen = path.basename(choosenFile.filePath);
      const work_unit = await WorkUnit.findOne({
        _id: req.body.work_unit_id
      }).exec();


      var oldDirectory = path.join(__dirname, '..', 'uploads', 'files', work_unit.workUnitCode);
      var newDirectory = path.join(__dirname, '..', 'uploads', 'oldFiles', work_unit.workUnitCode);
      if (!fs.existsSync(oldDirectory)) {
        fs.mkdirSync(oldDirectory);
      }
      if (!fs.existsSync(newDirectory)) {
        fs.mkdirSync(newDirectory);
      }



      if (choosenFile.approvalStatus == 4) {
        var todayDate = new Date();
        var year = todayDate.getFullYear();
        var month = todayDate.getMonth() + 1;
        var day = todayDate.getDate();
        var todayStrDate = day + "-" + month + "-" + year;

        fileOldN = filen + "(" + todayStrDate + ")";




        const oldFileCurrentPath = path.join(__dirname, '..', 'uploads', 'files', work_unit.workUnitCode, filen);
        const oldFileGoesTo = path.join(__dirname, '..', 'uploads', 'oldFiles', work_unit.workUnitCode, fileOldN);
        changeFilePath(oldFileCurrentPath, oldFileGoesTo);
        var fileAttributes = {
          approvalStatus: 5,
          filePath: oldFileGoesTo,
          deleteDate: todayDate
        };
        oneFileUpdate(filterId, fileAttributes);

        const newFileCurrentPath = req.file.path;
        const newFileGoesTo = path.join(__dirname, '..', 'uploads', 'files', work_unit.workUnitCode, filen);
        changeFilePath(newFileCurrentPath, newFileGoesTo);


        const fileObject = new File({
          workflowId: choosenFile.workflowId,
          fileNo: choosenFile.fileNo,
          creatorId: req.session.userId,
          revisionDate: null,
          approvalStatus: 0,
          approvalDate: null,
          filePath: newFileGoesTo,
          deleteDate: null,
          version: (choosenFile.version + 1),
          workflowFileTypeId: choosenFile.workflowFileTypeId
        });
        fileObject.save();

        const address = '/onchangefiles/' + fileObject.workflowId;
        return res.redirect(address);

      } else {
        const newFileCurrentPath = req.file.path;
        const newFileGoesTo = path.join(__dirname, '..', 'uploads', 'files', work_unit.workUnitCode, filen);
        changeFilePath(newFileCurrentPath, newFileGoesTo);


        const update = ({
          workflowId: choosenFile.workflowId,
          fileNo: choosenFile.fileNo,
          workflowFileTypeId: choosenFile.workflowFileTypeId,
          creatorId: choosenFile.creatorId,
          revisionDate: new Date(),
          filePath: newFileGoesTo
        });
        File.findByIdAndUpdate({
          _id: id
        }, update).exec()


        req.session.sessionFlash = {
          type: 'alert alert-success',
          message: 'Your file updated Successfully.'
        }
        const address = '/onchangefiles/' + update.workflowId;
        return res.redirect(address);


      }
    }
  });

  //end
  req.session.sessionFlash = {
    type: 'alert alert-success',
    message: 'Your file created Successfully.'
  }
  //return res.render('site/workflows');
  //return res.redirect('onchangefiles/'+update.workflowId);

});
//Create file
// router.get('/', (req, res) => {
//   res.render('site/createfile');
// });

router.post("/change", async (req, res) => {
  if (res.locals.userid) {

    var file = await File.findById(req.body.fileId).exec();
    var wf = await Workflow.findById(file.workflowId).exec();
    var mp = await MainProcess.findById(wf.mainProcessId).exec();
    var wu = await WorkUnit.findById(mp.workUnitId).exec();
    var manager = await Manager.findOne({
      workUnitId: wu._id,
      endDate: null
    }).exec();
    var organiser = await Organiser.findById(wf.organiserId).exec();
    var administrator = await Administrator.findOne({
      acad: wf.acad,
      endDate: null
    })
    var committee = await Committee.findOne({
      endDate: null
    })
    if (file != null && organiser != null && manager != null && administrator != null && committee != null) {

      if (file.approvalStatus == 0) {

        const newChange = new Change({
          fileNo: file._id,
          organiserId: organiser._id,
          changeReason: req.body.reason,
          managerId: manager._id,
          administratorId: administrator._id,
          committeeId: committee._id
        });
        newChange.save();

        oneFileUpdate({
          _id: file._id
        }, {
          approvalStatus: 1
        });
      } else if (file.approvalStatus == 1) {
        var change = await Change.findOneAndUpdate({
          fileNo: file._id,
          endDate: null
        })

        Change.findOneAndUpdate({
          fileNo: file._id,
          endDate: null
        }, {
          managerApprovalDate: Date.now()
        }, {
          new: true
        }, (err) => {
          if (err) {
            console.log(err);
          }
        });
        oneFileUpdate({
          _id: file._id
        }, {
          approvalStatus: 2
        });

      } else if (file.approvalStatus == 2) {
        var change = await Change.findOneAndUpdate({
          fileNo: file._id,
          endDate: null
        })

        Change.findOneAndUpdate({
          fileNo: file._id,
          endDate: null
        }, {
          administratorApprovalDate: Date.now()
        }, {
          new: true
        }, (err) => {
          if (err) {
            console.log(err);
          }
        });
        oneFileUpdate({
          _id: file._id
        }, {
          approvalStatus: 3
        });
      } else {
        console.log("something wrong");
      }


      req.session.sessionFlash = {
        type: 'alert alert-success',
        message: 'Your file sent for approval.'
      }
      const address = '/onchangefiles/' + wf._id;
      return res.redirect(address);

    }

  } else {
    res.redirect('/registeredusers/register')
  }

});

router.post("/reject", async (req, res) => {
  if (res.locals.userid) {
    console.log(req.body)

    var file = await File.findById(req.body.fileId).exec();
    var change = await Change.findOne({
      fileNo: file._id,
      deleteDate: null
    });

    if (file != null && change != null) {
      Reject.findOneAndUpdate({
        changeId: change._id,
        deleteDate: null
      }, {
        deleteDate: Date.now()
      }).exec();

      const newReject = new Reject({
        changeId: change._id,
        rejectReason: req.body.reason,
        rejectRole: file.approvalStatus,
        rejecterId: res.locals.userid
      });
      newReject.save();

      oneFileUpdate({
        _id: file._id
      }, {
        approvalStatus: 0
      });
      Change.findOneAndUpdate({
        _id: change._id
      }, {
        $set: {
          deleteDate: Date.now()
        }
      }).exec()

      req.session.sessionFlash = {
        type: 'alert alert-success',
        message: 'Your file re-sent back for change.'
      }
      const address = '/onchangefiles/' + file.workflowId;
      return res.redirect(address);

    }

  } else {
    res.redirect('/registeredusers/register')
  }
});

router.post("/approve", async (req, res) => {
  if (res.locals.userid) {

    var file = await File.findById(req.body.fileId).exec();
    var wf = await Workflow.findById(file.workflowId).exec();
    var mp = await MainProcess.findById(wf.mainProcessId).exec();
    var wu = await WorkUnit.findById(mp.workUnitId).exec();
    var manager = await Manager.findOne({
      workUnitId: wu._id,
      endDate: null
    }).exec();
    var organiser = await Organiser.findById(wf.organiserId).exec();
    var administrator = await Administrator.findOne({
      acad: wf.acad,
      endDate: null
    })
    var committee = await Committee.findOne({
      endDate: null
    })
    var change = await Change.findOne({fileNo:file._id,deleteDate:null})

    if (file != null && change != null && administrator != null && committee != null) {
      if (res.locals.userid == administrator.registeredUserId || res.locals.userid == committee.registeredUserId) {
        Reject.findOneAndUpdate({
          changeId: change._id,
          deleteDate: null
        }, {
          $set: {
            deleteDate: Date.now()
          }
        }).exec();
        oneFileUpdate({
          _id: file._id
        }, {
          approvalStatus: 4,
          approvalDate: Date.now()
        });
        Change.findOneAndUpdate({
          _id: change._id
        }, {
          $set: {
            deleteDate: Date.now()
          }
        }).exec();

        req.session.sessionFlash = {
          type: 'alert alert-success',
          message: 'Your file approved.'
        }
        const address = '/onchangefiles/' + wf._id;
        return res.redirect(address);
      }
    }
  } else {
    res.redirect('/registeredusers/register')
  }
});





router.get('/create/:workflowId', (req, res) => {
  //console.log('/create/:workflowId')
  filterIdWF = {
    _id: req.params.workflowId
  };
  //findQuery(RegisteredUser,null);
  if (req.session.userId) {
    Workflow.findOne(filterIdWF, function(err, choosenWF) {
      if (err) {
        res.render('site/onchange');
      } else {

        var filterMP = {
          _id: choosenWF.mainProcessId
        }
        MainProcess.findOne(filterMP, function(err, mainProcess) {
          main_process_id = mainProcess._id;
          main_process_name = mainProcess.mainProcessName;

          var filterWU = {
            endDate: null,
            _id: mainProcess.workUnitId
          };
          WorkUnit.find(filterWU, function(err, workUnits) {
            var work_unit = [];
            workUnits.forEach(workUnit => {
              work_unit.push({
                work_unit_id: workUnit._id,
                work_unit_name: workUnit.workUnitName
              });
            })

            WorkflowFileType.find({
              deleteDate: null
            }, function(err, fileTypes) {
              var file_type = [];


              fileTypes.forEach(fileType => {
                file_type.push({
                  file_type_id: fileType._id,
                  file_type_name: fileType.workflowFileTypeName
                });
              });

              return res.render('site/createfile', {
                main_process_id: main_process_id,
                main_process_name: main_process_name,
                work_unit_name: work_unit[0].work_unit_name,
                work_unit_id: work_unit[0].work_unit_id,
                file_type: file_type,
                workflow_id: choosenWF._id,
                workflow_name: choosenWF.workprocessName
              });
            });
          });
        });
      }
    });

  } else {
    res.redirect('/registeredusers/login')
  }
});

router.get('/upload/:fileId', async (req, res) => {
  //console.log('/upload/:fileId')
  var fileId = req.params.fileId;
  if (req.session.userId) {
    const file = await File.findById(fileId).exec();
    const workflow = await Workflow.findById(file.workflowId).exec();
    const mainProcess = await MainProcess.findById(workflow.mainProcessId).exec();
    const workUnit = await WorkUnit.findById(mainProcess.workUnitId).exec();
    const file_type = await WorkflowFileType.findById(file.workflowFileTypeId).exec();

    return res.render('site/createfile', {
      fileId: fileId,
      fileNo: file.fileNo,
      workflow_id: workflow._id,
      workflow_name: workflow.workprocessName,
      main_process_id: mainProcess._id,
      main_process_name: mainProcess.mainProcessName,
      work_unit_id: workUnit._id,
      work_unit_name: workUnit.workUnitName,
      file_type_id: file_type._id,
      file_type_name: file_type.workflowFileTypeName,
    });
  } else {
    res.redirect('/registeredusers/login')
  }
});


// router.get('/:id', async (req, res) => {
//   //console.log("deneme1")
//   if (req.session.userId) {
//     //file olmayacak boş bakınma
//
//     const onChangeFiles = await File.find({
//       workflowId: req.params.id,
//       approvalStatus: {
//         $gte: 0,
//         $lt: 4
//       },
//       deleteDate: null
//     }).exec();
//     const wf = await Workflow.findById(req.params.id).exec();
//     const mp = await MainProcess.findById(wf.mainProcessId).exec();
//     const organiser = await Organiser.findById(wf.organiserId).exec();
//     const manager = await Manager.findOne({
//       workUnitId: mp.workUnitId,
//       endDate: null
//     });
//     const administrator = await Administrator.findOne({
//       acad: wf.acad,
//       endDate: null
//     });
//     const committee = await Committee.findOne({
//       endDate: null
//     });
//
//     const userO = await RegisteredUser.findById(organiser.registeredUserId).exec();
//     const userM = await RegisteredUser.findById(manager.registeredUserId).exec();
//     const userA = await RegisteredUser.findById(administrator.registeredUserId).exec();
//     const userC = await RegisteredUser.findById(committee.registeredUserId).exec();
//     //console.log("ONCHANGE")
//     //console.log(onChangeFiles)
//     var a = []
//     var i = 0
//     for (var onChangeFile of onChangeFiles) {
//       i = i + 1
//       var change = await Change.findOne({
//         fileNo: onChangeFile._id
//       }, {}, {
//         sort: {
//           'creationDate': -1
//         }
//       })
//       if (change == null) {
//         a.push({
//           approvalStatus: onChangeFile.approvalStatus,
//           fileNo: onChangeFile.fileNo,
//           _id: onChangeFile._id,
//           changeReason: "-",
//           rejectReason: "-",
//           rejectStatus: "-",
//           organiserRUId: userO._id.toString(),
//           managerRUId: userM._id.toString(),
//           administratorRUId: userA._id.toString(),
//           committeeRUId: userC._id.toString(),
//           userId: req.session.userId
//         });
//
//       } else {
//         var reject = await Reject.findOne({
//           changeId: change._id,
//           deleteDate: null
//         })
//         if (reject == null) {
//           a.push({
//             approvalStatus: onChangeFile.approvalStatus,
//             fileNo: onChangeFile.fileNo,
//             _id: onChangeFile._id,
//             changeReason: change.changeReason,
//             rejectReason: "-",
//             rejectStatus: "-",
//             organiserRUId: userO._id.toString(),
//             managerRUId: userM._id.toString(),
//             administratorRUId: userA._id.toString(),
//             committeeRUId: userC._id.toString(),
//             userId: req.session.userId
//           });
//
//         } else {
//           var role = {
//             1: "Manager",
//             2: "Administrator",
//             3: "Committee"
//           };
//
//
//           a.push({
//             approvalStatus: onChangeFile.approvalStatus,
//             fileNo: onChangeFile.fileNo,
//             _id: onChangeFile._id,
//             changeReason: change.changeReason,
//             rejectReason: reject.rejectReason,
//             rejectStatus: role[reject.rejectRole],
//             organiserRUId: userO.id.toString(),
//             managerRUId: userM._id.toString(),
//             administratorRUId: userA._id.toString(),
//             committeeRUId: userC.id.toString(),
//             userId: req.session.userId
//           });
//         }
//       }
//     }
//     var approvWfFiles = await File.find({approvalStatus:4,deleteDate:null,workflowId:req.params.id},'fileNo approvalDate').exec()
//     var approvedWFFiles =[]
//     approvWfFiles.forEach(approvedFile => approvedWFFiles.push({_id:approvedFile._id,fileNo:approvedFile.fileNo,approvalDate:formatDate(approvedFile.approvalDate)}))
//
//     File.find({
//       deleteDate: null,
//       approvalStatus: 4,
//       workflowId: req.params.id,
//     }).lean().then(wff => {
//       Workflow.findById(req.params.id).populate({
//         path: 'mainProcessId',
//         model: MainProcess
//       }).lean().then(workf => {
//         //console.log(onChangeFiles)
//
//         return res.render('site/onchange', {
//           approvedFiles: approvedWFFiles,
//           workf: workf,
//           onChangeFiles: a
//         })
//       })
//
//
//     })
//   } else {
//     res.redirect('/registeredusers/login')
//   }
//
// })
//


module.exports = router
