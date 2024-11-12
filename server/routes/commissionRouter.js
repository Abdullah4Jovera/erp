const express = require('express');
const CommissionPayment = require('../models/commissionPaymentModel');
const Deal = require('../models/dealModel');
const User = require('../models/userModel');
const router = express.Router();

// Route to store commission payments when collection_status is 100%
router.post('/store-commissions', async (req, res) => {
    const { dealId, commissionData } = req.body; 

    try {
        // Find the deal
        const deal = await Deal.findById(dealId);
        if (!deal) {
            return res.status(400).json({ message: 'Deal not found or collection status is not 100%' });
        }

        const commissionPayments = [];

        // Iterate over each user in commissionData
        for (const { userId, commission } of commissionData) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: `User with ID ${userId} not found` });
            }

            // Create a new commission payment record
            const commissionPayment = new CommissionPayment({
                dealId,
                userId,
                totalCommission: commission,
                paidCommission: 0,
                remainingCommission: commission,
            });

            await commissionPayment.save();
            commissionPayments.push(commissionPayment);

            // Update user's commission (if you are tracking total commission in User)
            user.commission -= commission; // Deduct the commission paid
            await user.save();
        }

        // Mark the deal as having generated a report
        deal.is_report_generated = true;
        await deal.save();

        return res.status(200).json({ message: 'Commission payments stored successfully', commissionPayments });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});
 
 
// New route to allow user to pay their commission
router.put('/commissions/pay', async (req, res) => {
    const { userId, dealId, paymentAmount } = req.body;

    try {
        // Validate paymentAmount is a valid number
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount' });
        }

        // Find the commission payment for this user and deal
        const commissionPayment = await CommissionPayment.findOne({ userId, dealId });

        if (!commissionPayment) {
            return res.status(404).json({ message: 'No commission record found for this user and deal' });
        }

        // Validate remainingCommission is a valid number
        if (isNaN(commissionPayment.remainingCommission)) {
            return res.status(400).json({ message: 'Invalid remaining commission' });
        }

        // Check if the payment exceeds the remaining commission
        if (paymentAmount > commissionPayment.remainingCommission) {
            return res.status(400).json({ message: 'Payment amount exceeds remaining commission' });
        }

        // Update the paidCommission and remainingCommission
        commissionPayment.paidCommission += paymentAmount;
        commissionPayment.remainingCommission -= paymentAmount;

        // Ensure paidCommission does not exceed totalCommission
        if (commissionPayment.paidCommission > commissionPayment.totalCommission) {
            return res.status(400).json({ message: 'Paid commission exceeds total commission' });
        }

        // Ensure that paidCommission and remainingCommission are valid numbers
        if (isNaN(commissionPayment.paidCommission) || isNaN(commissionPayment.remainingCommission)) {
            return res.status(400).json({ message: 'Invalid commission values' });
        }

        // Save the updated commission payment
        await commissionPayment.save();

        return res.status(200).json({
            message: 'Commission payment updated successfully',
            commissionPayment
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Route to get all commission payments with populated deal, client, and user details
router.get('/commissions', async (req, res) => { 
    try {
        const commissions = await CommissionPayment.find()
            .populate({
                path: 'dealId',
                select: 'status client_id', // Include client_id in the population
                populate: {
                    path: 'client_id', // Populate the client_id field from the Deal model
                    select: 'name email' // Specify the fields to return from the Client model
                }
            })
            .populate('userId', 'name email'); // Populate user details from the User model

        return res.status(200).json({ commissions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Route to get commission payments by deal ID with populated deal, client, and user details
router.get('/commissions/deal/:dealId', async (req, res) => {
    const { dealId } = req.params;

    try {
        const commissions = await CommissionPayment.find({ dealId })
            .populate({
                path: 'dealId',
                select: 'status client_id', // Include client_id in the population
                populate: {
                    path: 'client_id', // Populate the client_id field from the Deal model
                    select: 'name email' // Specify the fields to return from the Client model
                }
            })
            .populate('userId', 'name email'); // Populate user details from the User model

        if (commissions.length === 0) {
            return res.status(404).json({ message: 'No commissions found for this deal' });
        }

        return res.status(200).json({ commissions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Route to get commission payments by user ID with populated deal, client, and user details
router.get('/commissions/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const commissions = await CommissionPayment.find({ userId })
            .populate({
                path: 'dealId',
                select: 'status client_id', // Include client_id in the population
                populate: {
                    path: 'client_id', // Populate the client_id field from the Deal model
                    select: 'name email' // Specify the fields to return from the Client model
                }
            })
            .populate('userId', 'name email'); // Populate user details from the User model

        if (commissions.length === 0) {
            return res.status(404).json({ message: 'No commissions found for this user' });
        }

        return res.status(200).json({ commissions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
