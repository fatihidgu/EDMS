const mongoose = require('mongoose')
const Workflow = require('./Workflow')
const WorkUnit = require('./WorkUnit')


const Schema = mongoose.Schema;
const WorkflowUnitSchema = new Schema({
  workflowId:{type: Schema.Types.ObjectId, ref: 'Workflow',required:true},
  workUnitId:{type: Schema.Types.ObjectId, ref: 'WorkUnit',required:true}
})

module.exports = mongoose.model('WorkflowUnit',WorkflowUnitSchema)
