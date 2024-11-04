const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('../models/userModel');
const Client = require('../models/clientModel');
const Lead = require('../models/leadModel');
const ServiceCommission = require('../models/serviceCommissionModel');
const DealActivityLog = require('../models/dealActivityLogModel');
const Pipeline = require('../models/pipelineModel');
const Source = require('../models/sourceModel');
const LeadType = require('../models/leadTypeModel');
const Product = require('../models/productModel'); 
const DealStage = require('../models/dealStageModel');
const contractModel = require('../models/contractModel');


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transfer', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
});

// Load JSON file helper
const loadJSON = (filePath) => {
    const fullPath = path.join(__dirname, '../data', filePath);
    const rawData = fs.readFileSync(fullPath);
    return JSON.parse(rawData);
};

const dealStagesData = loadJSON('deal_stages.json');
const leadTypesData = loadJSON('lead_types.json');
const pipelinesData = loadJSON('pipelines.json');
const sourcesData = loadJSON('sources.json');
const productsData = loadJSON('products.json');
const labelsData = loadJSON('labels.json');
const usersData = loadJSON('users.json');
const clientsData = loadJSON('clients.json');
const dealsData = loadJSON('deals.json');
const serviceCommissionsData = loadJSON('service_commissions.json');
const dealActivitiesData = loadJSON('deal_activity.json');

// Utility Functions

const findOrCreateDealStage = async (dealStageName) => {
    try {
        let dealStage = await DealStage.findOne({ name: dealStageName });
        if (!dealStage) {
            dealStage = new DealStage({
                name: dealStageName,
                created_at: new Date(),
                updated_at: new Date(),
            });
            await dealStage.save();
        }
        return dealStage._id;
    } catch (error) {
        console.error(`Error finding or creating deal stage "${dealStageName}":`, error);
        throw error;
    }
};

const findOrCreatePipeline = async (pipelineData) => {
    try {
        let pipeline = await Pipeline.findOne({ name: pipelineData.name });
        if (!pipeline) {
            pipeline = new Pipeline({
                name: pipelineData.name,
                created_by: pipelineData.created_by,
                created_at: new Date(pipelineData.created_at),
                updated_at: new Date(pipelineData.updated_at),
            });
            await pipeline.save();
        }
        return pipeline._id;
    } catch (error) {
        console.error('Error finding or creating pipeline:', error);
        throw error;
    }
};

const findOrCreateLeadType = async (leadTypeData) => {
    try {
        let leadType = await LeadType.findOne({ name: leadTypeData.name });
        if (!leadType) {
            leadType = new LeadType({
                name: leadTypeData.name,
                created_by: leadTypeData.created_by,
                created_at: new Date(leadTypeData.created_at),
                updated_at: new Date(leadTypeData.updated_at),
            });
            await leadType.save();
        }
        return leadType._id;
    } catch (error) {
        console.error('Error finding or creating lead type:', error);
        throw error;
    }
};

const findOrCreateSource = async (sourceData, leadTypesMap) => {
    try {
        const leadTypeId = leadTypesMap.get(sourceData.lead_type_id);
        if (!leadTypeId) {
            throw new Error(`Lead type ID ${sourceData.lead_type_id} not found.`);
        }

        let source = await Source.findOne({ name: sourceData.name });
        if (!source) {
            source = new Source({
                name: sourceData.name,
                lead_type_id: leadTypeId, 
                created_by: sourceData.created_by,
                created_at: new Date(sourceData.created_at),
                updated_at: new Date(sourceData.updated_at),
            });
            await source.save();
        }
        return source._id;
    } catch (error) {
        console.error('Error finding or creating source:', error);
        throw error;
    }
};

const mapUserData = (userJson, pipelinesMap) => {
    const pipelineId = pipelinesMap.get(userJson.pipeline);
    const role = `${pipelineId}_${userJson.type}`;
    return {
        name: userJson.name,
        email: userJson.email,
        password: userJson.password, // Ensure passwords are hashed in a real-world scenario
        image: userJson.avatar,
        role: role,
        branch: userJson.branch || 'Abu Dhabi',
        permissions: [],
        delStatus: userJson.delete_status === '1',
        verified: userJson.is_email_verified === '1',
    };
};

