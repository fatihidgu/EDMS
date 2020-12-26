const mongoose = require('mongoose')
const Workflow = require('./Workflow')
const WorkUnit = require('./WorkUnit')


const Schema = mongoose.Schema;
const WorkflowUnitSchema = new Schema({
  workflowId:{type: Schema.Types.ObjectId, ref: 'Workflow',require:true},
  workUnitId:{type: Schema.Types.ObjectId, ref: 'WorkUnit',require:true}
})

module.exports = mongoose.model('WorkflowUnit',WorkflowUnitSchema)
