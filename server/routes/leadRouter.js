const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Lead = require('../models/leadModel');
const { isAuth, hasRole } = require('../utils');
const Client = require('../models/clientModel');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const ProductStage = require('../models/productStageModel');
const leadDiscussionModel = require('../models/leadDiscussionModel');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const File = require('../models/fileModel');
const serviceCommissionModel = require('../models/serviceCommissionModel');
const Contract = require('../models/contractModel');
const ActivityLog = require('../models/activityLogModel');
const LeadType = require('../models/leadTypeModel');
const Pipeline = require('../models/pipelineModel');
const Source = require('../models/sourceModel');
const Product = require('../models/productModel');
const Branch = require('../models/branchModel');
const Notification = require('../models/notificationModel');
const { getIO } = require('../socket');
const twilio = require('twilio');
const Phonebook = require('../models/phonebookModel.js')

const accountSid = 'AC9f10e22cf1b500ee219526db55a7c523'; 
const authToken = 'd23214875886a2ce7c3412863d5fe541'; 
const client = twilio(accountSid, authToken);
const fromWhatsAppNumber = 'whatsapp:+14155238886'; 
const axios = require('axios'); 
const hasPermission = require('../hasPermission.js');

// GET leads for CEO with specific criteria (lead type: Marketing, product: Mortgage Loan, and no pipeline)
router.get('/ceo-lead', isAuth, async (req, res) => {
    try {
        // Fetch the "Marketing" lead type
        const marketingLeadType = await LeadType.findOne({ name: 'Marketing' });
        if (!marketingLeadType) {
            return res.status(404).json({ message: 'Lead type "Marketing" not found' });
        }

        // Fetch the "Mortgage Loan" product
        const mortgageLoanProduct = await Product.findOne({ name: 'Mortgage Loan' });
        if (!mortgageLoanProduct) {
            return res.status(404).json({ message: 'Product "Mortgage Loan" not found' });
        }

        // Fetch leads that match the criteria: lead type = Marketing, product = Mortgage Loan, and pipeline_id is null
        const leads = await Lead.find({
            lead_type: marketingLeadType._id,
            products: mortgageLoanProduct._id,
            pipeline_id: null,  

        })
            .populate('pipeline_id', 'name')  
            .populate('stage', 'name')
            .populate('lead_type', 'name')
            .populate({
                path: 'source',
                populate: {
                    path: 'lead_type_id',
                    select: 'name created_by'
                }
            })
            .populate('created_by', 'name email')
            .populate('client', 'name email phone')
            // .populate({
            //     path: 'selected_users',
            //     select: 'name role image',
            // })
            .populate({
                path: 'activity_logs',
                populate: {
                    path: 'user_id',
                    select: 'name email'
                }
            })
            .populate({
                path: 'stage',
                populate: {
                    path: 'pipeline_id',
                    select: 'name created_by'
                }
            })
            .populate({
                path: 'product_stage',
                populate: {
                    path: 'product_id',
                    select: 'name'
                }
            })
           
            .populate({
                path: 'products',
                populate: {
                    path: 'pipeline_id',  
                    select: 'name'
                }
            })
            

        res.status(200).json(leads);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/get-leads/:productId/branch/:branchId', isAuth, hasPermission(['view_lead']), async (req, res) => {
    try {
        const { productId, branchId } = req.params;  // Get productId and branchId from URL params
        const userId = req.user._id;  // Authenticated user's ID from isAuth middleware

        // Validate if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Validate if the branch exists
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        // Fetch leads that match the productId, branchId, and include the authenticated user
        const leads = await Lead.find({
            products: productId,
            branch: branchId,
            selected_users: userId,  
            is_converted: false,
            is_reject: false,
        })
            .populate('pipeline_id', 'name')
            .populate('stage', 'name')
            .populate('lead_type', 'name')
            .populate('discussions', 'comment')
            .populate({
                path: 'source',
                populate: {
                    path: 'lead_type_id',
                    select: 'name created_by'
                }
            })
            .populate('created_by', 'name email')
            .populate('client', 'name email phone')

            .populate({
                path: 'selected_users',
                match: { role: { $nin: ['HOD', 'CEO', 'MD','Super Admin', 'Developer', 'Marketing'] } },  
                select: 'name role image', 
            })

            .populate({
                path: 'activity_logs',
                populate: {
                    path: 'user_id',
                    select: 'name email'
                }
            })
            .populate({
                path: 'stage',
                populate: {
                    path: 'pipeline_id',
                    select: 'name created_by'
                }
            })
            .populate({
                path: 'product_stage',
                populate: {
                    path: 'product_id',  
                    select: 'name'
                }
            })
            .populate({
                path: 'labels', 
                select: 'name color', 
            })
            .populate('products', 'name')  
            .populate({
                path: 'messages', 
                match: { read: false }, 
                select: 'read message_body', 
            });

       
        res.status(200).json(leads);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/search-leads', isAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 2000,
            userId, // Get userId from query params
            pipeline,
            created_at_start,
            created_at_end,
            lead_type,
            source,
            client,
            products,
            branch, // New filter for branch
        } = req.query;
        const user = req.user._id
        // Build the query object
        const query = {
            is_converted: false,
            is_reject: false,
            selected_users: user, // Ensure the lead's selected_users contains the authenticated user

        };

        // Ensure userId is an ObjectId and filter leads by selected_users
        if (userId) {
            query.selected_users = new mongoose.Types.ObjectId(String(userId));
        }

        // Pipeline filtering
        if (pipeline) {
            query.pipeline_id = new mongoose.Types.ObjectId(String(pipeline));
        }

        // Lead type filtering
        if (lead_type) {
            query.lead_type = new mongoose.Types.ObjectId(String(lead_type));
        }

        // Source filtering
        if (source) {
            query.source = new mongoose.Types.ObjectId(String(source));
        }

        // Client filtering
        if (client) {
            query.client = new mongoose.Types.ObjectId(String(client));
        }

        // Branch filtering
        if (branch) {
            query.branch = new mongoose.Types.ObjectId(String(branch)); // Ensure branch is an ObjectId
        }

        // Date range filtering for created_at
        if (created_at_start || created_at_end) {
            const createdAtFilter = {};
            if (created_at_start) {
                createdAtFilter.$gte = new Date(created_at_start);
            }
            if (created_at_end) {
                createdAtFilter.$lte = new Date(created_at_end);
            }
            query.created_at = createdAtFilter;
        }

        // Products filtering
        if (products) {
            query.products = {
                $in: products.split(',').map(id => new mongoose.Types.ObjectId(String(id))),
            };
        }

        // Fetch total number of leads matching the query
        const totalLeads = await Lead.countDocuments(query);

        // Fetch paginated leads with all necessary population
        const leads = await Lead.find(query)
            .populate('branch', 'name') // Populating branch
            .populate('pipeline_id', 'name')
            .populate('stage', 'name')
            .populate('lead_type', 'name')
            .populate('discussions', 'comment')
            .populate({
                path: 'source',
                populate: {
                    path: 'lead_type_id',
                    select: 'name created_by',
                },
            })
            .populate('created_by', 'name email')
            .populate('client', 'name email phone')
            .populate('selected_users', 'name role image')
            .populate({
                path: 'activity_logs',
                populate: {
                    path: 'user_id',
                    select: 'name email',
                },
            })
            .populate({
                path: 'files',
                select: 'file_name file_path created_at updated_at',
            })
            .populate({
                path: 'stage',
                populate: {
                    path: 'pipeline_id',
                    select: 'name created_by',
                },
            })
            .populate({
                path: 'product_stage',
                populate: {
                    path: 'product_id',
                    select: 'name',
                },
            })
            .populate({
                path: 'labels',
                select: 'name color',
            })
            .populate('products', 'name')
            .populate({
                path: 'messages',
                match: { read: false },
                select: 'read message_body',
            })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .exec();

        // Update file paths for each lead (assuming file_path needs formatting)
        leads.forEach(lead => {
            if (lead.files) {
                lead.files.forEach(file => {
                    file.file_path = `${file.file_path}`;
                });
            }
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalLeads / limit);

        res.status(200).json({
            leads,
            totalLeads,   // Send the total count of matching leads
            totalPages,   // Send the total number of pages
            currentPage: page,
        });
    } catch (error) {
        console.error('Error searching leads:', error);
        res.status(500).json({ message: 'Error searching leads' });
    }
});

// Route to send WhatsApp message (optional, if you want to keep it separate)
router.post('/send-sms', async (req, res) => {
    const { to, message } = req.body; // Get the recipient's phone number and the message from the request body

    // Ensure the recipient's phone number is formatted for WhatsApp
    const formattedTo = `whatsapp:${to}`;

    try {
        // Send WhatsApp message
        const sms = await client.messages.create({
            body: message,
            from: fromWhatsAppNumber, // Twilio WhatsApp number
            to: formattedTo // Recipient's WhatsApp number
        });

        // Respond with the message SID and a success message
        res.status(200).json({
            message: 'WhatsApp message sent successfully',
            sid: sms.sid
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ message: 'Failed to send WhatsApp message', error: error.message });
    }
});

router.post('/create-lead', isAuth,hasPermission(['create_lead']) ,async (req, res) => {
    try {
        let {
            clientPhone,
            clientw_phone, // WhatsApp phone
            clientName,
            clientEmail,
            cliente_id,
            company_Name,
            product_stage,
            lead_type,
            pipeline,
            products,
            source,
            description,
            branch,
            thirdpartyname // New field to be added
        } = req.body;

        // Check for missing required fields
        if (!product_stage || !lead_type || !source) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Format clientPhone and clientw_phone
        const formatPhoneNumber = (phone) => {
            if (!phone) return null;
            // Remove all spaces and ensure phone number starts with +971
            const cleanedPhone = phone.replace(/\s+/g, ''); // Remove spaces
            return cleanedPhone.startsWith('+971') ? cleanedPhone : `+971${cleanedPhone}`;
        };

        clientPhone = formatPhoneNumber(clientPhone);
        clientw_phone = formatPhoneNumber(clientw_phone || clientPhone); // Default WhatsApp to clientPhone if not provided

        const branchId = new mongoose.Types.ObjectId(String(branch));
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        let leadTypeId = new mongoose.Types.ObjectId(String(lead_type));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline));
        let sourceId = new mongoose.Types.ObjectId(String(source));
        const productId = new mongoose.Types.ObjectId(String(products)); // Single ObjectId

        // Validate product_stage and lead_type
        const validProductStage = await ProductStage.findById(productStageId);
        const validLeadType = await LeadType.findById(leadTypeId);
        if (!validProductStage || !validLeadType) {
            return res.status(400).json({ message: 'Invalid product stage or lead type' });
        }

        // Check if client already exists in Client collection
        let client = await Client.findOne({ phone: clientPhone });
        if (client) {
            // If client exists, check if there is already a lead for the client
            const existingLeads = await Lead.findOne({ client: client._id });
            if (existingLeads) {
                return res.status(400).json({ message: 'Lead already exists for this client.' });
            }
        }

        // If client doesn't exist, create a new client
        if (!client) {
            const defaultPassword = '123';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            client = new Client({
                phone: clientPhone,
                w_phone: clientw_phone,
                e_id: cliente_id,
                name: clientName || '',
                email: clientEmail || '',
                password: hashedPassword,
            });
            await client.save();
        }

        // Get selected_users and unique user IDs
        const initialSelectedUsers = req.body.selected_users || [];
        const initialUserIds = initialSelectedUsers.map(user => user._id.toString());
        let allSelectedUserIds = [...initialUserIds, req.user._id.toString()]; // Include current user

        // Filter users by role and branch
        const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
        const superadminUsers = await User.find({ role: 'superadmin' }).select('_id name');
        const mdUsers = await User.find({ role: 'MD' }).select('_id name');
        const managerUsers = await User.find({
            $or: [
                { role: 'Manager', branch: branchId, pipeline: pipelineId },
                { role: 'Manager', branch: null, pipeline: pipelineId }
            ]
        }).select('_id name');
        const hodUsers = await User.find({ role: 'HOD', pipeline: pipelineId }).select('_id name');

        allSelectedUserIds = [
            ...allSelectedUserIds,
            ...ceoUsers.map(user => user._id.toString()),
            ...superadminUsers.map(user => user._id.toString()),
            ...mdUsers.map(user => user._id.toString()),
            ...hodUsers.map(user => user._id.toString()),
            ...managerUsers.map(user => user._id.toString())
        ];

        // Add Marketing and Developer roles if lead_type is "Marketing"
        if (validLeadType.name === 'Marketing') {
            const marketingUsers = await User.find({ role: 'Marketing' }).select('_id name');
            const developerUsers = await User.find({ role: 'Developer' }).select('_id name');
            allSelectedUserIds.push(...marketingUsers.map(user => user._id.toString()));
            allSelectedUserIds.push(...developerUsers.map(user => user._id.toString()));
        }

        const uniqueUserIds = [...new Set(allSelectedUserIds)]; // Get unique user IDs

        // Create a new lead
        const newLead = new Lead({
            client: client._id,
            clientName,
            product_stage: productStageId,
            lead_type: leadTypeId,
            pipeline_id: pipelineId,
            source: sourceId,
            products: productId,
            description,
            branch: branchId,
            selected_users: uniqueUserIds,
            company_Name,
            created_by: req.user._id
        });

        const savedLead = await newLead.save();

        // Send SMS to client
        const message = 'Thanks for registering'; // SMS message
        const formattedTo = client.w_phone || clientPhone; // Use WhatsApp phone if available

        try {
            await axios.post('http://192.168.2.137:4000/api/leads/send-sms', {
                to: formattedTo,
                message: message
            });
        } catch (smsError) {
            console.error('Error sending SMS:', smsError);
        }

        // Log activity for new lead creation
        const activityLog = new ActivityLog({
            lead_id: savedLead._id,
            log_type: 'Lead Created',
            remark: `Lead created by ${req.user.name || req.user.email} for client ${client.name || client.phone}`,
            user_id: req.user._id,
            created_at: new Date()
        });
        await activityLog.save();
        savedLead.activity_logs.push(activityLog._id);
        await savedLead.save();

        return res.status(201).json(savedLead);
    } catch (error) {
        console.error('Error creating lead:', error);
        return res.status(500).json({ message: 'Error creating lead', error: error.message });
    }
});

