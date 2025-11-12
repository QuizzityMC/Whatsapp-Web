const express = require('express');
const rateLimit = require('express-rate-limit');
const { Client, LocalAuth } = require('whatsapp-web.js');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use(limiter);

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// WhatsApp client setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    },
    // Custom client info for better device identification
    clientId: "whatsapp-web-client",
    // Optimize sync behavior for faster loading
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
});

let qrCodeData = null;
let isClientReady = false;

// WhatsApp client event handlers
client.on('qr', async (qr) => {
    console.log('QR Code received');
    qrCodeData = await qrcode.toDataURL(qr);
    io.emit('qr', qrCodeData);
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    isClientReady = true;
    io.emit('ready', 'WhatsApp client is ready');
});

client.on('authenticated', () => {
    console.log('Authenticated');
    io.emit('authenticated', 'Client authenticated');
});

client.on('auth_failure', (msg) => {
    console.error('Authentication failure:', msg);
    io.emit('auth_failure', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
    isClientReady = false;
    io.emit('disconnected', reason);
});

client.on('message', async (message) => {
    console.log('New message:', message.body);
    const chat = await message.getChat();
    const contact = await message.getContact();
    
    io.emit('message', {
        id: message.id._serialized,
        body: message.body,
        from: message.from,
        fromName: contact.pushname || contact.name || message.from,
        timestamp: message.timestamp,
        isGroup: chat.isGroup,
        chatName: chat.name,
        hasMedia: message.hasMedia,
        type: message.type
    });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected to socket');
    
    // Send current QR code if available
    if (qrCodeData && !isClientReady) {
        socket.emit('qr', qrCodeData);
    }
    
    if (isClientReady) {
        socket.emit('ready', 'WhatsApp client is ready');
    }
    
    // Get all chats
    socket.on('getChats', async () => {
        try {
            if (!isClientReady) {
                socket.emit('error', 'Client not ready');
                return;
            }
            
            console.log('Fetching chats...');
            const chats = await client.getChats();
            
            // Sort by timestamp and limit to most recent 50 chats for faster loading
            const recentChats = chats
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                .slice(0, 50);
            
            console.log(`Processing ${recentChats.length} most recent chats...`);
            
            // Process chats in batches to avoid overwhelming the system
            const batchSize = 10;
            const chatList = [];
            
            for (let i = 0; i < recentChats.length; i += batchSize) {
                const batch = recentChats.slice(i, i + batchSize);
                const batchResults = await Promise.all(batch.map(async (chat) => {
                    try {
                        const contact = await chat.getContact();
                        const lastMessage = chat.lastMessage;
                        
                        return {
                            id: chat.id._serialized,
                            name: chat.name || contact.pushname || contact.name || chat.id.user,
                            isGroup: chat.isGroup,
                            unreadCount: chat.unreadCount,
                            timestamp: chat.timestamp,
                            lastMessage: lastMessage ? {
                                body: lastMessage.body,
                                timestamp: lastMessage.timestamp
                            } : null,
                            profilePicUrl: null
                        };
                    } catch (err) {
                        console.error('Error processing chat:', err);
                        return null;
                    }
                }));
                
                chatList.push(...batchResults.filter(c => c !== null));
                
                // Send progress updates for large chat lists
                if (i > 0 && i % 20 === 0) {
                    console.log(`Processed ${chatList.length} chats so far...`);
                }
            }
            
            console.log(`Sending ${chatList.length} chats to client`);
            socket.emit('chats', chatList);
        } catch (error) {
            console.error('Error getting chats:', error);
            socket.emit('error', error.message);
        }
    });
    
    // Get messages from a specific chat
    socket.on('getMessages', async (chatId, limit = 20) => {
        try {
            if (!isClientReady) {
                socket.emit('error', 'Client not ready');
                return;
            }
            
            console.log(`Fetching messages for chat ${chatId}, limit: ${limit}`);
            const chat = await client.getChatById(chatId);
            
            // Limit to maximum of 50 messages for performance
            const messageLimit = Math.min(limit || 20, 50);
            const messages = await chat.fetchMessages({ limit: messageLimit });
            
            console.log(`Processing ${messages.length} messages...`);
            
            const messageList = await Promise.all(messages.map(async (msg) => {
                try {
                    const contact = await msg.getContact();
                    
                    return {
                        id: msg.id._serialized,
                        body: msg.body,
                        from: msg.from,
                        fromName: contact.pushname || contact.name || msg.from,
                        timestamp: msg.timestamp,
                        fromMe: msg.fromMe,
                        hasMedia: msg.hasMedia,
                        type: msg.type,
                        ack: msg.ack
                    };
                } catch (err) {
                    console.error('Error processing message:', err);
                    return null;
                }
            }));
            
            const validMessages = messageList.filter(m => m !== null);
            console.log(`Sending ${validMessages.length} messages to client`);
            socket.emit('messages', { chatId, messages: validMessages });
        } catch (error) {
            console.error('Error getting messages:', error);
            socket.emit('error', error.message);
        }
    });
    
    // Send a message
    socket.on('sendMessage', async (data) => {
        try {
            if (!isClientReady) {
                socket.emit('error', 'Client not ready');
                return;
            }
            
            const { chatId, message } = data;
            await client.sendMessage(chatId, message);
            socket.emit('messageSent', { chatId, message });
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', error.message);
        }
    });
    
    // Get contact info
    socket.on('getContact', async (contactId) => {
        try {
            if (!isClientReady) {
                socket.emit('error', 'Client not ready');
                return;
            }
            
            const contact = await client.getContactById(contactId);
            socket.emit('contact', {
                id: contact.id._serialized,
                name: contact.pushname || contact.name,
                number: contact.number,
                isMyContact: contact.isMyContact,
                isGroup: contact.isGroup
            });
        } catch (error) {
            console.error('Error getting contact:', error);
            socket.emit('error', error.message);
        }
    });
    
    // Download media
    socket.on('downloadMedia', async (messageId) => {
        try {
            if (!isClientReady) {
                socket.emit('error', 'Client not ready');
                return;
            }
            
            const message = await client.getMessageById(messageId);
            if (message.hasMedia) {
                const media = await message.downloadMedia();
                socket.emit('media', {
                    messageId,
                    data: media.data,
                    mimetype: media.mimetype,
                    filename: media.filename
                });
            }
        } catch (error) {
            console.error('Error downloading media:', error);
            socket.emit('error', error.message);
        }
    });
    
    // Get client state
    socket.on('getState', async () => {
        try {
            if (!isClientReady) {
                socket.emit('state', { ready: false, info: null });
                return;
            }
            
            const info = client.info;
            socket.emit('state', {
                ready: true,
                info: {
                    pushname: info.pushname,
                    wid: info.wid._serialized,
                    platform: info.platform
                }
            });
        } catch (error) {
            console.error('Error getting state:', error);
            socket.emit('error', error.message);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected from socket');
    });
});

// API endpoints
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/status', (req, res) => {
    res.json({
        ready: isClientReady,
        hasQR: qrCodeData !== null
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Initialize WhatsApp client
console.log('Initializing WhatsApp client...');
client.initialize();

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