const findOrCreateUserById = async (userId, usersDataMap, pipelinesMap) => {
    try {
        const userJson = usersDataMap.get(userId);
        if (!userJson) {
            console.error(`User data for ID ${userId} not found.`);
            return null;
        }
        const mappedUserData = mapUserData(userJson, pipelinesMap);
        const { email } = mappedUserData;

        const user = await User.findOneAndUpdate(
            { email },
            mappedUserData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return user._id;
    } catch (error) {
        console.error(`Error finding or creating user with ID ${userId}:`, error);
        throw error;
    }
};

const findOrCreateClient = async (clientData) => {
    try {
        let client = await Client.findOne({ phone: clientData.phone });
        if (!client) {
            client = new Client({
                name: clientData.name,
                email: clientData.email,
                phone: clientData.phone,
                created_at: new Date(clientData.created_at),
                updated_at: new Date(clientData.updated_at),
            });
            await client.save();
        }
        return client._id;
    } catch (error) {
        console.error('Error finding or creating client:', error);
        throw error;
    }
};

const findLeadByClientId = async (clientId) => {
    try {
        const lead = await Lead.findOne({ client: clientId });
        return lead ? lead._id : null;
    } catch (error) {
        console.error('Error finding lead by client ID:', error);
        throw error;
    }
};

const createDealActivityLog = async (userId, dealId, logType, remark) => {
    try {
        const activityLog = new DealActivityLog({
            user_id: userId,
            deal_id: dealId,
            log_type: logType,
            remark: JSON.stringify(remark),
            created_at: new Date(),
            updated_at: new Date(),
        });
        const savedActivityLog = await activityLog.save();
        return savedActivityLog._id;
    } catch (error) {
        console.error('Error creating deal activity log:', error);
        throw error;
    }
};

const findOrCreateProduct = async (productName) => {
    try {
        let product = await Product.findOne({ name: productName });
        if (!product) {
            product = new Product({
                name: productName,
            });
            await product.save();
        }
        return product._id;
    } catch (error) {
        console.error('Error finding or creating product:', error);
        throw error;
    }
};

// Mapping and Preprocessing Functions

const mapDealStages = async () => {
    const dealStagesMap = new Map();
    for (const dealStageData of dealStagesData) {
        const dealStageId = await findOrCreateDealStage(dealStageData.name);
        dealStagesMap.set(dealStageData.id, dealStageId);
    }
    return dealStagesMap;
};

const mapLeadTypes = async () => {
    const leadTypesMap = new Map();
    for (const leadTypeData of leadTypesData) {
        const leadTypeId = await findOrCreateLeadType(leadTypeData);
        leadTypesMap.set(leadTypeData.id, leadTypeId);
    }
    return leadTypesMap;
};

const mapPipelines = async () => {
    const pipelinesMap = new Map();
    for (const pipelineData of pipelinesData) {
        const pipelineId = await findOrCreatePipeline(pipelineData);
        pipelinesMap.set(pipelineData.id, pipelineId);
    }
    return pipelinesMap;
};

const mapSources = async (leadTypesMap) => {
    const sourcesMap = new Map();
    for (const sourceData of sourcesData) {
        const sourceId = await findOrCreateSource(sourceData, leadTypesMap);
        sourcesMap.set(sourceData.id, sourceId);
    }
    return sourcesMap;
};

const mapProducts = async () => {
    const productsMap = new Map();
    for (const productData of productsData) {
        const productId = await findOrCreateProduct(productData.name);
        productsMap.set(productData.id, productId);
    }
    return productsMap;
};

// Main Function to Load Deals

const loadDeals = async () => {
    try {
        // Preprocess and map data
        const dealStagesMap = await mapDealStages();
        const leadTypesMap = await mapLeadTypes();
        const pipelinesMap = await mapPipelines();
        const sourcesMap = await mapSources(leadTypesMap);
        const productsMap = await mapProducts();

        // Create a map for users data for quick access by ID
        const usersDataMap = new Map(usersData.map(user => [user.id, user]));

        // Create a map for labels
        const labelsMap = new Map(labelsData.map(label => [label.id, label.name]));

        // Iterate through each deal and process
        for (const deal of dealsData) {
            try {
                // Find and create client
                const clientData = clientsData.find(client => client.id === deal.client_id);
                if (!clientData) {
                    console.error(`Client with ID ${deal.client_id} not found in clients.json.`);
                    continue;
                }
                const clientId = await findOrCreateClient(clientData);

                // Find and create user
                const userId = await findOrCreateUserById(deal.created_by, usersDataMap, pipelinesMap);
                if (!userId) {
                    console.error(`User with ID ${deal.created_by} could not be created.`);
                    continue;
                }

                // Find lead
                const leadId = await findLeadByClientId(clientId);
                if (!leadId) {
                    console.error(`No lead found for client ID ${clientId}.`);
                    continue;
                }

                // Populate lead to get selected users
                const lead = await Lead.findById(leadId).populate('selected_users');
                const selectedUsers = lead.selected_users.map(user => user._id);

                // Determine deal stage
                const dealStageId = dealStagesMap.get(lead.deal_stage) || null;
                const isTransfer = deal.contract_stage === 'cm_signed';

                // Skip deal if isTransfer is true
                if (isTransfer) {
                    console.log(`Skipping deal ID ${deal.id} as it is marked as transfer.`);
                    continue;
                }

                // Map products
                const productIds = Array.isArray(deal.products) ? 
                    deal.products.map(productId => productsMap.get(productId) || productId) :
                    [productsMap.get(deal.products) || deal.products];

                // Map sources
                const sourceId = Array.isArray(deal.sources) ? 
                    deal.sources.map(sourceId => sourcesMap.get(sourceId) || sourceId) :
                    sourcesMap.get(deal.sources) || deal.sources;

                // Map labels
                const labelNames = deal.labels ? 
                    deal.labels.split(',').map(labelId => labelsMap.get(labelId.trim()) || 'Unknown') : 
                    [];

                // Transform deal data
                const transformedDeal = {
                    is_transfer: isTransfer,
                    client_id: clientId,
                    lead_type: leadTypesMap.get(deal.lead_type),
                    pipeline_id: pipelinesMap.get(deal.pipeline_id) || deal.pipeline_id,
                    source_id: sourceId,
                    products: productIds,
                    contract_stage: deal.contract_stage,
                    labels: labelNames,
                    status: deal.status,
                    created_by: userId,
                    is_active: deal.is_active === '1',
                    lead_id: leadId,
                    // deal_stage: dealStageId,
                    selected_users: selectedUsers,
                    date: new Date(deal.date),
                    created_at: new Date(deal.created_at),
                    updated_at: new Date(deal.updated_at),
                    activity_logs: [] // Will populate later
                };

                // Insert the Deal into MongoDB
                const newDeal = await contractModel.create(transformedDeal);

                // Handle Service Commissions
                const serviceCommissionData = serviceCommissionsData.find(sc => sc.deal_id === deal.id);
                if (serviceCommissionData) {
                    const serviceCommissionPayload = {
                        deal_id: newDeal._id,
                        finance_amount: parseFloat(serviceCommissionData.finance_amount) || 0,
                        bank_commission: parseFloat(serviceCommissionData.bank_commission) || 0,
                        customer_commission: parseFloat(serviceCommissionData.customer_commission) || 0,
                        with_vat_commission: parseFloat(serviceCommissionData.with_vat_commission) || 0,
                        without_vat_commission: parseFloat(serviceCommissionData.without_vat_commission) || 0,
                        hodsale: serviceCommissionData.hodsale ? await findOrCreateUserById(serviceCommissionData.hodsale, usersDataMap, pipelinesMap) : null,
                        hodsalecommission: parseFloat(serviceCommissionData.hodsalecommission) || 0,
                        salemanager: serviceCommissionData.salemanager ? await findOrCreateUserById(serviceCommissionData.salemanager, usersDataMap, pipelinesMap) : null,
                        salemanagercommission: parseFloat(serviceCommissionData.salemanagercommission) || 0,
                        coordinator: serviceCommissionData.coordinator ? await findOrCreateUserById(serviceCommissionData.coordinator, usersDataMap, pipelinesMap) : null,
                        coordinator_commission: parseFloat(serviceCommissionData.coordinator_commission) || 0,
                        team_leader: serviceCommissionData.team_leader ? await findOrCreateUserById(serviceCommissionData.team_leader, usersDataMap, pipelinesMap) : null,
                        team_leader_commission: parseFloat(serviceCommissionData.team_leader_commission) || 0,
                        salesagent: serviceCommissionData.salesagent ? await findOrCreateUserById(serviceCommissionData.salesagent, usersDataMap, pipelinesMap) : null,
                        salesagent_commission: parseFloat(serviceCommissionData.salesagent_commission) || 0,
                        salemanagerref: serviceCommissionData.salemanagerref ? await findOrCreateUserById(serviceCommissionData.salemanagerref, usersDataMap, pipelinesMap) : null,
                        salemanagerrefcommission: parseFloat(serviceCommissionData.salemanagerrefcommission) || 0,
                        agentref: serviceCommissionData.agentref ? await findOrCreateUserById(serviceCommissionData.agentref, usersDataMap, pipelinesMap) : null,
                        agent_commission: parseFloat(serviceCommissionData.agent_commission) || 0,
                        ts_hod: serviceCommissionData.ts_hod ? await findOrCreateUserById(serviceCommissionData.ts_hod, usersDataMap, pipelinesMap) : null,
                        ts_hod_commission: parseFloat(serviceCommissionData.ts_hod_commision) || 0, // Ensure field name consistency
                        ts_team_leader: serviceCommissionData.ts_team_leader ? await findOrCreateUserById(serviceCommissionData.ts_team_leader, usersDataMap, pipelinesMap) : null,
                        ts_team_leader_commission: parseFloat(serviceCommissionData.ts_team_leader_commission) || 0,
                        tsagent: serviceCommissionData.tsagent ? await findOrCreateUserById(serviceCommissionData.tsagent, usersDataMap, pipelinesMap) : null,
                        tsagent_commission: parseFloat(serviceCommissionData.tsagent_commission) || 0,
                    };

                    // Create Service Commission Document
                    const newServiceCommission = await ServiceCommission.create(serviceCommissionPayload);

                    // Push Service Commission ID into the Deal
                    await contractModel.findByIdAndUpdate(newDeal._id, {
                        service_commission_id: newServiceCommission._id,
                    });
                } else {
                    console.warn(`No service commission data found for deal ID ${deal.id}.`);
                }

                // Handle Activity Logs
                const activityLogs = dealActivitiesData.filter(activity => activity.deal_id === deal.id);
                const activityLogIds = [];

                for (const activity of activityLogs) {
                    const newLog = await createDealActivityLog(userId, newDeal._id, activity.log_type, activity.remark);
                    activityLogIds.push(newLog._id); // Store the activity log ID
                }

                // Update the Deal with activity logs
                await contractModel.findByIdAndUpdate(newDeal._id, { activity_logs: activityLogIds });

                console.log(`Successfully processed deal ID ${deal.id}.`);
            } catch (dealError) {
                console.error(`Error processing deal ID ${deal.id}:`, dealError);
            } 
        }

        console.log('All deals have been processed.');
    } catch (error) {
        console.error('Error loading deals:', error);
        throw error;
    }
};



// Run load deals function
loadDeals().then(() => {
    console.log('Deal loading process completed.');
}).catch(error => {
    console.error('Deal loading process failed:', error);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
