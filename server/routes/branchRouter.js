const express = require('express');
const router = express.Router();
const Branch = require('../models/branchModel'); // Adjust the path to your Branch model

// POST route to create a new branch
router.post('/create-branch', async (req, res) => {
  try {
    const { name } = req.body;

    // Validate request body
    if (!name) {
      return res.status(400).json({ message: 'Branch name is required' });
    }

    // Create a new branch
    const newBranch = new Branch({ name, delstatus: false }); // Set delstatus to false by default

    // Save the branch to the database
    await newBranch.save();

    // Respond with the created branch
    res.status(201).json(newBranch);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ message: 'Error creating branch' });
  }
});

// GET route to fetch all active (non-deleted) branches
router.get('/get-branches', async (req, res) => {
  try {
    // Fetch all branches where delstatus is false
    const branches = await Branch.find({ delstatus: false });

    // Respond with the list of branches
    res.status(200).json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Error fetching branches' });
  }
});

// PUT route to update a branch
router.put('/update-branch/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate request body
    if (!name) {
      return res.status(400).json({ message: 'Branch name is required' });
    }

    // Find the branch by ID and update its name
    const updatedBranch = await Branch.findByIdAndUpdate(
      id,
      { name },
      { new: true } // Return the updated document
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Respond with the updated branch
    res.status(200).json(updatedBranch);
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ message: 'Error updating branch' });
  }
});

// DELETE route to soft delete a branch (set delstatus to true)
router.delete('/delete-branch/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the branch by ID and set delstatus to true (soft delete)
    const deletedBranch = await Branch.findByIdAndUpdate(
      id,
      { delstatus: true },
      { new: true } // Return the updated document
    );

    if (!deletedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Respond with the soft deleted branch
    res.status(200).json({ message: 'Branch soft deleted successfully', branch: deletedBranch });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ message: 'Error deleting branch' });
  }
});

module.exports = router;
