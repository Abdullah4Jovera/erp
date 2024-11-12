const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const WhatsAppMessage = require('../models/whatsAppMessageModel');
const Lead = require('../models/leadModel');
const Client = require('../models/clientModel');
const File = require('../models/fileModel'); // Import the File model
const { isAuth } = require('../utils');
const { getMedia } = require('../twilioUtils');
const accountSid = 'AC48e99fa5d2a4ecdd660e8f5391e375ed'; // Your Twilio Account SID
const authToken = '8d6ad3c2eb9063995cea53598eec5d93'; // Your Twilio Auth Token
const fromWhatsAppNumber = 'whatsapp:+14155238886'; // Your Twilio WhatsApp number
const client = twilio(accountSid, authToken);
const url = require('url'); // Add this
const http = require('http'); // Add this
const https = require('https'); // Add this
const mime = require('mime-types');
const activityLogModel = require('../models/activityLogModel');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../lead_files');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const randomHexName = crypto.randomBytes(16).toString('hex'); // Random hex for saving
        const ext = path.extname(file.originalname); // Keep the original extension
        cb(null, `${randomHexName}${ext}`); // Save as random hex + original extension
    }
});


const upload = multer({ storage });

async function getFinalUrl(urlString) {
    return new Promise((resolve, reject) => {
        try {
            const parsedUrl = url.parse(decodeURIComponent(urlString));
            const protocol = parsedUrl.protocol === 'https:' ? https : http;

            const req = protocol.get(parsedUrl, (res) => {
                // Follow redirects
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    // Call the function again with the new location (redirected URL)
                    return getFinalUrl(res.headers.location).then(resolve).catch(reject);
                }

                // If no redirect, resolve the original URL
                resolve(urlString);
            });

            req.on('error', (err) => {
                reject(`Error fetching the URL: ${err.message}`);
            });
        } catch (error) {
            reject(`Error processing the URL: ${error.message}`);
        }
    });
}

// Function to fetch the final URL and then get the correct file extension
async function getFileExtensionAndSave(mediaUrl, messageSid) {
    try {
        const finalUrl = await getFinalUrl(mediaUrl);
        const mediaSid = finalUrl.split('/').pop();
        const mediaData = await getMedia(messageSid, mediaSid);

        // Check if mediaData is valid and contains headers
        if (!mediaData || !mediaData.headers) {
            throw new Error('Invalid media data received from Twilio');
        }

        // Extract original filename from the Content-Disposition header
        const contentDisposition = mediaData.headers['content-disposition'];
        let originalFileName = null;

        if (contentDisposition) {
            const matches = contentDisposition.match(/filename="(.+?)"/);
            if (matches && matches[1]) {
                originalFileName = matches[1]; // Get the original file name
            }
        }

        if (!originalFileName) {
            originalFileName = `${mediaSid}.${mime.extension(mediaData.headers['content-type']) || 'bin'}`; // Fallback if no filename
        }

        const ext = path.extname(originalFileName);
        const randomHexName = crypto.randomBytes(16).toString('hex'); // Random hex name for saving
        const fileName = `${randomHexName}${ext}`;
        const filePath = path.join(__dirname, '../lead_files', fileName);

        // Save the media data to disk with random hex name
        fs.writeFileSync(filePath, mediaData.body);

        return {
            file_name: originalFileName, // Store the original file name in the database
            file_path: `/lead_files/${fileName}` // Use the random hex name for the file path
        };
    } catch (error) {
        console.error(`Failed to process media URL: ${mediaUrl}`, error);
        return null;
    }
}






