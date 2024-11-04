const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const dotenv = require('dotenv');
const { initializeSocket } = require('./socket');
const cron = require('node-cron');
// Load environment variables
dotenv.config();

// Import routers
const leadRouter = require('./routes/leadRouter');
const dealRouter = require('./routes/dealRouter');
const clientRouter = require('./routes/clientRouter');
const userRouter = require('./routes/userRouter');
const pipelineRouter = require('./routes/pipelineRouter');
const branchRouter = require('./routes/branchRouter');
const leadstageRouter = require('./routes/leadStageRouter');
const sourceRouter = require('./routes/sourceRouter');
const productstageRouter = require('./routes/productStageRouter');
const productsRouter = require('./routes/productRouter');
const leadtypesRouter = require('./routes/leadTypeRouter');
const dealstagesRouter = require('./routes/dealStageRouter');
const contractRouter = require('./routes/contractRouter');
const servicecommissionRouter = require('./routes/serviceCommissionRouter');
const whatsAppRouter = require('./routes/whatsAppRouter');
const facebookRouter = require('./facebookWebhook');
const notificationRouter = require('./routes/notificationRouter');
const permissionsRouter = require('./routes/rolePermissionsRouter');
const rolesRouter = require('./routes/rolesRouter');
const rolePermissionsRouter = require('./routes/rolePermissionsRouter');
const commissionRouter = require('./routes/commissionRouter');
const phonebookRouter = require('./routes/phonbookRouter');
const phonebookwhatsupRouter = require('./routes/phonebookwhatsupRouter');
const labelRouter = require('./routes/labelRouter');
const requestRouter = require('./routes/requestRouter');
const leadConfigRouter= require('./routes/leadConfigRouter')
const contractStagesRouter= require('./routes/contractStageRouter')




const app = express();
const port = process.env.PORT || 4000; // Use environment variable for port
const server = http.createServer(app);
const fetchAndStoreLeads = require('./leadFetcher');
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp3', {
   
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use('/lead_files', express.static(path.join(__dirname, 'lead_files')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Socket.IO setup
(async () => {
    const io = await initializeSocket(server); // Await the initialization

    // Socket events
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Join a room based on lead ID
        socket.on('join_lead_room', (leadId) => {
            socket.join(`lead_${leadId}`);
            console.log(`User joined lead room: lead_${leadId}`);
        });

        // Join a room based on user ID
        const userId = socket.handshake.query.userId;
        socket.join(`user_${userId}`);
        console.log(`User connected with ID: ${userId}`);

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    // Initialize routers
    app.use('/api/clients', clientRouter);
    app.use('/api/leads', leadRouter);
    app.use('/api/deals', dealRouter);
    app.use('/api/users', userRouter);
    app.use('/api/pipelines', pipelineRouter);
    app.use('/api/sources', sourceRouter);
    app.use('/api/branch', branchRouter);
    app.use('/api/leadstages', leadstageRouter);
    app.use('/api/productstages', productstageRouter);
    app.use('/api/products', productsRouter);
    app.use('/api/leadtypes', leadtypesRouter);
    app.use('/api/deal-stages', dealstagesRouter);
    app.use('/api/contracts', contractRouter);
    app.use('/api/service-commission', servicecommissionRouter);
    app.use('/api/whatsup', whatsAppRouter(io)); // Pass io to the WhatsApp router
    app.use('/api/facebook', facebookRouter); // Pass io if needed
    app.use('/api/notifications', notificationRouter); // Pass io if needed
    app.use('/api/permissions', permissionsRouter);
    app.use('/api/roles', rolesRouter);
    app.use('/api', rolePermissionsRouter);
    app.use('/api/commission', commissionRouter);
    app.use('/api/twillo', phonebookwhatsupRouter);
    app.use('/api/labels', labelRouter);
    app.use('/api/request', requestRouter);
    app.use('/api/lead-config', leadConfigRouter);
    app.use('/api/contract-stages', contractStagesRouter);



    app.use('/api/phonebook', phonebookRouter);

    cron.schedule('34 14 * * *', fetchAndStoreLeads);
    // Start the server
    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
})();
