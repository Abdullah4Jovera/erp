const express = require('express');
const router = express.Router();
const LeadType = require('../models/leadTypeModel'); // Adjust the path according to your project structure
const { isAuth, hasRole } = require('../utils');
const hasPermission = require('../hasPermission');

// Create a new LeadType
router.post('/', isAuth,hasPermission(['app_management']),async (req, res) => {
  try {
    const leadType = new LeadType({
      name: req.body.name,
      created_by: req.body.created_by,
    });
    await leadType.save();
    res.status(201).json(leadType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all LeadTypes (excluding soft-deleted ones)
router.get('/get-all-leadtypes',async (req, res) => {
  try {
    const leadTypes = await LeadType.find({ delstatus: false }); // Exclude deleted lead types
    res.json(leadTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single LeadType by ID (considering soft deletion)
router.get('/:id', isAuth,hasPermission(['app_management']), async (req, res) => {
  try {
    const leadType = await LeadType.findOne({ _id: req.params.id, delstatus: false }); // Check delstatus
    if (!leadType) {
      return res.status(404).json({ message: 'LeadType not found' });
    }
    res.json(leadType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a LeadType by ID
router.put('/:id', isAuth,hasPermission(['app_management']), async (req, res) => {
  try {
    const leadType = await LeadType.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        created_by: req.body.created_by,
        updated_at: Date.now(),
      },
      { new: true }
    );
    if (!leadType) {
      return res.status(404).json({ message: 'LeadType not found' });
    }
    res.json(leadType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Soft delete a LeadType by ID
router.put('/delete/:id', isAuth,hasPermission(['app_management']),async (req, res) => {
  try {
    const leadType = await LeadType.findById(req.params.id);
    if (!leadType) {
      return res.status(404).json({ message: 'LeadType not found' });
    }

    // Set delstatus to true for soft deletion
    leadType.delstatus = true;
    leadType.updated_at = Date.now(); // Update the timestamp

    await leadType.save(); // Save changes
    res.json({ message: 'LeadType soft deleted successfully', leadType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
