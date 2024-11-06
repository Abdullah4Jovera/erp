const express = require('express');
const Pipeline = require('../models/pipelineModel');
const { isAuth, hasRole } = require('../utils');
const hasPermission = require('../hasPermission');
const router = express.Router();

// Route to get all pipelines
router.get('/get-pipelines',  async (req, res) => {
  try {
    const pipelines = await Pipeline.find(); 
    res.status(200).json(pipelines);
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    res.status(500).json({ message: 'Server error. Unable to fetch pipelines.' });
  }
}); 

// Route to add a new pipeline
router.post('/create-pipeline', isAuth,hasPermission(['app_management']),async (req, res) => { 
  const { name, created_by } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Pipeline name is required.' });
  }

  try {
    const newPipeline = new Pipeline({
      name,
      created_by,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedPipeline = await newPipeline.save();
    res.status(201).json(savedPipeline);
  } catch (error) {
    console.error('Error adding pipeline:', error);
    res.status(500).json({ message: 'Server error. Unable to add pipeline.' });
  }
});

// Route to update a pipeline
router.put('/update-pipeline/:id', isAuth,hasPermission(['app_management']), async (req, res) => {
  const { id } = req.params;
  const { name, created_by, delstatus } = req.body;

  try {
    const pipeline = await Pipeline.findById(id);
    
    if (!pipeline) {
      return res.status(404).json({ message: 'Pipeline not found.' });
    }

    // Update the pipeline fields
    if (name) pipeline.name = name;
    if (created_by) pipeline.created_by = created_by;
    if (typeof delstatus !== 'undefined') pipeline.delstatus = delstatus;

    pipeline.updated_at = new Date();

    const updatedPipeline = await pipeline.save();
    res.status(200).json(updatedPipeline);
  } catch (error) {
    console.error('Error updating pipeline:', error);
    res.status(500).json({ message: 'Server error. Unable to update pipeline.' });
  }
});

// Route to soft delete a pipeline
router.put('/delete-pipeline/:id', isAuth,hasPermission(['app_management']), async (req, res) => {
  const { id } = req.params;

  try {
    const pipeline = await Pipeline.findById(id);
    
    if (!pipeline) {
      return res.status(404).json({ message: 'Pipeline not found.' });
    }

    // Set delstatus to true for soft deletion
    pipeline.delstatus = true;
    pipeline.updated_at = new Date(); // Update the timestamp

    const updatedPipeline = await pipeline.save();
    res.status(200).json({ message: 'Pipeline soft deleted successfully', pipeline: updatedPipeline });
  } catch (error) {
    console.error('Error deleting pipeline:', error);
    res.status(500).json({ message: 'Server error. Unable to delete pipeline.' });
  }
});

module.exports = router;
