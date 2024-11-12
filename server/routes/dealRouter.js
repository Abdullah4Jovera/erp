// routes/dealRouter.js
const express = require('express');
const router = express.Router();
const Deal = require('../models/dealModel'); // Adjust the path to your Deal model
const { isAuth } = require('../utils');
const DealStage = require('../models/dealStageModel');
const DealActivityLog = require('../models/dealActivityLogModel');
const Notification = require('../models/notificationModel');
const { getIO } = require('../socket');


router.get('/get-deals', async (req, res) => {
  try {
    const deals = await Deal.find()
      .populate('client_id', 'name email') 
      .populate('created_by', 'name email') 
      .populate('pipeline_id', 'name') 
      .populate('lead_type', 'name') 
      .populate('deal_stage', 'name') 
      .populate('source_id', 'name') 
      .populate('products', 'name') 
      .populate({
        path: 'service_commission_id',
        populate: [
          { path: 'hodsale', select: 'name email' },           
          { path: 'salemanager', select: 'name email' },      
          { path: 'coordinator', select: 'name email' },       
          { path: 'team_leader', select: 'name email' },       
          { path: 'salesagent', select: 'name email' },        
          { path: 'team_leader_one', select: 'name email' },   
          { path: 'sale_agent_one', select: 'name email' },    
          { path: 'salemanagerref', select: 'name email' },    
          { path: 'agentref', select: 'name email' },          
          { path: 'ts_hod', select: 'name email' },            
          { path: 'ts_team_leader', select: 'name email' },    
          { path: 'tsagent', select: 'name email' },         
          { path: 'marketingmanager', select: 'name email' },  
        ]
      })
      .populate('activity_logs'); 

    res.status(200).json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ message: 'Error fetching deals' });
  }
});


// Update deal stage
router.put('/update-deal-stage/:id', isAuth, async (req, res) => {
  try {
      const { deal_stage } = req.body;
 
      // Validate input
      if (!deal_stage) {
          return res.status(400).json({ message: 'Deal stage is required' });
      }

      // Find the deal and populate the client field correctly
      const deal = await Deal.findById(req.params.id).populate('client_id'); // Corrected path to 'client_id'
      if (!deal) {
          return res.status(404).json({ message: 'Deal not found' });
      }

      // Store the previous deal stage ID
      const previousStageId = deal.deal_stage;

      // Find previous deal stage name
      const previousDealStage = await DealStage.findById(previousStageId);
      const previousStageName = previousDealStage ? previousDealStage.name : 'undefined';

      // Update the deal stage ID and timestamp
      deal.deal_stage = deal_stage; // Assuming deal_stage contains the ID of the new stage
      deal.updated_at = new Date(); // Update the timestamp

      // Save the updated deal
      const updatedDeal = await deal.save();

      // Find updated deal stage name
      const updatedDealStage = await DealStage.findById(deal_stage);
      const updatedStageName = updatedDealStage ? updatedDealStage.name : 'undefined';

      // Create a new activity log entry
      const activityLog = new DealActivityLog({
          user_id: req.user._id, // Assuming req.user contains the authenticated user's data
          deal_id: updatedDeal._id,
          log_type: 'Stage Update',
          remark: `Deal stage changed from '${previousStageName}' to '${updatedStageName}'`
      });

      const savedActivityLog = await activityLog.save(); // Save the activity log

      // Push the activity log ID into the deal's activity_logs array
      updatedDeal.activity_logs.push(savedActivityLog._id);
      await updatedDeal.save(); // Save the updated deal again to persist the activity log ID

      // Notify selected users
      const selectedUsers = deal.selected_users; // Assuming this field exists and contains user IDs
      const clientName = deal.client_id ? deal.client_id.name : 'Unknown Client'; // Get client name

      for (const userId of selectedUsers) {
          const notification = new Notification({
              receiver: userId,
              message: `${req.user.name} has changed the deal stage for ${clientName} from '${previousStageName}' to '${updatedStageName}'`,
              reference_id: updatedDeal._id, // Reference to the updated deal
              notification_type: 'Deal',
          });
          await notification.save(); // Save the notification to the database

          // Emit notification to the user via Socket.IO
          const io = getIO(); // Get the initialized Socket.IO instance
          io.to(`user_${userId}`).emit('notification', {
              message: notification.message,
              referenceId: notification.reference_id,
              notificationType: notification.notification_type,
              notificationId: notification._id,
              createdAt: notification.created_at,
          });
      }

      res.status(200).json(updatedDeal);
  } catch (error) {
      console.error('Error updating deal stage:', error);
      res.status(500).json({ message: 'Error updating deal stage' });
  }
});


router.put('/update-collection-status/:id', async (req, res) => {
  try {
    const { collection_status } = req.body;

    // Check if collection_status is valid
    const validStatuses = ['10%', '0%', '50%', '100%'];
    if (!validStatuses.includes(collection_status)) {
      return res.status(400).json({ message: 'Invalid collection status' });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Update the collection status
    deal.collection_status = collection_status;
    deal.updated_at = new Date(); // Update the timestamp

    // Save the updated deal
    const updatedDeal = await deal.save();

    // Log the activity (uncomment if needed)
    // await DealActivityLog.create({
    //   deal_id: updatedDeal._id,
    //   action: 'Collection status updated',
    //   details: `Collection status changed to ${collection_status}`,
    //   timestamp: new Date()
    // });

    res.status(200).json(updatedDeal);
  } catch (error) {
    console.error('Error updating collection status:', error);
    res.status(500).json({ message: 'Error updating collection status' });
  }
});

module.exports = router;
