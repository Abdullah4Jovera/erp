const express = require('express');
const router = express.Router();
const Contract = require('../models/contractModel'); // Adjust path as needed
const User = require('../models/userModel'); // Adjust path as needed
const Deal = require('../models/dealModel'); // Adjust path as needed
const { isAuth } = require('../utils');
const ContractActivityLog = require('../models/ContractActivityLogModel');
const { getIO } = require('../socket');
const Notification = require('../models/notificationModel');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const File = require('../models/fileModel'); // Adjust path as needed
const multer = require('multer');
const ServiceCommission = require('../models/serviceCommissionModel');
const Lead = require('../models/leadModel');
const mongoose = require('mongoose');
const DealStage = require('../models/dealStageModel');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../contractfiles');
        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a random filename
        const randomHexName = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname); // Get the original file extension
        cb(null, `${randomHexName}${ext}`); // Save with random hex filename and original extension
    }
});
const upload = multer({ storage }).array('files', 10); // Max 10 files at a time (you can adjust this)

router.delete('/revert-contract/:id', isAuth, async (req, res) => {
    try {
        const contractId = req.params.id;

        // Find the contract
        const contract = await Contract.findById(contractId);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        // Retrieve the associated lead ID and service commission ID
        const leadId = contract.lead_id;
        const serviceCommissionId = contract.service_commission_id;

        if (!leadId) {
            return res.status(400).json({ message: 'No associated lead ID found for this contract' });
        }

        // Delete the contract
        await Contract.findByIdAndDelete(contractId);

        // Update the lead's is_converted status to true
        await Lead.findByIdAndUpdate(
            leadId,
            { is_converted: true },
            { new: true }
        );

        // If there's an associated service commission, delete it
        if (serviceCommissionId) {
            await ServiceCommission.findByIdAndDelete(serviceCommissionId);
        }

        res.status(200).json({
            message: 'Contract reverted successfully, lead updated, and service commission deleted'
        });
    } catch (error) {
        console.error('Error reverting contract:', error);
        res.status(500).json({ message: 'Error reverting contract', error });
    }
});
// Route to upload files for a contract and log activities
router.post('/upload-files/:contractId', isAuth, async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading files', error: err });
        }

        try {
            const contractId = req.params.contractId;
            const userId = req.user._id;

            // Find the contract to associate files with
            const contract = await Contract.findById(contractId);

            if (!contract) {
                return res.status(404).json({ message: 'Contract not found' });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: 'No files uploaded' });
            }

            const fileDocs = [];
            const activityLogs = [];

            for (const file of req.files) {
                // Create a new file document
                const newFile = new File({
                    added_by: userId,
                    file_name: file.originalname,
                    file_path: `/uploads/contract_files/${file.filename}`,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                // Save the file document
                await newFile.save();
                fileDocs.push(newFile);

                // Push the file reference to the contract's files array
                contract.files.push(newFile._id);

                // Create an activity log for each file upload
                const activityLog = new ContractActivityLog({
                    user_id: userId,
                    contract_id: contractId,
                    log_type: 'File Uploaded',
                    remark: `File "${file.originalname}" was uploaded by ${req.user.name || req.user.email}`,
                    created_at: new Date()
                });

                // Save the activity log
                await activityLog.save();
                activityLogs.push(activityLog);

                // Push the activity log ID into the contract's contract_activity_logs array
                contract.contract_activity_logs.push(activityLog._id);
            }

            // Save the updated contract document with files and activity logs
            await contract.save();

            res.status(201).json({
                message: 'Files uploaded, associated with contract, and activity logged successfully',
                files: fileDocs,
                activity_logs: activityLogs
            });
        } catch (error) {
            console.error('Error uploading files:', error);
            res.status(500).json({ message: 'Error uploading files' });
        }
    });
});
// Route to add a discussion to a contract and create an activity log
router.post('/add-discussion/:id', isAuth, async (req, res) => {
    try {
        const contractId = req.params.id;
        const { comment } = req.body;
        const userId = req.user._id; // Assuming the user ID is available in the request after authentication

        // Create a new discussion
        const newDiscussion = new ContractDiscussion({
            created_by: userId,
            comment: comment
        });

        // Save the discussion to the database
        const savedDiscussion = await newDiscussion.save();

        // Find the contract and update its discussions field
        const contract = await Contract.findByIdAndUpdate(
            contractId,
            { $push: { discussions: savedDiscussion._id } },
            { new: true }
        );

        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        // Create a new activity log entry
        const activityLog = new ContractActivityLog({
            user_id: userId,
            contract_id: contractId,
            log_type: 'Discussion Added',
            remark: `Added discussion with comment: "${comment}"`
        });

        // Save the activity log to the database
        const savedActivityLog = await activityLog.save();

        // Update the contract's activity logs with the new log
        await Contract.findByIdAndUpdate(
            contractId,
            { $push: { contract_activity_logs: savedActivityLog._id } }
        );

        res.status(200).json({
            message: 'Discussion added successfully and activity logged',
            discussion: savedDiscussion,
            contract,
            activityLog: savedActivityLog
        });
    } catch (error) {
        console.error('Error adding discussion and logging activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Route to reject a contract
router.put('/reject-contract/:id', isAuth, async (req, res) => {
    try {
        const contractId = req.params.id;
        const { reject_reason } = req.body;

        // Find the contract and update its is_reject status and reject_reason
        const contract = await Contract.findByIdAndUpdate(
            contractId,
            {
                is_reject: true,
                reject_reason: reject_reason
            },
            { new: true } // To return the updated document
        );

        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        res.status(200).json({ message: 'Contract rejected successfully', contract });
    } catch (error) {
        console.error('Error rejecting contract:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/update-service-commission/:contractId', isAuth, async (req, res) => {
    const { contractId } = req.params;
    const { serviceCommissionData } = req.body; // Expecting serviceCommissionData in request body

    try {
        // Find or create ServiceCommission entry
        let serviceCommission = await ServiceCommission.findOne({ contract_id: contractId });

        if (serviceCommission) {
            // Update the existing ServiceCommission entry
            serviceCommission = await ServiceCommission.findByIdAndUpdate(
                serviceCommission._id,
                { $set: serviceCommissionData },
                { new: true }
            );
        } else {
            // Create a new ServiceCommission entry
            serviceCommission = new ServiceCommission({ ...serviceCommissionData, contract_id: contractId });
            await serviceCommission.save();
        }

        // Update the contract's service_commission_id field
        await Contract.findByIdAndUpdate(
            contractId,
            { service_commission_id: serviceCommission._id },
            { new: true }
        );

        res.status(200).json({ message: 'Service commission updated successfully', serviceCommission });
    } catch (error) {
        console.error('Error updating service commission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all contracts
router.get('/get-all-contracts', isAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Fetch contracts and populate the necessary fields
        const contracts = await Contract.find({ selected_users: userId, is_converted:false, is_reject:false })
            .populate('client_id', 'name') // Only populate the client's name
            .populate('lead_type', 'name') // Only populate lead type name
            .populate('pipeline_id', 'name') // Only populate pipeline name
            .populate('source_id', 'name') // Only populate source name
            .populate('products', 'name') // Only populate product name
            .populate('created_by', 'name') // Only populate creator's name
            .populate('selected_users', 'name') // Only populate selected users' names
            .populate('contract_stage', 'name')
            .populate({
                path: 'service_commission_id', 
                populate: [
                    { path: 'hodsale', select: 'name' },
                    { path: 'salemanager', select: 'name' },
                    { path: 'coordinator', select: 'name' },
                    { path: 'team_leader', select: 'name' },
                    { path: 'salesagent', select: 'name' },
                    { path: 'team_leader_one', select: 'name' },
                    { path: 'sale_agent_one', select: 'name' },
                    { path: 'salemanagerref', select: 'name' },
                    { path: 'agentref', select: 'name' },
                    { path: 'ts_hod', select: 'name' },
                    { path: 'ts_team_leader', select: 'name' },
                    { path: 'tsagent', select: 'name' },
                    { path: 'marketingmanager', select: 'name' },
                    { path: 'marketing_team_leader', select: 'name' },
                    { path: 'other_name', select: 'name' }
                ] 
            });

        res.status(200).json(contracts);
    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/update-stage/:id', isAuth, async (req, res) => {
    try {
        const { id } = req.params; 
        const { contract_stage } = req.body;

        // Validate input
        if (!contract_stage) {
            return res.status(400).json({ error: 'Contract stage is required' });
        }

        // Find the contract and populate the contract_stage to get its name
        const contract = await Contract.findById(id).populate('contract_stage');
        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        // Store the previous stage name for logging
        const previousStageName = contract.contract_stage ? contract.contract_stage.name : 'Unknown';

        // Update the contract stage
        contract.contract_stage = contract_stage; // Assume contract_stage is passed as an ObjectId
        await contract.save();

        // Fetch the new stage name after updating
        const updatedContract = await Contract.findById(id).populate('contract_stage');
        const newStageName = updatedContract.contract_stage ? updatedContract.contract_stage.name : 'Unknown';

        // Find the user to get their name
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create a new activity log entry
        const activityLog = new ContractActivityLog({
            user_id: user._id,
            contract_id: contract._id,
            log_type: 'Stage Update',
            remark: `Contract stage changed from '${previousStageName}' to '${newStageName}'`
        });

        const savedActivityLog = await activityLog.save();

        // Push the activity log ID into the contract's activity logs array
        contract.contract_activity_logs.push(savedActivityLog._id);
        await contract.save();

        // Create and send notifications to all selected users
        const io = getIO();
        const notificationPromises = contract.selected_users.map(async (userId) => {
            const notification = new Notification({
                receiver: userId,
                message: `${user.name} updated the contract stage from '${previousStageName}' to '${newStageName}'`,
                reference_id: contract._id,
                notification_type: 'Contract',
            });

            await notification.save();

            // Emit the notification to the user's socket room
            io.to(`user_${userId}`).emit('notification', {
                message: notification.message,
                referenceId: notification.reference_id,
                notificationType: notification.notification_type,
                notificationId: notification._id,
                createdAt: notification.created_at,
            });
        });

        // Wait for all notifications to be created and sent
        await Promise.all(notificationPromises);

        res.status(200).json({ message: 'Contract stage updated successfully', contract });
    } catch (error) {
        console.error('Error updating contract stage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get a single contract by ID
router.get('/single-contract/:id', async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
            .populate('client_id')
            .populate('lead_type')
            .populate('pipeline_id')
            .populate('source_id')
            .populate('products')
            .populate('created_by')
            .populate('lead_id')
            .populate('selected_users')
            .populate('service_commission_id'); // Ensure to populate service commissions

        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        res.status(200).json(contract);
    } catch (error) {
        console.error('Error fetching contract:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update a contract by ID
router.put('/:id', async (req, res) => {
    try {
        const {
            is_transfer,
            client_id,
            lead_type,
            pipeline_id,
            source_id,
            products,
            contract_stage,
            labels,
            status,
            created_by,
            lead_id,
            selected_users,
            is_active,
            date
        } = req.body;

        const updatedContract = await Contract.findByIdAndUpdate(
            req.params.id,
            {
                is_transfer,
                client_id,
                lead_type,
                pipeline_id,
                source_id,
                products,
                contract_stage,
                labels,
                status,
                created_by,
                lead_id,
                selected_users,
                is_active,
                date
            },
            { new: true }
        );

        if (!updatedContract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        res.status(200).json(updatedContract);
    } catch (error) {
        console.error('Error updating contract:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a contract by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedContract = await Contract.findByIdAndDelete(req.params.id);

        if (!deletedContract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        res.status(200).json({ message: 'Contract deleted successfully' });
    } catch (error) {
        console.error('Error deleting contract:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Example route for handling Service Commissions
router.get('/:id/service-commission', async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
            .populate('service_commission_id');

        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        res.status(200).json(contract.service_commission_id);
    } catch (error) {
        console.error('Error fetching service commission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/convert-to-deal/:contractId', isAuth, async (req, res) => {
    try {
        const contractId = req.params.contractId;
        const userId = req.user._id;
        
        // Find the contract
        const contract = await Contract.findById(contractId)
            .populate('client_id')
            .populate('lead_type')
            .populate('pipeline_id')
            .populate('source_id')
            .populate('products')
            .populate('created_by')
            .populate('selected_users')
            .populate('service_commission_id');
        
        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        // Retrieve the deal stage with order "1"
        const initialDealStage = await DealStage.findOne({ order: 1 });
        if (!initialDealStage) {
            return res.status(404).json({ error: 'Initial deal stage not found' });
        }

        // Create a new deal based on the contract
        const newDeal = new Deal({
            client_id: contract.client_id._id,
            lead_type: contract.lead_type._id,
            pipeline_id: contract.pipeline_id._id,
            source_id: contract.source_id._id,
            products: contract.products[0]._id,  // Assuming there's at least one product
            deal_stage: initialDealStage._id,     // Dynamically set deal stage ID
            status: 'Active',  // Initial deal status
            created_by: userId,
            lead_id: contract.lead_id || null,
            contract_id: contract._id,
            selected_users: contract.selected_users.map(user => user._id),
            is_active: true,
            service_commission_id: contract.service_commission_id ? contract.service_commission_id._id : null,
            date: new Date(),
        });

        // Save the new deal
        await newDeal.save();

        // Update the contract to mark it as converted and transferred 
        contract.is_converted = true;
        contract.is_transfer = true;
        await contract.save();

        // Optionally, log the activity (if you have activity logging set up)
        // const log = new DealActivityLog({
        //   deal_id: newDeal._id,
        //   action: 'Converted contract to deal',
        //   user_id: userId,
        //   date: new Date(),
        // });
        // await log.save();

        // Return a success response
        res.status(201).json({
            message: 'Contract converted to deal successfully',
            deal: newDeal,
            contract: {
                _id: contract._id,
                is_converted: contract.is_converted,
                is_transfer: contract.is_transfer,
            }
        });
    } catch (error) {
        console.error('Error converting contract to deal:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
