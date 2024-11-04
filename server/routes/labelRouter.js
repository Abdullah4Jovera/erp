const express = require('express');
const router = express.Router();
const Label = require('../models/labelModel'); // Adjust the path as per your folder structure
const { isAuth } = require('../utils');
const hasPermission = require('../hasPermission');


// Get labels by pipeline_id
router.get('/pipeline/:pipeline_id', isAuth, hasPermission(['lead_labels']) ,async (req, res) => {
    try {
        const { pipeline_id } = req.params;
 
        // Find labels with the given pipeline_id
        const labels = await Label.find({ pipeline_id });

        if (!labels || labels.length === 0) {
            return res.status(404).json({ message: 'No labels found for this pipeline' });
        }

        res.status(200).json( labels );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new label
router.post('/create', isAuth, hasPermission(['lead_labels']),async (req, res) => {
    try {
        const { name, color, pipeline_id, created_by } = req.body;

        // Create a new label instance
        const newLabel = new Label({
            name,
            color,
            pipeline_id,
            created_by
        });

        // Save the new label to the database
        await newLabel.save();

        res.status(201).json({ message: 'Label created successfully', label: newLabel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all labels
router.get('/all', async (req, res) => {
    try {
        const labels = await Label.find();

        res.status(200).json(labels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a label by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const label = await Label.findById(id);

        if (!label) {
            return res.status(404).json({ message: 'Label not found' });
        }

        res.status(200).json(label);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a label by ID
router.put('/:id', isAuth, hasPermission(['lead_labels']), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, pipeline_id, created_by } = req.body;

        // Find and update the label
        const updatedLabel = await Label.findByIdAndUpdate(
            id,
            {
                name,
                color,
                pipeline_id,
                created_by,
                updated_at: Date.now(),
            },
            { new: true } // Return the updated document
        );

        if (!updatedLabel) {
            return res.status(404).json({ message: 'Label not found' });
        }

        res.status(200).json({ message: 'Label updated successfully', label: updatedLabel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a label by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the label
        const deletedLabel = await Label.findByIdAndDelete(id);

        if (!deletedLabel) {
            return res.status(404).json({ message: 'Label not found' });
        }

        res.status(200).json({ message: 'Label deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
