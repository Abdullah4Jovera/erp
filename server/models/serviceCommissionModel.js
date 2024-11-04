const mongoose = require('mongoose');
const { Schema } = mongoose;

// Assuming Deal and User models are in the same directory; adjust the path as needed
const Deal = require('./dealModel');
const User = require('./userModel');

const serviceCommissionSchema = new Schema({
    contract_id: {
        type: Schema.Types.ObjectId,
        ref: 'Contract',
        required: false
    },
    finance_amount: {
        type: Number,
    },
    bank_commission: {
        type: Number,
    },
    customer_commission: {
        type: Number,
    },
    with_vat_commission: {
        type: Number,
    },
    without_vat_commission: {
        type: Number,
    },
    hodsale: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    hodsalecommission: {
        type: Number,
    },
    salemanager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    salemanagercommission: {
        type: Number,
    },
    coordinator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    coordinator_commission: {
        type: Number,
    },
    team_leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    team_leader_commission: {
        type: Number,
    },
    salesagent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    team_leader_one: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    team_leader_one_commission: {
        type: Number,
        default: "0"
    },
    sale_agent_one: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }, 
    sale_agent_one_commission: {
        type: Number,
        default: "0"
    },
    sale_agent_two: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    sale_agent_two_commission: {
        type: Number,
        default: "0"
    },
    salesagent_commission: {
        type: Number,
        default: "0"
    },
    salemanagerref: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    salemanagerrefcommission: {
        type: Number,
        default: "0"
    },
    agentref: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    agent_commission: {
        type: Number,
        default: "0"
    },
    ts_hod: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ts_hod_commision: {
        type: Number,
        default: "0"
    },
    ts_team_leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ts_team_leader_commission: {
        type: Number,
        default: "0"
    },
    tsagent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    tsagent_commission: {
        type: Number, 
        default: "0"
    },
    it_team_commission: {
        type: Number,
        default: 0,
    },
    marketing_team_commission: {
        type: Number,
        default: 0,
    },
    marketingmanager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketingmanagercommission: {
        type: Number,
        default: "0"
    },
    ///////New fields
    marketingone: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketingonecommission: {
        type: Number,
        default: "0"
    },
    marketingtwo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketingtwocommission: {
        type: Number,
        default: "0"
    },
    marketingthree: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketingthreecommission: {
        type: Number,
        default: "0"
    },
    marketingfour: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketingfourcommission: {
        type: Number,
        default: "0"
    },
    developerone: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    developeronecommission: {
        type: Number,
        default: "0"
    },
    developertwo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    developertwocommission: {
        type: Number,
        default: "0"
    },
    developerthree: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    developerthreecommission: {
        type: Number,
        default: "0"
    },
    developerfour: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    developerfourcommission: {
        type: Number,
        default: "0"
    },



    marketing_team_leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketing_team_leader_commission: {
        type: Number,
        default: "0"
    },
    other_name: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    other_name_commission: {
        type: Number,
        default: "0"
    },
    broker_name: {
        type: String,
        default: null
    },
    broker_name_commission: {
        type: Number,
        default: "0"
    },
    alondra: {
        type: Number,
    },
    a_commission: {
        type: Number,
        default: "0"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    delstatus: { type: Boolean, default: false },

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('ServiceCommission', serviceCommissionSchema);