// Helper function to validate and convert strings to ObjectIds
const convertToObjectId = id => {
    if (id && mongoose.isValidObjectId(id)) {
        return new mongoose.Types.ObjectId(String(id));
    } else {
        return null;
    }
};

// New route to get leads based on products and filter by unassigned Sales users 
router.get('/unassigned-leads/:productId', isAuth ,hasPermission(['unassigned_lead']), async (req, res) => {
    try {
        const { productId } = req.params; // Extract productId from route params

        // Validate productId
        const productObjectId = convertToObjectId(productId);
        if (!productObjectId) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        // Fetch all leads with the specific product and filter unassigned Sales
        const unassignedLeads = await Lead.find({ products: productObjectId })
            .populate('pipeline_id','name')  // Populate pipeline name
            .populate('product_stage', 'name')  // Populate product stage
            .populate('lead_type','name')  // Populate lead type
            .populate('source', 'name')  // Populate source
            .populate('products','name')  // Populate products
            .populate('branch')  // Populate branch
            .populate('client', 'name')  // Populate client
            .populate('created_by', 'name email')  // Populate the creator's name and email
            .populate({
                path: 'selected_users',
                select: 'name role',
                model: 'User',
            });

        // Filter leads where none of the selected users have the role "Sales"
        const leadsWithoutSales = unassignedLeads.filter(lead => {
            const salesUsers = lead.selected_users.filter(user => user.role === 'Sales');
            return salesUsers.length === 0;  // Only return leads with no "Sales" users
        });

        if (leadsWithoutSales.length === 0) {
            return res.status(404).json({ message: 'No unassigned leads found for the selected product' });
        }

        res.status(200).json({ message: 'Unassigned leads fetched successfully', leads: leadsWithoutSales });
    } catch (error) {
        console.error('Error fetching unassigned leads:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// New route to get all leads with a pipeline name "CEO"
// router.get('/leads-ceo-pipeline', isAuth, async (req, res) => {
//     try {
//         // Find the pipeline with the name "CEO"
//         const ceoPipeline = await Pipeline.findOne({ name: 'CEO' });

//         if (!ceoPipeline) {
//             return res.status(404).json({ message: 'CEO pipeline not found' });
//         }

//         // Find all leads with the CEO pipeline ID and populate all necessary fields
//         const leads = await Lead.find({ pipeline_id: ceoPipeline._id })
//             .populate('pipeline_id')  // Populate pipeline name
//             .populate('product_stage')  // Populate product stage
//             .populate('lead_type')  // Populate lead type
//             .populate('source')  // Populate source
//             .populate('products')  // Populate products
//             .populate('branch')  // Populate branch
//             .populate('client', 'name')  // Populate client
//             .populate('created_by', 'name email')  // Populate the creator's name and email
//             .populate('selected_users', 'name email');  // Populate the selected users' names and emails

//         if (leads.length === 0) {
//             return res.status(404).json({ message: 'No leads found for the CEO pipeline' });
//         }

//         res.status(200).json({ message: 'Leads fetched successfully', leads });
//     } catch (error) {
//         console.error('Error fetching leads with CEO pipeline:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });
router.put('/edit-labels/:leadId', isAuth, hasPermission(['lead_labels']),async (req, res) => {
    try {
        const { leadId } = req.params;
        const { labels } = req.body; // Expecting an array of label IDs or an empty array
 
        // Validate leadId and convert to ObjectId
        const leadObjectId = convertToObjectId(leadId);
        if (!leadObjectId) {
            return res.status(400).json({ message: 'Invalid lead ID' });
        }

        // If labels is undefined or not an array, default to an empty array (clear labels)
        const labelArray = Array.isArray(labels) ? labels : [];

        // Ensure all labels are valid ObjectIds
        const validLabelIds = labelArray.map(label => convertToObjectId(label)).filter(id => id !== null);

        // Update the lead by setting the labels field to the new validLabelIds array (empty if none provided)
        const updatedLead = await Lead.findByIdAndUpdate(
            leadObjectId,
            { $set: { labels: validLabelIds } }, // Set the labels field to the new array or empty array
            { new: true }
        ).populate('labels', 'name'); // Assuming Label has a 'name' field

        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.status(200).json({ message: 'Labels updated successfully', lead: updatedLead });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
 
// Route to mark a lead as rejected (set is_reject to true)
router.put('/reject-lead/:leadId', isAuth, hasPermission(['reject_lead']), async (req, res) => {
    try {
        const { leadId } = req.params; 
        const { reject_reason } = req.body;

        // Validate leadId and convert to ObjectId
        const leadObjectId = convertToObjectId(leadId);
        if (!leadObjectId) {
            return res.status(400).json({ message: 'Invalid lead ID' });
        }

        // Ensure reject_reason is provided
        if (!reject_reason || typeof reject_reason !== 'string') {
            return res.status(400).json({ message: 'Reject reason is required' });
        }

        // Find the lead and update is_reject to true and add reject_reason
        const updatedLead = await Lead.findByIdAndUpdate(
            leadObjectId,
            { is_reject: true, reject_reason },
            { new: true }
        );

        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.status(200).json({ message: 'Lead marked as rejected', lead: updatedLead });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get all leads that are not rejected (is_reject: false)
router.get('/rejected-leads', isAuth, async (req, res) => {
    try {
        const userId = req.user._id;  

        const leads = await Lead.find({ is_reject: true, selected_users: userId })
            .populate({
                path: 'pipeline_id',
                select: 'name'
            })
            .populate({
                path: 'product_stage',
                select: 'name'
            })
            .populate({
                path: 'products',
                select: 'name'
            })
            .populate({
                path: 'client',
                select: 'name'
            })
            .populate({
                path: 'branch', // Include branch population
                select: 'name'   // Adjust selection as needed to include relevant branch info
            })
            .select('_id pipeline_id product product_stage client branch reject_reason'); // Include branch in select

        if (leads.length === 0) {
            return res.status(404).json({ message: 'No rejected leads found' });
        }

        // Map through leads to create an array of detailed lead objects
        const leadDetails = leads.map(lead => ({
            id: lead._id,
            pipelineName: lead.pipeline_id?.name || null,
            productStage: lead.product_stage?.name || null,
            productName: lead.products?.name || null,
            clientName: lead.client?.name || null,
            branchName: lead.branch?.name || null, // Add branch name to the response
            reject_reason: lead.reject_reason || null, // Add reject_reason to the response
        }));

        res.status(200).json({ leadDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/check-client-phone', isAuth, async (req, res) => {
    try {
        const { clientPhone } = req.body;

        // Find client by phone
        const client = await Client.findOne({ phone: clientPhone });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Find all leads associated with the client, populating all necessary fields
        const leads = await Lead.find({ client: client._id })
            .populate({
                path: 'pipeline_id', // Populate the pipeline_id field with full details
            })
            .populate({
                path: 'product_stage', // Populate the product_stage field with full details
            })
            .populate({
                path: 'products', // Populate the products field with full details
            })
            .populate({
                path: 'client', // Populate client details
            })
            .populate({
                path: 'lead_type', // Populate lead_type field with full details
            })
            .populate({
                path: 'source', // Populate source field with full details
            })
            .populate({
                path: 'selected_users', // Populate selected users with their full details
                select: 'name email', // Only return relevant user details
            })
            .populate({
                path: 'activity_logs', // Populate activity logs related to the lead
            })
            .populate({
                path: 'files', // Populate any files related to the lead
            })
            .populate({
                path: 'branch', // Populate branch details
            })
            .populate({
                path: 'stage', // Populate the lead stage field with full details
            })
            .populate({
                path: 'discussions', // Populate discussions related to the lead
            })
            .populate({
                path: 'messages', // Populate messages related to the lead
            });

        if (leads.length === 0) {
            return res.status(404).json({ message: 'No leads found for this client' });
        }

        // Return full lead data, including populated fields
        const leadDetails = leads.map(lead => ({
            id: lead._id,
            client: lead.client, // Include full client details
            createdBy: lead.created_by, // Include details of the creator
            selectedUsers: lead.selected_users, // Include details of selected users
            pipeline: lead.pipeline_id, // Full pipeline details
            stage: lead.stage, // Full lead stage details
            productStage: lead.product_stage, // Full product stage details
            products: lead.products, // Full products details
            leadType: lead.lead_type, // Full lead type details
            source: lead.source, // Full source details
            notes: lead.notes || '', // Notes (if any)
            companyName: lead.company_Name || '', // Company name (if any)
            description: lead.description || '', // Description (if any)
            activityLogs: lead.activity_logs, // Full activity log details
            files: lead.files, // Full file details
            labels: lead.labels || [], // Labels (if any)
            branch: lead.branch, // Full branch details
            order: lead.order || '', // Order details (if any)
            thirdPartyName: lead.thirdpartyname || '', // Third-party name (if any)
            dealStage: lead.deal_stage || '', // Deal stage (if any)
            isActive: lead.is_active, // Lead active status
            isConverted: lead.is_converted, // Lead converted status
            isRejected: lead.is_reject, // Lead rejected status
            isTransferred: lead.is_transfer, // Lead transfer status
            date: lead.date, // Lead date
            messages: lead.messages, // WhatsApp messages related to the lead
            createdAt: lead.created_at, // Created timestamp
            updatedAt: lead.updated_at, // Updated timestamp
        }));

        res.status(200).json(leadDetails); // Send an array of detailed lead objects
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/add-user-to-lead/:leadId', isAuth, hasPermission(['add_user_lead']),async (req, res) => {
    try {
        const { userId } = req.body;
        const leadId = req.params.leadId;

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Check if the user already exists in selected_users
        if (lead.selected_users.includes(userId)) {
            return res.status(400).json({ message: 'User already added to selected users' });
        }

        // Fetch the user information to get the name
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add user to selected_users
        lead.selected_users.push(userId);
        await lead.save();

        // Log activity for adding a user
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Add User',
            remark: `User ${user.name} added to selected users`, // Store user name in remark
            created_at: Date.now(),
            updated_at: Date.now()
        });
        await activityLog.save();

        // Push activity log to lead
        lead.activity_logs.push(activityLog._id);
        await lead.save();

        res.status(200).json({ message: 'User added to selected users', lead });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove user from selected users in a lead
router.put('/remove-user-from-lead/:leadId', isAuth,hasPermission(['remove_user_lead']), async (req, res) => {
    try {
        const { userId } = req.body;
        const leadId = req.params.leadId;

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Filter out any invalid/null entries in selected_users
        lead.selected_users = lead.selected_users.filter(user => user);

        // Check if the user exists in selected_users
        if (!lead.selected_users.some(user => user.toString() === userId)) {
            return res.status(400).json({ message: 'User not found in selected users' });
        }

        // Fetch the user information to get the name
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove user from selected_users
        lead.selected_users = lead.selected_users.filter(user => user.toString() !== userId);
        await lead.save();

        // Log activity for removing a user
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Remove User',
            remark: `User ${user.name} removed from selected users`, // Store user name in remark
            created_at: Date.now(),
            updated_at: Date.now()
        });
        await activityLog.save();

        // Push activity log to lead
        lead.activity_logs.push(activityLog._id);
        await lead.save();

        res.status(200).json({ message: 'User removed from selected users', lead });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/convert-lead-to-contract/:leadId', isAuth,hasPermission(['convert_lead']), async (req, res) => {
    try {
        const { leadId } = req.params;

        const {
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
            salesagent_commission,
            team_leader_one,
            team_leader_one_commission,
            sale_agent_one,
            sale_agent_one_commission,
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
            marketingone,
            marketingonecommission,
            marketingtwo,
            marketingtwocommission,
            marketingthree,
            marketingthreecommission,
            marketingfour,
            marketingfourcommission,
            developerone,
            developeronecommission,
            developertwo,
            developertwocommission,
            developerthree,
            developerthreecommission,
            developerfour,
            developerfourcommission
        } = req.body;

        // Find the lead
        const lead = await Lead.findById(leadId)
            .populate('client')  // Populate client data
            .populate('products'); // Populate product data

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Create a new ServiceCommission based on the request body
        const newServiceCommission = new serviceCommissionModel({
            contract_id: null,  // We'll set this after creating the contract
            finance_amount,
            bank_commission,
            customer_commission,
            with_vat_commission,
            without_vat_commission,
            hodsale: convertToObjectId(hodsale),
            hodsalecommission,
            salemanager: convertToObjectId(salemanager),
            salemanagercommission,
            coordinator: convertToObjectId(coordinator),
            coordinator_commission,
            team_leader: convertToObjectId(team_leader),
            team_leader_commission,
            salesagent: convertToObjectId(salesagent),
            salesagent_commission,
            team_leader_one: convertToObjectId(team_leader_one),
            team_leader_one_commission,
            sale_agent_one: convertToObjectId(sale_agent_one),
            sale_agent_one_commission,
            salemanagerref: convertToObjectId(salemanagerref),
            salemanagerrefcommission,
            agentref: convertToObjectId(agentref),
            agent_commission,
            ts_hod: convertToObjectId(ts_hod),
            ts_hod_commision,
            ts_team_leader: convertToObjectId(ts_team_leader),
            ts_team_leader_commission,
            tsagent: convertToObjectId(tsagent),
            tsagent_commission,
            marketingmanager: convertToObjectId(marketingmanager),
            marketingmanagercommission,
            marketingagent: convertToObjectId(marketingagent),
            marketingagentcommission,
            other_name: convertToObjectId(other_name),
            other_name_commission,
            broker_name,
            broker_name_commission,
            alondra,
            a_commission,
            ///////
            marketingone:convertToObjectId(marketingone),
            marketingonecommission,
            marketingtwo:convertToObjectId(marketingtwo),
            marketingtwocommission,
            marketingthree:convertToObjectId(marketingthree),
            marketingthreecommission,
            marketingfour:convertToObjectId(marketingfour),
            marketingfourcommission,
            developerone:convertToObjectId(developerone),
            developeronecommission,
            developertwo:convertToObjectId(developertwo),
            developertwocommission,
            developerthree:convertToObjectId(developerthree),
            developerthreecommission,
            developerfour:convertToObjectId(developerfour),
            developerfourcommission
        });

        // Save the ServiceCommission to the database
        await newServiceCommission.save();

        // Handle products based on type
        const productIds = Array.isArray(lead.products)
            ? lead.products.map(product => product._id)
            : [lead.products];  // Convert to array if it's a single ObjectId

        // Create the new contract
        const newContract = new Contract({
            client_id: lead.client._id,
            lead_type: lead.lead_type,
            pipeline_id: lead.pipeline_id,
            source_id: lead.source,
            products: productIds,  // Ensure only product ObjectIds
            contract_stage: '67220719d0fd0be64dc09a74',
            status: 'Active',
            is_transfer: false,
            labels: lead.labels,
            created_by: req.user._id,
            lead_id: lead._id,
            selected_users: lead.selected_users,
            service_commission_id: newServiceCommission._id,
            date: new Date(),
        });

        // Save the new contract to the database
        await newContract.save();

        // Update the ServiceCommission with the new contract ID
        newServiceCommission.contract_id = newContract._id;
        await newServiceCommission.save();

        // After successfully creating the contract, mark the lead as converted
        await Lead.findByIdAndUpdate(leadId, { is_converted: true });

        // Create an activity log entry
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Lead Conversion',
            remark: `Lead converted to contract. Contract ID: ${newContract._id}. Service Commission ID: ${newServiceCommission._id}.`,
            created_at: Date.now(),
            updated_at: Date.now()
        });
        await activityLog.save();

        // Push the activity log ID to the lead
        const updatedLead = await Lead.findById(leadId);
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        res.status(201).json({ message: 'Contract created and lead converted successfully', contract: newContract });
    } catch (error) {
        console.error('Error converting lead to contract:', error);
        res.status(500).json({ message: 'Failed to convert lead to contract' });
    }
});
// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../lead_files');

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

// Allow multiple file uploads
const upload = multer({ storage }).array('files', 10); // Max 10 files at a time (you can adjust this)
// Route to handle multiple file uploads and link to the lead
router.post('/upload-files/:leadId', isAuth, hasPermission(['file_upload']), (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading files', error: err });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        try {
            const leadId = req.params.leadId;
            const lead = await Lead.findById(leadId);

            if (!lead) {
                return res.status(404).json({ message: 'Lead not found' });
            }

            // Array to store new file documents
            const fileDocs = [];
            const activityLogs = [];

            for (const file of req.files) {
                // Create a new file document with original name and path as the random filename
                const newFile = new File({
                    file_name: file.originalname, // Save the original filename here
                    file_path: `/lead_files/${file.filename}`, // Save the hex filename in the path
                    created_at: new Date(),
                    updated_at: new Date()
                });

                // Save the file document
                await newFile.save();
                fileDocs.push(newFile);

                // Push the file reference to the lead's files array
                lead.files.push(newFile._id);

                // Create an activity log for each file upload
                const activityLog = new ActivityLog({
                    log_type: 'File Uploaded',
                    remark: `File ${file.originalname} was uploaded by ${req.user.name || req.user.email}`,
                    user_id: req.user._id,
                    created_at: new Date()
                });

                // Save the activity log
                await activityLog.save();
                activityLogs.push(activityLog);

                // Push the activity log ID into the lead's activity_logs array
                lead.activity_logs.push(activityLog._id);
            }

            // Save the lead document with updated files and activity logs
            await lead.save();

            res.status(201).json({
                message: 'Files uploaded, associated with lead, and activity logged successfully',
                files: fileDocs,
                activity_logs: activityLogs
            });
        } catch (error) {
            console.error('Error uploading files:', error);
            res.status(500).json({ message: 'Error uploading files' });
        }
    });
});
/// Add Discussion in the lead Model  
router.post('/add-discussion/:leadId', isAuth, async (req, res) => {
    try {
        const { leadId } = req.params;
        const { comment } = req.body;

        // Check if comment is provided
        if (!comment) {
            return res.status(400).json({ message: 'Comment is required' });
        }

        // Find the lead by ID
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Create a new discussion
        const newDiscussion = new leadDiscussionModel({
            created_by: req.user._id,
            comment
        });

        // Save the new discussion
        await newDiscussion.save();

        // Add the discussion to the lead's discussions array
        lead.discussions.push(newDiscussion._id);
        await lead.save();

        // Create an activity log
        const activityLog = new ActivityLog({

            log_type: 'Discussion Added',
            remark: `Discussion added by ${req.user.name || req.user.email}: "${comment}"`,
            user_id: req.user._id,
            created_at: new Date()
        });

        // Save the activity log
        await activityLog.save();

        // Push the activity log ID into the lead's activity_logs array
        lead.activity_logs.push(activityLog._id);
        await lead.save();

        res.status(201).json({
            message: 'Discussion added successfully',
            discussion: newDiscussion,
            activity_log: activityLog
        });
    } catch (error) {
        console.error('Error adding discussion:', error);
        res.status(500).json({ message: 'Error adding discussion' });
    }
});

/// Transfer Lead 
router.put('/transfer-lead/:id', isAuth,hasPermission(['transfer_lead']),  async (req, res) => {
    try {
        const leadId = req.params.id;
        const { pipeline, branch, product_stage, products } = req.body;

        // Ensure required fields are provided
        if (!pipeline || !branch || !product_stage || !products) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const branchId = new mongoose.Types.ObjectId(String(branch));
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline));
        const productId = new mongoose.Types.ObjectId(String(products)); // Single ObjectId for products

        // Check if the lead exists
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Validate product_stage
        const validProductStage = await ProductStage.findById(productStageId);
        if (!validProductStage) {
            return res.status(400).json({ message: 'Invalid product stage' });
        }

        // Check if the previous product is the same as the new product
        if (String(lead.products) === String(productId)) {
            return res.status(403).json({ message: 'Cannot transfer the lead in the same product please change product' });
        }

        // Fetch names for old values
        const oldBranch = await Branch.findById(lead.branch).select('name');
        const oldPipeline = await Pipeline.findById(lead.pipeline_id).select('name');
        const oldProductStage = await ProductStage.findById(lead.product_stage).select('name');
        const oldProducts = lead.products;

        // Fetch names for new values
        const newBranch = await Branch.findById(branchId).select('name');
        const newPipeline = await Pipeline.findById(pipelineId).select('name');
        const newProductStage = await ProductStage.findById(productStageId).select('name');

        // Track changes
        let changes = [];
        if (String(lead.pipeline_id) !== String(pipelineId)) {
            changes.push(`Pipeline changed from ${oldPipeline.name} to ${newPipeline.name}`);
        }
        if (String(lead.branch) !== String(branchId)) {
            changes.push(`Branch changed from ${oldBranch.name} to ${newBranch.name}`);
        }
        if (String(lead.product_stage) !== String(productStageId)) {
            changes.push(`Product Stage changed from ${oldProductStage.name} to ${newProductStage.name}`);
        }
        if (String(lead.products) !== String(productId)) {
            const oldProduct = oldProducts ? await Product.findById(oldProducts) : { name: 'None' };
            const newProduct = await Product.findById(productId);
            changes.push(`Product changed from ${oldProduct.name} to ${newProduct.name}`);
        }

        // Update the products field
        lead.products = productId;

        // Find users based on roles and the same pipeline and branch
        const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
        const superadminUsers = await User.find({ role: 'superadmin' }).select('_id name');
        const mdUsers = await User.find({ role: 'MD' }).select('_id name');
        const hodUsers = await User.find({ role: 'HOD' , pipeline: pipelineId }).select('_id name'); // HOD with no branch filter
        const managerUsers = await User.find({
            role: 'Manager',
            branch: branchId, // Filter managers by branch
        }).select('_id name');
        // Find HOD users from the previous pipeline and previous branch 
        const previousPipelineId = lead.pipeline_id;
        const previousBranchId = lead.branch;

        const previousPipelineHodUsers = await User.find({
            role: 'HOD',
            pipeline: previousPipelineId,
            branch: previousBranchId
        }).select('_id');

        // Get the original creator of the lead
        const createdByUserId = lead.created_by.toString();

        // Combine all selected user IDs
        const newSelectedUserIds = [
            req.user._id.toString(),
            createdByUserId,
            ...previousPipelineHodUsers.map(user => user._id.toString()),
            ...ceoUsers.map(user => user._id.toString()),
            ...superadminUsers.map(user => user._id.toString()),
            ...mdUsers.map(user => user._id.toString()),
            ...hodUsers.map(user => user._id.toString()), // Include HOD without branch restriction
            ...managerUsers.map(user => user._id.toString()), // Manager filtered by branch
        ];

        // Merge selected users, ensuring there are no duplicates
        lead.selected_users = getUniqueUserIds(newSelectedUserIds);

        // Update the pipeline, branch, product_stage, and mark lead as transferred
        lead.pipeline_id = pipelineId;
        lead.branch = branchId;
        lead.product_stage = productStageId;
        lead.is_transfer = true;  // Set the is_transfer field to true 

        // Save the updated lead
        const updatedLead = await lead.save();

        // Create an activity log entry
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Lead Transfer',
            remark: changes.length ? `Lead transferred: ${changes.join(', ')}` : 'Lead transferred with no significant changes',
            created_at: Date.now(),
            updated_at: Date.now()
        });
        await activityLog.save();

        // Push the activity log ID to the lead
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        res.status(200).json({ message: 'Lead transferred successfully', lead: updatedLead });
    } catch (error) {
        console.error('Error transferring lead:', error);
        res.status(500).json({ message: 'Error transferring lead' });
    }
});

const getUniqueUserIds = (userIds) => {
    const uniqueUserMap = {};
    userIds.forEach(id => {
        if (id) {
            uniqueUserMap[id] = true;
        }
    });
    return Object.keys(uniqueUserMap);
};
// New route to move lead (Update pipeline, branch, product_stage)
router.put('/move-lead/:id', isAuth, hasPermission(['move_lead']), async (req, res) => {
    try {
        const leadId = req.params.id;
        const { pipeline, branch, product_stage } = req.body;

        // Ensure required fields are provided
        if (!pipeline || !branch || !product_stage) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const branchId = new mongoose.Types.ObjectId(String(branch));
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline));

        // Check if the lead exists
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Validate product_stage
        const validProductStage = await ProductStage.findById(productStageId);
        if (!validProductStage) {
            return res.status(400).json({ message: 'Invalid product stage' });
        }

        // Initialize variables for tracking changes
        let changes = [];
        let updatedSelectedUsers = [...lead.selected_users]; // Keep previous selected users

        // Fetch names for old values
        const oldBranch = await Branch.findById(lead.branch).select('name');
        const oldPipeline = await Pipeline.findById(lead.pipeline_id).select('name');
        const oldProductStage = await ProductStage.findById(lead.product_stage).select('name');

        // Fetch names for new values
        const newBranch = await Branch.findById(branchId).select('name');
        const newPipeline = await Pipeline.findById(pipelineId).select('name');
        const newProductStage = await ProductStage.findById(productStageId).select('name');

        // Track changes in pipeline, branch, and product_stage
        if (String(lead.pipeline_id) !== String(pipelineId)) {
            changes.push(`Pipeline changed from ${oldPipeline?.name} to ${newPipeline.name}`);
        }
        if (String(lead.branch) !== String(branchId)) {
            changes.push(`Branch changed from ${oldBranch?.name} to ${newBranch.name}`);
        }
        if (String(lead.product_stage) !== String(productStageId)) {
            changes.push(`Product Stage changed from ${oldProductStage?.name} to ${newProductStage.name}`);
        }

        // Fetch additional users based on the new pipeline and branch
        const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
        const superadminUsers = await User.find({ role: 'superadmin' }).select('_id name');
        const mdUsers = await User.find({ role: 'MD' }).select('_id name');
        const hodUsers = await User.find({ role: 'HOD', pipeline:pipelineId }).select('_id name'); // HOD with no branch filter
        const managerUsers = await User.find({
            pipeline:pipelineId,
            role: 'Manager',
            branch: branchId, // Filter managers by the new branch
        }).select('_id name');

        // Include created_by user from the lead
        const createdByUser = lead.created_by ? await User.findById(lead.created_by).select('_id name') : null;

        // Combine all selected user IDs while keeping previous selected users
        const allSelectedUsers = [
            req.user._id.toString(), // Include the currently authenticated user
            createdByUser ? createdByUser._id.toString() : null, // Include the created_by user if it exists
            ...ceoUsers.map(user => user._id.toString()),
            ...superadminUsers.map(user => user._id.toString()),
            ...mdUsers.map(user => user._id.toString()),
            ...hodUsers.map(user => user._id.toString()), // Include HOD without branch restriction
            ...managerUsers.map(user => user._id.toString()), // Manager filtered by branch
            ...updatedSelectedUsers.map(user => user.toString()), // Keep previous selected users
        ].filter(Boolean); // Filter out any null or undefined values

        // Filter out duplicate IDs and update the lead's selected_users
        updatedSelectedUsers = getUniqueUserIds(allSelectedUsers);
        lead.selected_users = updatedSelectedUsers;

        // Update the pipeline, branch, and product_stage
        lead.pipeline_id = pipelineId;
        lead.branch = branchId;
        lead.product_stage = productStageId;

        // Save the updated lead
        const updatedLead = await lead.save();

        // Create an activity log entry
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Lead Movement',
            remark: changes.length ? `Lead moved: ${changes.join(', ')}` : 'Lead moved with no significant changes',
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        await activityLog.save();

        // Push the activity log ID to the lead
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        res.status(200).json({ message: 'Lead moved successfully', lead: updatedLead });
    } catch (error) {
        console.error('Error moving lead:', error);
        res.status(500).json({ message: 'Error moving lead' });
    }
});

router.get('/single-lead/:id', isAuth, hasPermission(['view_lead']),async (req, res) => {
    try {
        const { id } = req.params; // Extract lead ID from request parameters

        // Validate the ID format
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid lead ID format' });
        }

        // Find the lead by ID and populate necessary fields, including specific fields for nested documents
        const lead = await Lead.findById(id)
            .populate({
                path: 'client',
                select: 'name email phone w_phone e_id'
            })
            .populate({
                path: 'created_by',
                select: 'name role'
            })
            .populate({
                path: 'selected_users',
                match: { role: { $nin: [ 'CEO', 'MD','Developer','Marketing'] } },  
                select: 'name role image', 
            })
            .populate({
                path: 'pipeline_id',
                select: 'name'
            })
            .populate({
                path: 'product_stage',
                select: 'name'
            })
            .populate({
                path: 'lead_type',
                select: 'name'
            })
            .populate({
                path: 'source',
                select: 'name'
            })
            .populate({
                path: 'products',
                select: 'name'
            })
            .populate({
                path: 'branch',
                select: 'name'
            })
            .populate({
                path: 'labels',  
                select: 'name color', 
            })
            .populate({
                path: 'messages',
                populate: [
                    {
                        path: 'client', 
                        select: 'name'
                    },
                    {
                        path: 'user', 
                        select: 'name'
                    }
                ]
            })
            .populate({
                path: 'discussions',
                populate: {
                    path: 'created_by',
                    select: 'name image'
                }
            })
            .populate({
                path: 'files',
                // You can uncomment the following if you want to populate the `created_by` in `files`
                // populate: {
                //     path: 'created_by',
                //     select: 'name image'
                // }
            })
            .populate({
                path: 'activity_logs',
                populate: {
                    path: 'user_id', // Assuming `user_id` references a User model
                    select: 'name image' // Select both name and image fields from the User model
                }
            });

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Update product_stage of a lead
router.put('/update-product-stage/:leadId', isAuth, hasPermission(['update_product_stage']), async (req, res) => {
    const { leadId } = req.params;
    const { newProductStageId } = req.body;

    if (!newProductStageId) {
        return res.status(400).json({ message: 'New product stage ID is required' });
    }

    try {
        const newProductStage = await ProductStage.findById(newProductStageId);
        if (!newProductStage) {
            return res.status(404).json({ message: 'Product stage not found' });
        }

        const lead = await Lead.findById(leadId).populate('product_stage selected_users client');
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Check if the user is authorized
        if (!lead.selected_users.some(user => user._id.equals(req.user._id))) {
            return res.status(403).json({ message: 'You are not authorized to update this lead' });
        }

        const previousStageName = lead.product_stage.name; // Store the previous stage name

        // Check if the product stage is already at the desired value
        if (previousStageName === newProductStage.name) {
            return res.status(200).json({ message: 'Product stage is already at the desired value', lead });
        }

        // Create an activity log for the update
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Product Stage Update',
            remark: `Product Stage of ${lead.client.name} has been changed from ${previousStageName} to ${newProductStage.name}`,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        const savedActivityLog = await activityLog.save();

        // Update the lead with the new product stage and log
        lead.product_stage = newProductStage._id;
        lead.updated_at = Date.now();
        lead.activity_logs.push(savedActivityLog._id);
        await lead.save();

        const io = getIO(); // Initialize socket IO
        const notifications = [];

        // Send notification to each selected user
        for (const user of lead.selected_users) {
            // Create and save the notification using the polymorphic reference
            const newNotification = new Notification({
                receiver: user._id,
                message: `Product Stage of ${lead.client.name} has been changed from ${previousStageName} to ${newProductStage.name}`,
                reference_id: lead._id,
                notification_type: 'Lead', // Polymorphic reference to Lead
                created_at: Date.now(),
            });

            const savedNotification = await newNotification.save();
            notifications.push(savedNotification);

            // Emit notification to the correct user room via WebSockets
            io.to(`user_${user._id}`).emit('notification', {
                message: newNotification.message,
                referenceId: savedNotification.reference_id, // Send the lead's ID
                notificationType: savedNotification.notification_type, // Send the polymorphic type
                notificationId: savedNotification._id, // Send the notification ID
                createdAt: savedNotification.created_at,
            });
        }

        // Respond with success
        res.status(200).json({
            message: 'Product stage updated successfully, notifications sent',
            lead,
            activity_log: savedActivityLog,
            notifications,
        });
    } catch (error) {
        console.error('Error updating product stage:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/restore-lead/:id', isAuth, async (req, res) => {
    try {
        const { description, branch, product_stage, products, pipeline_id } = req.body;
        const leadId = req.params.id;

        // Convert to ObjectIds where necessary
        const branchId = new mongoose.Types.ObjectId(String(branch));
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        const productId = new mongoose.Types.ObjectId(String(products));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline_id));

        // Check for product_stage validity
        const validProductStage = await ProductStage.findById(productStageId);
        if (!validProductStage) {
            return res.status(400).json({ message: 'Invalid product stage' });
        }

        // Find the lead by ID to get previous values
        const lead = await Lead.findById(leadId)
            .populate('branch', 'name')
            .populate('product_stage', 'name')
            .populate('products', 'name')
            .populate('pipeline_id', 'name')
            .exec();

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Prepare previous values for logging and comparison
        const previousProductId = lead.products?.toString();
        const previousPipelineId = lead.pipeline_id?.toString();

        let selectedUsers;

        // Check if products or pipeline_id have changed
        if (previousProductId !== productId.toString() || previousPipelineId !== pipelineId.toString()) {
            // Fetch new selected users based on the updated pipeline and branch
            const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
            const superadminUsers = await User.find({ role: 'superadmin' }).select('_id name');
            const mdUsers = await User.find({ role: 'MD' }).select('_id name');
            const managerUsers = await User.find({
                $or: [
                    { role: 'Manager', branch: branchId, pipeline: pipelineId },
                    { role: 'Manager', branch: null, pipeline: pipelineId }
                ]
            }).select('_id name');
            const hodUsers = await User.find({ role: 'HOD', pipeline: pipelineId }).select('_id name');

            // Combine all selected user IDs, ensuring they are unique
            const allSelectedUserIds = [
                ...new Set([
                    ...ceoUsers.map(user => user._id.toString()),
                    ...superadminUsers.map(user => user._id.toString()),
                    ...mdUsers.map(user => user._id.toString()),
                    ...hodUsers.map(user => user._id.toString()),
                    ...managerUsers.map(user => user._id.toString())
                ])
            ];

            // Update selected users with new unique IDs
            selectedUsers = allSelectedUserIds;
        } else {
            // Retain the existing selected_users if products and pipeline_id are the same
            selectedUsers = lead.selected_users;
        }

        // Prepare previous values for logging
        const previousBranchName = lead.branch?.name || 'N/A';
        const previousProductStageName = (await ProductStage.findById(lead.product_stage)).name || 'N/A';
        const previousProductName = (await Product.findById(lead.products)).name || 'N/A';
        const previousPipelineName = (await Pipeline.findById(lead.pipeline_id)).name || 'N/A';

        // Update the lead with new values
        const updatedLead = await Lead.findByIdAndUpdate(
            leadId,
            {
                is_reject: false,
                description,
                branch: branchId,
                product_stage: productStageId,
                products: productId,
                pipeline_id: pipelineId,
                selected_users: selectedUsers
            },
            { new: true }
        ).exec();

        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Fetch new values for logging
        const newBranchName = (await Branch.findById(branchId)).name;
        const newProductStageName = (await ProductStage.findById(productStageId)).name;
        const newProductName = (await Product.findById(productId)).name;
        const newPipelineName = (await Pipeline.findById(pipelineId)).name;

        // Log the restoration activity with previous and new values
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Lead Restoration',
            remark: `Lead restored. Previous - Branch: ${previousBranchName}, Product Stage: ${previousProductStageName}, Product: ${previousProductName}, Pipeline: ${previousPipelineName}. New - Branch: ${newBranchName}, Product Stage: ${newProductStageName}, Product: ${newProductName}, Pipeline: ${newPipelineName}.`,
            created_at: Date.now(),
            updated_at: Date.now()
        });
        await activityLog.save();

        // Add the activity log ID to the lead's activity logs
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        res.status(200).json(updatedLead);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/edit-lead/:id',  isAuth, hasPermission(['edit_lead']), async (req, res) => {
    try {
        const {
            clientPhone,
            clientName,
            clientEmail,
            cliente_id,  // new field for client e_id
            clientw_phone,  // new field for client w_phone
            product_stage,
            company_Name,
            lead_type,
            pipeline,
            products,
            source,
            description,
            branch,
            selected_users
        } = req.body;

        const leadId = req.params.id;
        const branchId = new mongoose.Types.ObjectId(String(branch));
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        const leadTypeId = new mongoose.Types.ObjectId(String(lead_type));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline));
        const sourceId = new mongoose.Types.ObjectId(String(source));
        const productId = new mongoose.Types.ObjectId(String(products));

        // Check for product_stage validity
        const validProductStage = await ProductStage.findById(productStageId);
        if (!validProductStage) {
            return res.status(400).json({ message: 'Invalid product stage' });
        }

        // Find the lead to get the previous state
        const lead = await Lead.findById(leadId).populate('selected_users', 'name').exec();
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        let client = await Client.findOne({ phone: clientPhone });
        // Capture the previous state of the lead
        const previousState = {
            clientName: client?.name,
            clientEmail: client?.email,
            clientPhone: client?.phone,
            cliente_id: client?.e_id,
            clientw_phone: client?.w_phone,
            company_Name: lead?.company_Name || null, // Previous company name
            product_stage: (await ProductStage.findById(lead.product_stage).select('name')).name,
            lead_type: (await LeadType.findById(lead.lead_type).select('name')).name,
            pipeline_id: (await Pipeline.findById(lead.pipeline_id).select('name')).name,
            source: (await Source.findById(lead.source).select('name')).name,
            products: (await Product.findById(lead.products).select('name')).name,
            description: lead.description,
            selected_users: lead.selected_users.map(user => ({ id: user._id.toString(), name: user.name }))
        };

        // Track client updates 
        let clientUpdated = false;

        // Update client name
        if (clientName && client?.name !== clientName) {
            client.name = clientName;
            clientUpdated = true;
        }

        // Update client email
        if (clientEmail && client?.email !== clientEmail) {
            client.email = clientEmail;
            clientUpdated = true;
        }

        // Update client phone
        if (clientPhone && client?.phone !== clientPhone) {
            client.phone = clientPhone;
            clientUpdated = true;
        }

        // Update client w_phone if provided
        if (clientw_phone && client?.w_phone !== clientw_phone) {
            client.w_phone = clientw_phone;
            clientUpdated = true;
        }

        // Update cliente_id (e_id) if provided
        if (cliente_id && client?.e_id !== cliente_id) {
            client.e_id = cliente_id;
            clientUpdated = true;
        }

        // Save the client if any updates were made
        if (clientUpdated) {
            await client.save();
        }
        // Convert selected_users to ObjectId format
        const selectedUserIds = selected_users.map(user => {
            try {
                return new mongoose.Types.ObjectId(String(user));
            } catch (error) {
                console.error('Invalid user ID:', user);
                return null;
            }
        }).filter(id => id !== null);

        const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
        const superadminUsers = await User.find({ role: 'superadmin' }).select('_id name');
        const mdUsers = await User.find({ role: 'MD' }).select('_id name');
        const hodUsers = await User.find({ role: 'HOD' }).select('_id name'); // HOD with no branch filter
        const managerUsers = await User.find({
            role: 'Manager',
            branch: branchId, // Filter managers by the new branch
        }).select('_id name');

        const allSelectedUserIds = [
            req.user._id.toString(),
            ...selectedUserIds,
            ...ceoUsers.map(user => user._id.toString()),
            ...mdUsers.map(user => user._id.toString()),
            ...superadminUsers.map(user => user._id.toString()),
            ...hodUsers.map(user => user._id.toString()), // Include HOD without branch restriction
            ...managerUsers.map(user => user._id.toString()), // Manager filtered by branch
        ];

        const getUniqueUserIds = (userIds) => {
            const uniqueUserMap = {};
            userIds.forEach(id => {
                if (!uniqueUserMap[id]) {
                    uniqueUserMap[id] = true;
                }
            });
            return Object.keys(uniqueUserMap);
        };

        const uniqueUserIds = getUniqueUserIds(allSelectedUserIds);

        // Fetch the names for product_stage, lead_type, pipeline, source, and products
        const productStage = await ProductStage.findById(productStageId).select('name');
        const leadType = await LeadType.findById(leadTypeId).select('name');
        const pipelineObj = await Pipeline.findById(pipelineId).select('name');
        const sourceObj = await Source.findById(sourceId).select('name');
        const product = await Product.findById(productId).select('name');

        // Prepare updates
        const updates = {
            client: client._id,
            updated_by: req.user._id,
            selected_users: uniqueUserIds,
            pipeline_id: pipelineId,
            lead_type: leadTypeId,
            source: sourceId,
            product_stage: productStageId,
            products: productId,
            company_Name,  // Add company name to the updates
            description,
            branch: branchId
        };

        // Update lead
        const updatedLead = await Lead.findByIdAndUpdate(
            leadId,
            updates,
            { new: true }
        ).populate('selected_users', 'name').exec();

        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Capture the new state of the lead
        const newState = {
            clientName: (await Client.findById(updatedLead.client)).name,
            clientEmail: (await Client.findById(updatedLead.client)).email,
            clientPhone: (await Client.findById(updatedLead.client)).phone,
            product_stage: (await ProductStage.findById(updatedLead.product_stage).select('name')).name,
            lead_type: (await LeadType.findById(updatedLead.lead_type).select('name')).name,
            pipeline_id: (await Pipeline.findById(updatedLead.pipeline_id).select('name')).name,
            source: (await Source.findById(updatedLead.source).select('name')).name,
            products: (await Product.findById(updatedLead.products).select('name')).name,
            description: updatedLead.description,
            company_Name: updatedLead.company_Name,
            branch: updatedLead.branch,
            selected_users: updatedLead.selected_users.map(user => ({ id: user._id.toString(), name: user.name }))
        };

        // Determine added and removed users
        const previousUserIds = new Set(previousState.selected_users.map(user => user.id));
        const newUserIds = new Set(newState.selected_users.map(user => user.id));

        const addedUsers = newState.selected_users.filter(user => !previousUserIds.has(user.id));
        const removedUsers = previousState.selected_users.filter(user => !newUserIds.has(user.id));

        const addedUserNames = addedUsers.map(user => user.name);
        const removedUserNames = removedUsers.map(user => user.name).join(', ');

        // Determine changes
        const changes = [];
        if (addedUserNames.length) changes.push(`Added users: ${addedUserNames.join(', ')}`);
        if (removedUserNames) changes.push(`Removed users: ${removedUserNames}`);
        // Track client changes
        if (clientName && (clientName !== previousState.clientName)) {
            changes.push(`Client name changed from ${previousState.clientName} to ${clientName}`);
        }
        if (clientEmail && (clientEmail !== previousState.clientEmail)) {
            changes.push(`Client email changed from ${previousState.clientEmail} to ${clientEmail}`);
        }
        if (clientPhone && (clientPhone !== previousState.clientPhone)) {
            changes.push(`Client phone changed from ${previousState.clientPhone} to ${clientPhone}`);
        }
        if (company_Name && company_Name !== previousState.company_Name) changes.push(`Company name changed from ${previousState.company_Name} to ${company_Name}`);
        for (const key in previousState) {
            if (Array.isArray(previousState[key])) continue; // Skip array comparison for simplicity
            if (previousState[key] !== newState[key]) {
                changes.push(`${key} changed from ${previousState[key]} to ${newState[key]}`);
            }
        }

        // Create an activity log entry
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Lead Update',
            remark: changes.length ? `Lead updated: ${changes.join(', ')}` : 'Lead updated with no changes',
            created_at: Date.now(),
            updated_at: Date.now()
        });
        await activityLog.save();

        // Push the activity log ID to the lead
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        res.status(200).json(updatedLead);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Route to create a new lead
// Initialize Twilio client

// router.post('/create-lead', isAuth, async (req, res) => {
//     try {
//         const {
//             clientPhone,
//             clientw_phone, // WhatsApp phone
//             clientName,
//             clientEmail,
//             cliente_id,
//             company_Name,
//             product_stage,
//             lead_type,
//             pipeline,
//             products,
//             source,
//             description,
//             branch,
//             thirdpartyname // New field to be added
//         } = req.body;

//         // Check for missing required fields
//         if (!product_stage || !lead_type || !source) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }

//         const branchId = new mongoose.Types.ObjectId(String(branch));
//         const productStageId = new mongoose.Types.ObjectId(String(product_stage));
//         let leadTypeId = new mongoose.Types.ObjectId(String(lead_type));
//         const pipelineId = new mongoose.Types.ObjectId(String(pipeline));
//         let sourceId = new mongoose.Types.ObjectId(String(source));
//         const productId = new mongoose.Types.ObjectId(String(products)); // Single ObjectId

//         // Check for product_stage validity
//         const validProductStage = await ProductStage.findById(productStageId);
//         if (!validProductStage) {
//             return res.status(400).json({ message: 'Invalid product stage' });
//         }

//         // Check for lead_type validity
//         const validLeadType = await LeadType.findById(leadTypeId);
//         if (!validLeadType) {
//             return res.status(400).json({ message: 'Invalid lead type' });
//         }

//         // Find the client by phone in the Phonebook
//         const phonebookEntry = await Phonebook.findOne({ phone: clientPhone });

//         // If the client is found in the phonebook, set lead type to "Tele Sales" and source to "Phone"
//         if (phonebookEntry) {
//             const teleSalesLeadType = await LeadType.findOne({ name: "Tele Sales" });
//             const phoneSource = await Source.findOne({ name: "Phone" });

//             if (teleSalesLeadType && phoneSource) {
//                 leadTypeId = teleSalesLeadType._id; // Set lead_type to Tele Sales
//                 sourceId = phoneSource._id;         // Set source to Phone
//             } else {
//                 return res.status(500).json({ message: 'Tele Sales lead type or Phone source not found' });
//             }
//         }

//         // Find the client by phone in the Client collection
//         let client = await Client.findOne({ phone: clientPhone });

//         // If no client exists, create a new one
//         if (!client) {
//             const whatsappPhone = clientw_phone || clientPhone; // If no w_phone is provided, set it to clientPhone
//             const defaultPassword = '123';
//             const hashedPassword = await bcrypt.hash(defaultPassword, 10);

//             client = new Client({
//                 phone: clientPhone,
//                 w_phone: whatsappPhone,
//                 e_id: cliente_id,
//                 name: clientName || '',
//                 email: clientEmail || '',
//                 password: hashedPassword,
//             });
//             await client.save();
//         }

//         // Get selected_users from request or default to empty array
//         const initialSelectedUsers = req.body.selected_users || [];

//         // Extract user IDs from initialSelectedUsers
//         const initialUserIds = initialSelectedUsers.map(user => user._id.toString());

//         // Find users with specific roles filtered by pipeline
//         const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
//         const superadminUsers = await User.find({ role: 'superadmin' }).select('_id name');
//         const mdUsers = await User.find({ role: 'MD' }).select('_id name');

//         // Filter Manager users by branch and pipeline
//         const managerUsers = await User.find({
//             $or: [
//                 {
//                     role: 'Manager',
//                     branch: branchId,
//                     pipeline: pipelineId // Filter by pipeline
//                 },
//                 {
//                     role: 'Manager',
//                     branch: null, // Include managers with null branch
//                     pipeline: pipelineId // Filter by pipeline
//                 }
//             ]
//         }).select('_id name');

//         // Filter HOD users by pipeline (assuming there's a relationship)
//         const hodUsers = await User.find({
//             role: 'HOD',
//             pipeline: pipelineId // Filter by pipeline
//         }).select('_id name');

//         // Combine initial user IDs and other role-based user IDs
//         let allSelectedUserIds = [
//             ...initialUserIds, // Add initial user IDs
//             ...ceoUsers.map(user => user._id.toString()),
//             ...superadminUsers.map(user => user._id.toString()),
//             ...mdUsers.map(user => user._id.toString()),
//             ...hodUsers.map(user => user._id.toString()), // Include HOD without branch restriction
//             ...managerUsers.map(user => user._id.toString()), // Manager filtered by branch and pipeline
//             req.user._id.toString() // Include the current user who is creating the lead
//         ];

//         // If lead_type is "Marketing", add users with role 'Marketing', 'Marketing HOD', 'Developer'
//         if (validLeadType.name === 'Marketing') {
//             const marketingUsers = await User.find({ role: 'Marketing' }).select('_id name');
//             const developerUsers = await User.find({ role: 'Developer' }).select('_id name');

//             allSelectedUserIds = [
//                 ...allSelectedUserIds,
//                 ...marketingUsers.map(user => user._id.toString()),
//                 ...developerUsers.map(user => user._id.toString())
//             ];
//         }

//         // Function to get unique user IDs
//         const getUniqueUserIds = (userIds) => {
//             const uniqueUserMap = {};
//             userIds.forEach(id => {
//                 if (!uniqueUserMap[id]) {
//                     uniqueUserMap[id] = true;
//                 }
//             });
//             return Object.keys(uniqueUserMap);
//         };

//         const uniqueUserIds = getUniqueUserIds(allSelectedUserIds);

//         // Check for existing leads for the client
//         const existingLeads = await Lead.find({ client: client._id });

//         // Find any rejected leads
//         const rejectedLead = existingLeads.find(lead => lead.is_reject === true);

//         if (rejectedLead) {
//             // If a rejected lead exists, update it instead of deleting
//             rejectedLead.product_stage = productStageId;
//             rejectedLead.lead_type = leadTypeId;
//             rejectedLead.pipeline_id = pipelineId;
//             rejectedLead.source = sourceId;
//             rejectedLead.products = productId;
//             rejectedLead.description = description;
//             rejectedLead.company_Name = company_Name;
//             rejectedLead.branch = branchId;

//             // Store thirdpartyname if provided
//             if (thirdpartyname) {
//                 rejectedLead.thirdpartyname = thirdpartyname; // Store thirdpartyname in rejected lead
//             }

//             // Keep the original created_by and update selected_users
//             rejectedLead.selected_users = getUniqueUserIds([...rejectedLead.selected_users.map(id => id.toString()), ...uniqueUserIds]);

//             await rejectedLead.save();

//             // Log activity for updating rejected lead
//             const activityLog = new ActivityLog({
//                 lead_id: rejectedLead._id,
//                 log_type: 'Lead Updated',
//                 remark: `Rejected lead updated by ${req.user.name || req.user.email} for client ${client.name || client.phone}`,
//                 user_id: req.user._id,
//                 updated_at: new Date()
//             });

//             await activityLog.save();

//             // Push the activity log into the lead's activity_logs array
//             rejectedLead.activity_logs.push(activityLog._id);
//             await rejectedLead.save();

//             return res.status(200).json(rejectedLead);
//         }

//         // Create a new lead if no rejected lead exists
//         const newLead = new Lead({
//             client: client._id,
//             created_by: req.user._id,
//             selected_users: uniqueUserIds,
//             pipeline_id: pipelineId,
//             lead_type: leadTypeId,
//             source: sourceId,
//             product_stage: productStageId,
//             products: productId,
//             description,
//             company_Name,
//             branch: branchId,
//             thirdpartyname // Store thirdpartyname in the new lead
//         });

//         await newLead.save();

//         // Send WhatsApp message after successfully creating a lead
//         const messageBody = `
//             Thanks for registering with us! Your application will be reviewed soon. 
//             Click the below link to install our mobile application and know your application status.`;

//         // Sending WhatsApp message
//         await client.messages.create({
//             from: fromWhatsAppNumber,
//             to: `whatsapp:${clientw_phone || clientPhone}`, // Send to WhatsApp phone
//             body: messageBody
//         });

//         // Log activity for new lead creation
//         const activityLog = new ActivityLog({
//             lead_id: newLead._id,
//             log_type: 'Lead Created',
//             remark: `New lead created by ${req.user.name || req.user.email} for client ${client.name || client.phone}`,
//             user_id: req.user._id,
//             updated_at: new Date()
//         });

//         await activityLog.save();

//         // Push the activity log into the lead's activity_logs array
//         newLead.activity_logs.push(activityLog._id);
//         await newLead.save();

//         return res.status(201).json(newLead);
//     } catch (error) {
//         console.error('Error creating lead:', error);
//         return res.status(500).json({ message: 'Server error while creating lead' });
//     }
// });

module.exports = router;
