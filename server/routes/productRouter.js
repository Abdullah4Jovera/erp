const express = require('express');
const Product = require('../models/productModel'); // Adjust the path as necessary
const { isAuth } = require('../utils');
const hasPermission = require('../hasPermission');
const router = express.Router();

// Create a new product
router.post('/create-new-product' , async (req, res) => {
    try {
        const { name, pipeline_id } = req.body; // Include pipeline_id in request

        // Validate that the name is provided
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Create new product with the provided name and pipeline_id array
        const newProduct = new Product({ name, pipeline_id });
        await newProduct.save();

        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get all products
router.get('/get-all-products',  async (req, res) => {
    try {
        // Find all products that are not marked as deleted and populate pipeline_id
        const products = await Product.find({ delStatus: false , status:'Active'}).populate('pipeline_id'); 
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
    try {
        // Find product by ID and populate pipeline_id
        const product = await Product.findById(req.params.id).populate('pipeline_id'); 

        // Check if product exists and is not marked as deleted
        if (!product || product.delStatus) { 
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Update a product by ID
router.put('/:id', isAuth,hasPermission(['app_management']),async (req, res) => {
    try {
        const { name, pipeline_id } = req.body; // Include pipeline_id in request

        // Validate that the name is provided
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Update product with new name and pipeline_id array
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, pipeline_id }, 
            { new: true, runValidators: true }
        );

        // Check if product exists and is not marked as deleted
        if (!updatedProduct || updatedProduct.delStatus) { 
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// "Delete" a product by ID (set delStatus to true)
router.put('/delete-product/:id', isAuth,hasPermission(['app_management']), async (req, res) => {
    try {
        // Set delStatus to true instead of deleting the product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { delStatus: true }, 
            { new: true }
        );

        // Check if product exists
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product marked as deleted successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
