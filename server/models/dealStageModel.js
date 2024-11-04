const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dealStageSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        trim: true
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: String,
        default: 0,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    delStatus: {
        type: Boolean,
        default: false, 
    }
});

// Middleware to automatically update the `updated_at` field on save
dealStageSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

const DealStage = mongoose.model('DealStage', dealStageSchema);

module.exports = DealStage;
