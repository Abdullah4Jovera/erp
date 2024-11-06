const mongoose = require('mongoose');
const { Schema } = mongoose;

const contractSchema = new Schema({
    is_reject: { 
        type: Boolean,
        default: false
    },
    reject_reason: {
        type: String
    },
    is_converted: {
        type: Boolean,
        default: false
    },  
    client_id: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    lead_type: {
        type: Schema.Types.ObjectId,
        ref: 'LeadType',
        required: true
    },
    pipeline_id: {
        type: Schema.Types.ObjectId,
        ref: 'Pipeline',
        required: true
    },
    source_id: {
        type: Schema.Types.ObjectId,
        ref: 'Source',
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    contract_stage: {
        type: Schema.Types.ObjectId,
        ref: 'ContractStage',
        required: true
    },
    labels: [{
        type: String,
        default: null
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        required: true
    },
    created_by: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lead_id: {
        type: Schema.Types.ObjectId,
        ref: 'Lead',
    },
    selected_users: [{ 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }], 
    is_active: {
        type: Boolean,
        default: false
    },
    files: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    discussions: [{ type: Schema.Types.ObjectId, ref: 'ContractDiscussion' }],
    service_commission_id: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceCommission',
    },
    contract_activity_logs: [{
        type: Schema.Types.ObjectId,
        ref: 'ContractActivityLog'
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    delstatus: { 
        type: Boolean, 
        default: false 
    },
});

// // Update timestamps before saving
// contractSchema.pre('save', function (next) {
//     if (this.isModified()) {
//         this.updated_at = Date.now();
//     }
//     next();
// });

module.exports = mongoose.model('Contract', contractSchema);
