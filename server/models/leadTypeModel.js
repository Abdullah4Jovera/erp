const mongoose = require('mongoose');

const leadTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  created_by: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  delstatus: { type: Boolean, default: false } // Soft delete status
});

const LeadType = mongoose.model('LeadType', leadTypeSchema);

module.exports = LeadType;
