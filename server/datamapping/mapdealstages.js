const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const DealStage = require('../models/dealStageModel'); // Assuming your model is in a models folder

// Path to the deal_stages.json file
const dealStagesFilePath = path.join(__dirname, '../data/deal_stages.json'); 

// Function to load the deal stages from JSON file and insert into MongoDB
const insertDealStages = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/transfer', {
          
        });

        console.log('Connected to MongoDB');

        // Read the deal_stages.json file
        const dealStagesData = fs.readFileSync(dealStagesFilePath, 'utf-8');

        // Parse the JSON data
        const dealStages = JSON.parse(dealStagesData);

        // Insert each deal stage into the MongoDB
        for (const stage of dealStages) {
            const newStage = new DealStage({
                name: stage.name,
                created_by: stage.created_by,
                order: stage.order,
                created_at: new Date(stage.created_at),
                updated_at: new Date(stage.updated_at),
            });

            // Save the deal stage in the database
            await newStage.save();
            console.log(`Inserted deal stage: ${stage.name}`);
        }

        console.log('All deal stages inserted successfully');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error inserting deal stages:', error);
    }
};

// Run the insertDealStages function
insertDealStages();