// Export a function that takes the io instance
module.exports = (io) => {
    // Route to send a WhatsApp message
    router.post('/send-message', isAuth, async (req, res) => {
        const { leadId, messageBody, mediaUrl } = req.body;
        const userId = req.user._id;

        // Validate the message body
        if (!messageBody && !mediaUrl) {
            return res.status(400).json({ error: 'A text message body or media URL must be provided' });
        }

        try {
            const lead = await Lead.findById(leadId).populate('client');
            if (!lead || !lead.client) {
                return res.status(400).json({ error: 'Invalid lead or client' });
            }

            const clientData = lead.client;
            const toWhatsAppNumber = `whatsapp:${clientData.phone}`;
            const messageOptions = {
                from: fromWhatsAppNumber,
                to: toWhatsAppNumber,
            };

            if (messageBody) {
                messageOptions.body = messageBody;
            } else if (mediaUrl) {
                messageOptions.mediaUrl = [mediaUrl];
            }

            const message = await client.messages.create(messageOptions);

            const newMessage = new WhatsAppMessage({
                lead: leadId,
                client: clientData._id,
                user: userId,
                message_body: messageBody || 'Media message',
                from: fromWhatsAppNumber,
                to: clientData.phone,
                status: 'sent',
                read: true,
                twilio_message_sid: message.sid,
                media_urls: mediaUrl ? [mediaUrl] : [],
            });

            const savedMessage = await newMessage.save();

            lead.messages = lead.messages || [];
            lead.messages.push(savedMessage._id);
            await lead.save();

            io.to(`lead_${leadId}`).emit('new_message', savedMessage);

            res.status(200).json({ message: 'WhatsApp message sent successfully', messageId: savedMessage._id });
        } catch (error) {
            res.status(500).json({ error: 'Failed to send WhatsApp message', details: error.message });
        }
    });

    // Webhook to receive incoming messages from WhatsApp
    // Modified webhook route
 // Webhook to receive incoming messages from WhatsApp
router.post('/webhook', async (req, res) => {
    const { Body, From, To, MessageSid, MediaUrl0, MediaUrl1, MediaUrl2, MediaUrl3, MediaUrl4 } = req.body;

    try {
        const clientData = await Client.findOne({ phone: From.replace('whatsapp:', '') });
        if (!clientData) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const lead = await Lead.findOne({ client: clientData._id });
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const newMessageData = {
            lead: lead._id,
            client: clientData._id,
            user: null,
            from: clientData.phone,
            to: To.replace('whatsapp:', ''),
            status: 'received',
            twilio_message_sid: MessageSid,
        };

        newMessageData.message_body = Body || 'Media message';

        // Handle media files
        const mediaUrls = [MediaUrl0, MediaUrl1, MediaUrl2, MediaUrl3, MediaUrl4].filter(Boolean);
        if (mediaUrls.length > 0) {
            console.log('Received media URLs:', mediaUrls);

            // Process each media URL and save it with original name
            const filePaths = await Promise.all(mediaUrls.map(async (mediaUrl) => {
                return await getFileExtensionAndSave(mediaUrl, MessageSid); // Returns { file_name, file_path }
            }));

            const validFilePaths = filePaths.filter(Boolean);

            const savedFiles = await Promise.all(validFilePaths.map(async (fileData) => {
                const newFile = new File({
                    added_by: null, // No user associated for incoming messages
                    file_name: fileData.file_name, // Store original name
                    file_path: fileData.file_path, // Use random hex path
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                const savedFile = await newFile.save();

                const activityLog = new activityLogModel({
                    user_id: null,
                    log_type: 'file_upload',
                    remark: `File ${fileData.file_name} received and uploaded to lead's files`, // Use original name in the log
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                const savedActivityLog = await activityLog.save();

                lead.activity_logs = lead.activity_logs || [];
                lead.activity_logs.push(savedActivityLog._id);

                return savedFile;
            }));

            lead.files = lead.files || [];
            savedFiles.forEach(file => lead.files.push(file._id));
        }

        const newMessage = new WhatsAppMessage(newMessageData);
        await newMessage.save();

        lead.messages = lead.messages || [];
        lead.messages.push(newMessage._id);

        await lead.save();

        io.to(`lead_${lead._id}`).emit('new_message', newMessage);

        res.status(200).send('Received message');
    } catch (error) {
        console.error('Failed to process webhook:', error);
        res.status(500).json({ error: 'Failed to process webhook', details: error.message });
    }
});

    

    // Route to get chat history
    router.get('/chat-history/:leadId', isAuth, async (req, res) => {
        try {
            const { leadId } = req.params;

            // Find all messages related to this lead, populate user and client details
            const chatHistory = await WhatsAppMessage.find({ lead: leadId })
                .populate('user', 'name') // Populate the user who sent the message
                .populate('client', 'name phone') // Populate client info
                .sort({ createdAt: 'asc' }); // Sort messages by creation time

            // Fetch media details if there are media URLs
            const chatHistoryWithMedia = await Promise.all(chatHistory.map(async (message) => {
                if (message.media_urls && message.media_urls.length > 0) {
                    try {
                        // Extract Media SID from each media URL and fetch media details
                        const mediaDetails = await Promise.all(
                            message.media_urls.map(async (mediaUrl) => {
                                const mediaSid = mediaUrl.split('/').pop(); // Extract the Media SID from the URL
                                return getMedia(message.twilio_message_sid, mediaSid); // Pass both MessageSid and MediaSid
                            })
                        );
                        return {
                            ...message.toObject(),
                            mediaDetails, // Add media details to the message
                        };
                    } catch (error) {
                        console.error('Error fetching media:', error);
                        return message;
                    }
                } else {
                    return message;
                }
            }));

            // Update the 'read' status to true for all unread messages
            await WhatsAppMessage.updateMany(
                { lead: leadId, read: false }, // Condition: messages related to the lead and not read yet
                { $set: { read: true } }       // Update: set 'read' field to true
            );

            res.status(200).json(chatHistoryWithMedia);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch chat history', details: error.message });
        }
    });

    router.get('/media/:messageSid/:mediaSid', isAuth, async (req, res) => {
        const { messageSid, mediaSid } = req.params;

        try {
            // Fetch media using Twilio API
            const media = await getMedia(messageSid, mediaSid);

            // Set the correct headers for serving media
            res.setHeader('Content-Type', media.headers['content-type']);
            res.setHeader('Content-Disposition', 'inline'); // Display in browser
            res.send(media.body); // Send media content as the response
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve media', details: error.message });
        }
    });

    return router;


};
