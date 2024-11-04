const axios = require('axios');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const LeadFetchConfig = require('./models/LeadFetchConfigModel');
const Lead = require('./models/leadModel');
const Client = require('./models/clientModel');
const User = require('./models/userModel');
const bcrypt = require('bcrypt');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'omerlantana@gmail.com', 
        pass: 'fkxn hlir jukw mpkn' // replace with your secure email password
    }
});

// Helper function to get yesterday's date in ISO format
function getYesterdayDate() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
}

async function fetchAndStoreLeads() {
    try {
        const configs = await LeadFetchConfig.find();
        const yesterday = getYesterdayDate();

        for (const config of configs) {
            let totalLeadsInserted = 0;
            let totalLeadsSkipped = 0;
            const insertedLeads = [];
            const skippedLeads = [];

            const leads = [];
            const fetchLeads = async (url) => {
                const response = await axios.get(url);
                leads.push(...response.data.data);
                if (response.data.paging && response.data.paging.next) {
                    await fetchLeads(response.data.paging.next);
                }
            };

            const initialUrl = `https://graph.facebook.com/v20.0/${config.formId}/leads?access_token=${config.accessToken}`;
            await fetchLeads(initialUrl);

            // Filter leads based on created_time
            const recentLeads = leads.filter(lead => {
                const leadCreatedTime = new Date(lead.created_time);
                return leadCreatedTime >= yesterday;
            });

            for (const lead of recentLeads) {
                let phoneNumber, fullName, email, description = "", whatsappNumber;

                lead.field_data.forEach(field => {
                    if (field.values && field.values.length > 0) {
                        switch (field.name) {
                            case 'phone_number': phoneNumber = field.values[0]; break;
                            case 'full_name': fullName = field.values[0]; break;
                            case 'email': email = field.values[0]; break;
                            case 'whatsapp_number': whatsappNumber = field.values[0]; break;
                            default: description += `• ${field.name}: ${field.values[0]}\n`; break;
                        }
                    }
                });

                if (!phoneNumber) {
                    totalLeadsSkipped += 1;
                    skippedLeads.push({ name: fullName, phone: phoneNumber });
                    continue;
                }

                const existingClient = await Client.findOne({ phone: phoneNumber });
                if (!existingClient) {
                    const w_phone = whatsappNumber || phoneNumber;

                    const newClient = new Client({
                        phone: phoneNumber,
                        name: fullName || '',
                        email: email || '',
                        password: await bcrypt.hash('123', 10),
                        w_phone: w_phone,
                    });
                    await newClient.save();

                    const allSelectedUserIds = (await Promise.all([
                        User.find({ role: 'CEO' }).select('_id'),
                        User.find({ role: 'superadmin' }).select('_id'),
                        User.find({ role: 'MD' }).select('_id'),
                        User.find({ role: 'Marketing' }).select('_id'),
                        User.find({ role: 'Developer' }).select('_id')
                    ])).flat().map(user => user._id.toString());

                    const uniqueUserIds = [...new Set(allSelectedUserIds)];

                    const newLead = new Lead({
                        client: newClient._id,
                        created_by: config.created_by,
                        selected_users: uniqueUserIds,
                        pipeline_id: config.pipeline_id || null,
                        lead_type: config.lead_type,
                        source: config.source,
                        product_stage: config.product_stage || null,
                        products: config.products,
                        branch: config.branch || null,
                        description: description.trim(),
                    });
                    await newLead.save();
                    
                    totalLeadsInserted += 1;
                    insertedLeads.push({ name: fullName, phone: phoneNumber });
                } else {
                    totalLeadsSkipped += 1;
                    skippedLeads.push({ name: fullName, phone: phoneNumber });
                }
            }

            // Prepare and send email
            const mailOptions = {
                from: 'omerlantana@gmail.com',
                to: 'abdullahjovera@gmail.com',
                subject: `Lead Processing Summary ${config.name}`,
                text: `
                    Leads processed successfully for ${config.name}.
                    
                    Total leads inserted: ${totalLeadsInserted}
                    Total leads skipped: ${totalLeadsSkipped}
                    
                    Inserted Leads:
                    ${insertedLeads.map(lead => `Name: ${lead.name}, Phone: ${lead.phone}`).join('\n')}

                    Skipped Leads:
                    ${skippedLeads.map(lead => `Name: ${lead.name}, Phone: ${lead.phone}`).join('\n')}
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent for config: ${config.name}`);
        }
    } catch (error) {
        console.error('Error fetching leads:', error);
    }
}

module.exports = fetchAndStoreLeads;