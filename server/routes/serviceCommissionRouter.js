const express = require('express');
const router = express.Router();
const ServiceCommission = require('../models/serviceCommissionModel'); // Adjust the path if necessary
const Deal = require('../models/dealModel');
const User = require('../models/userModel');

// @route   POST /api/service-commissions
// @desc    Create a new Service Commission
// @access  Public or Private depending on your setup
router.post('/service-commission', async (req, res) => {
    try {
        // Destructure all required fields from the request body
        const {
            deal_id,
            finance_amount,
            bank_commission,
            customer_commission,
            with_vat_commission,
            without_vat_commission,
            hodsale,
            hodsalecommission,
            salemanager,
            salemanagercommission,
            coordinator,
            coordinator_commission,
            team_leader,
            team_leader_commission,
            salesagent,
            team_leader_one,
            team_leader_one_commission,
            sale_agent_one,
            sale_agent_one_commission,
            salesagent_commission,
            salemanagerref,
            salemanagerrefcommission,
            agentref,
            agent_commission,
            ts_hod,
            ts_hod_commision,
            ts_team_leader,
            ts_team_leader_commission,
            tsagent,
            tsagent_commission,
            marketingmanager,
            marketingmanagercommission,
            marketingagent,
            marketingagentcommission,
            other_name,
            other_name_commission,
            broker_name,
            broker_name_commission,
            alondra,
            a_commission,
            delstatus
        } = req.body;

        // Create a new ServiceCommission document using the request data
        const newServiceCommission = new ServiceCommission({
            deal_id,
            finance_amount,
            bank_commission,
            customer_commission,
            with_vat_commission,
            without_vat_commission,
            hodsale,
            hodsalecommission,
            salemanager,
            salemanagercommission,
            coordinator,
            coordinator_commission,
            team_leader,
            team_leader_commission,
            salesagent,
            team_leader_one,
            team_leader_one_commission,
            sale_agent_one,
            sale_agent_one_commission,
            salesagent_commission,
            salemanagerref,
            salemanagerrefcommission,
            agentref,
            agent_commission,
            ts_hod,
            ts_hod_commision,
            ts_team_leader,
            ts_team_leader_commission,
            tsagent,
            tsagent_commission,
            marketingmanager,
            marketingmanagercommission,
            marketingagent,
            marketingagentcommission,
            other_name,
            other_name_commission,
            broker_name,
            broker_name_commission,
            alondra,
            a_commission,
            delstatus
        });

        // Save the new service commission document to the database
        const savedServiceCommission = await newServiceCommission.save();

        // Send the saved document as the response
        res.status(201).json(savedServiceCommission);
    } catch (error) {
        // Catch and handle any errors
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/service-commissions
// @desc    Get all Service Commissions
// @access  Public or Private depending on your setup
router.get('/', async (req, res) => {
    try {
        const serviceCommissions = await ServiceCommission.find()
            .populate('deal_id')
            .populate('hodsale')
            .populate('salemanager')
            .populate('coordinator')
            .populate('team_leader')
            .populate('salesagent')
            .populate('team_leader_one')
            .populate('sale_agent_one')
            .populate('salemanagerref')
            .populate('agentref')
            .populate('ts_hod')
            .populate('ts_team_leader')
            .populate('tsagent')
            .populate('marketingmanager')
            .populate('marketingagent');
        res.json(serviceCommissions);
    } catch (error) {
        console.error('Error fetching service commissions:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/service-commissions/:id
// @desc    Get Service Commission by ID
// @access  Public or Private depending on your setup
router.get('/:id', async (req, res) => {
    try {
        const serviceCommission = await ServiceCommission.findById(req.params.id)
            .populate('deal_id')
            .populate('hodsale')
            .populate('salemanager')
            .populate('coordinator')
            .populate('team_leader')
            .populate('salesagent')
            .populate('team_leader_one')
            .populate('sale_agent_one')
            .populate('salemanagerref')
            .populate('agentref')
            .populate('ts_hod')
            .populate('ts_team_leader')
            .populate('tsagent')
            .populate('marketingmanager')
            .populate('marketingagent');
        if (!serviceCommission) {
            return res.status(404).json({ msg: 'Service commission not found' });
        }
        res.json(serviceCommission);
    } catch (error) {
        console.error('Error fetching service commission by ID:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/service-commissions/:id
// @desc    Update Service Commission by ID
// @access  Public or Private depending on your setup
router.put('/:id', async (req, res) => {
    try {
        const serviceCommissionData = req.body;

        let serviceCommission = await ServiceCommission.findById(req.params.id);
        if (!serviceCommission) {
            return res.status(404).json({ msg: 'Service commission not found' });
        }

        // Update fields (only if provided)
        Object.keys(serviceCommissionData).forEach((key) => {
            serviceCommission[key] = serviceCommissionData[key] || serviceCommission[key];
        });

        const updatedServiceCommission = await serviceCommission.save();
        res.json(updatedServiceCommission);
    } catch (error) {
        console.error('Error updating service commission:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   DELETE /api/service-commissions/:id
// @desc    Delete Service Commission by ID
// @access  Public or Private depending on your setup
router.delete('/:id', async (req, res) => {
    try {
        const serviceCommission = await ServiceCommission.findById(req.params.id);
        if (!serviceCommission) {
            return res.status(404).json({ msg: 'Service commission not found' });
        }

        await serviceCommission.remove();
        res.json({ msg: 'Service commission removed' });
    } catch (error) {
        console.error('Error deleting service commission:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
