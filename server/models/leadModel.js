// models/leadModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadSchema = new Schema({ 
  client: { type: Schema.Types.ObjectId, ref: 'Client' },
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  selected_users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  pipeline_id: { type: Schema.Types.ObjectId, ref: 'Pipeline' },
  stage: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadStage'},
  product_stage: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductStage',  },
  lead_type: { type: Schema.Types.ObjectId, ref: 'LeadType', required: true },
  source: { type: Schema.Types.ObjectId, ref: 'Source', required: true },
  products: { type: Schema.Types.ObjectId, ref: 'Product', required: true  },
  notes: { type: String }, 
  company_Name: { type: String }, 
  description: { type: String },
  activity_logs: [{ type: Schema.Types.ObjectId, ref: 'ActivityLog' }],
  discussions: [{ type: Schema.Types.ObjectId, ref: 'LeadDiscussion' }],
  files: [{ type: Schema.Types.ObjectId, ref: 'File' }],
  labels: [{ type: Schema.Types.ObjectId, ref: 'Label'}],
  order: { type: String },
  thirdpartyname: { type: String },
  deal_stage: { type: String }, 
  is_active: { type: Boolean, default: true },
  is_converted: { type: Boolean, default: false },
  is_reject: { type: Boolean, default: false },
  is_transfer: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  branch: { type: Schema.Types.ObjectId, ref: 'Branch' }, // New field to reference the Branch model
  // branch: { type: String }, 
  delstatus: { type: Boolean, default: false },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WhatsAppMessage' }],
  reject_reason: { type: String },

});

module.exports = mongoose.model('Lead', LeadSchema);