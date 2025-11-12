// Connect to Socket.IO
const socket = io();

// DOM Elements
const qrScreen = document.getElementById('qr-screen');
const chatScreen = document.getElementById('chat-screen');
const qrCodeContainer = document.getElementById('qr-code-container');
const chatList = document.getElementById('chat-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const activeChatDiv = document.getElementById('active-chat');
const welcomeScreen = document.querySelector('.welcome-screen');
const activeChatName = document.getElementById('active-chat-name');
const searchChatsInput = document.getElementById('search-chats');
const refreshChatsBtn = document.getElementById('refresh-chats');
const logoutBtn = document.getElementById('logout-btn');
const connectionStatus = document.getElementById('connection-status');
const statusDot = connectionStatus.querySelector('.status-dot');
const statusText = connectionStatus.querySelector('.status-text');
const userName = document.getElementById('user-name');

// State
let currentChatId = null;
let chats = [];
let messages = {};

// Update connection status
function updateConnectionStatus(status, text) {
    statusText.textContent = text;
    if (status === 'connected') {
        statusDot.classList.add('connected');
    } else {
        statusDot.classList.remove('connected');
    }
}

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
    updateConnectionStatus('connecting', 'Connecting...');
    socket.emit('getState');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateConnectionStatus('disconnected', 'Disconnected');
});

socket.on('qr', (qrData) => {
    console.log('QR code received');
    qrCodeContainer.innerHTML = `
        <img src="${qrData}" alt="QR Code">
        <p style="margin-top: 15px; color: #667781; font-size: 14px;">
            If login is stuck, ensure your phone has internet access.<br>
            If on restricted WiFi, this may take longer or fail.
        </p>
    `;
    updateConnectionStatus('waiting', 'Scan QR Code');
});

socket.on('ready', (message) => {
    console.log('WhatsApp client ready:', message);
    updateConnectionStatus('connected', 'Connected');
    qrScreen.classList.remove('active');
    chatScreen.classList.add('active');
    loadChats();
});

socket.on('authenticated', (message) => {
    console.log('Authenticated:', message);
    updateConnectionStatus('authenticated', 'Authenticated');
});

socket.on('auth_failure', (message) => {
    console.error('Authentication failure:', message);
    updateConnectionStatus('error', 'Authentication failed');
    qrCodeContainer.innerHTML = `
        <div class="error">
            <p>Authentication failed: ${message}</p>
            <p>Please refresh the page and try again.</p>
        </div>
    `;
});

socket.on('disconnected', (reason) => {
    console.log('WhatsApp disconnected:', reason);
    updateConnectionStatus('disconnected', 'Disconnected');
    chatScreen.classList.remove('active');
    qrScreen.classList.add('active');
    qrCodeContainer.innerHTML = '<div class="loading">Reconnecting...</div>';
});

socket.on('chats', (chatList) => {
    console.log('Chats received:', chatList.length);
    chats = chatList.sort((a, b) => b.timestamp - a.timestamp);
    renderChatList(chats);
    updateConnectionStatus('connected', 'Connected');
});

socket.on('messages', (data) => {
    console.log('Messages received for chat:', data.chatId);
    messages[data.chatId] = data.messages.reverse();
    if (data.chatId === currentChatId) {
        renderMessages(data.chatId);
    }
});

socket.on('message', (message) => {
    console.log('New message received:', message);
    
    // Add to messages cache
    if (!messages[message.from]) {
        messages[message.from] = [];
    }
    messages[message.from].push(message);
    
    // Update chat list
    loadChats();
    
    // If this is the current chat, render the new message
    if (currentChatId === message.from || 
        (message.fromMe && currentChatId && messages[currentChatId])) {
        renderMessages(currentChatId);
    }
});

socket.on('messageSent', (data) => {
    console.log('Message sent:', data);
    // Reload messages for the current chat
    if (currentChatId) {
        socket.emit('getMessages', currentChatId);
    }
});

socket.on('state', (state) => {
    console.log('Client state:', state);
    if (state.ready && state.info) {
        userName.textContent = state.info.pushname || 'User';
    }
});

socket.on('error', (error) => {
    console.error('Error:', error);
    alert('Error: ' + error);
});

// Load chats
function loadChats() {
    chatList.innerHTML = '<div class="loading">Loading chats...</div>';
    updateConnectionStatus('loading', 'Loading chats...');
    socket.emit('getChats');
}

// Render chat list
function renderChatList(chatList) {
    if (chatList.length === 0) {
        chatList.innerHTML = '<div class="loading">No chats found</div>';
        return;
    }
    
    const html = chatList.map(chat => {
        const lastMessageText = chat.lastMessage ? 
            (chat.lastMessage.body || 'Media') : 'No messages';
        const time = chat.lastMessage ? 
            formatTime(chat.lastMessage.timestamp * 1000) : '';
        const unreadBadge = chat.unreadCount > 0 ? 
            `<span class="unread-count">${chat.unreadCount}</span>` : '';
        
        return `
            <div class="chat-item" data-chat-id="${chat.id}">
                <div class="avatar-small">
                    <svg viewBox="0 0 212 212" width="40" height="40">
                        <path fill="#DFE5E7" d="M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z"/>
                        <path fill="#FFF" d="M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-10.204-7.026 75.2 75.2 0 0 0-5.98-3.055c-.062-.028-.118-.059-.18-.087-9.792-4.44-22.106-7.529-37.416-7.529s-27.624 3.089-37.416 7.529c-.338.153-.653.318-.985.474a75.37 75.37 0 0 0-6.229 3.298 72.589 72.589 0 0 0-9.15 6.395 71.243 71.243 0 0 0-5.924 5.47 70.064 70.064 0 0 0-3.184 3.527 67.142 67.142 0 0 0-2.609 3.299 63.292 63.292 0 0 0-2.065 2.955 56.33 56.33 0 0 0-1.447 2.324c-.033.056-.073.119-.104.174a47.92 47.92 0 0 0-1.07 1.926c-.559 1.068-.818 1.678-.818 1.678v.398c18.285 17.927 43.322 28.985 70.945 28.985 27.678 0 52.761-11.103 71.055-29.095v-.289s-.619-1.45-1.992-3.778a58.346 58.346 0 0 0-1.446-2.322zM106.002 125.5c2.645 0 5.212-.253 7.68-.737a38.272 38.272 0 0 0 3.624-.896 37.124 37.124 0 0 0 5.12-1.958 36.307 36.307 0 0 0 6.15-3.67 35.923 35.923 0 0 0 9.489-10.48 36.558 36.558 0 0 0 2.422-4.84 37.051 37.051 0 0 0 1.716-5.25c.299-1.208.542-2.443.725-3.701.275-1.887.417-3.827.417-5.811s-.142-3.925-.417-5.811a38.734 38.734 0 0 0-1.215-5.494 36.68 36.68 0 0 0-3.648-8.298 35.923 35.923 0 0 0-9.489-10.48 36.347 36.347 0 0 0-6.15-3.67 37.124 37.124 0 0 0-5.12-1.958 37.67 37.67 0 0 0-3.624-.896 39.875 39.875 0 0 0-7.68-.737c-21.162 0-37.345 16.183-37.345 37.345 0 21.159 16.183 37.342 37.345 37.342z"/>
                    </svg>
                </div>
                <div class="chat-item-info">
                    <div class="chat-item-header">
                        <span class="chat-name">${escapeHtml(chat.name)}</span>
                        <span class="chat-time">${time}</span>
                    </div>
                    <div class="chat-preview">${escapeHtml(lastMessageText)}</div>
                </div>
                ${unreadBadge}
            </div>
        `;
    }).join('');
    
    chatList.innerHTML = html;
    
    // Add click event listeners
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            const chatId = item.dataset.chatId;
            openChat(chatId);
        });
    });
}

// Open a chat
function openChat(chatId) {
    currentChatId = chatId;
    
    // Update UI
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.chat-item[data-chat-id="${chatId}"]`)?.classList.add('active');
    
    // Find chat info
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
        activeChatName.textContent = chat.name;
    }
    
    // Show active chat area
    welcomeScreen.style.display = 'none';
    activeChatDiv.style.display = 'flex';
    
    // Show loading state
    messagesContainer.innerHTML = '<div class="loading">Loading messages...</div>';
    
    // Load messages with reduced limit for faster loading
    socket.emit('getMessages', chatId, 20);
}

// Render messages
function renderMessages(chatId) {
    const chatMessages = messages[chatId] || [];
    
    if (chatMessages.length === 0) {
        messagesContainer.innerHTML = '<div class="loading">No messages</div>';
        return;
    }
    
    const html = chatMessages.map(msg => {
        const messageClass = msg.fromMe ? 'sent' : 'received';
        const senderName = msg.fromMe ? 'You' : msg.fromName;
        const showSender = !msg.fromMe;
        
        return `
            <div class="message ${messageClass}">
                <div class="message-bubble">
                    ${showSender ? `<div class="message-sender">${escapeHtml(senderName)}</div>` : ''}
                    <div class="message-text">${escapeHtml(msg.body)}</div>
                    <div class="message-time">${formatTime(msg.timestamp * 1000)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    messagesContainer.innerHTML = html;
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !currentChatId) return;
    
    socket.emit('sendMessage', {
        chatId: currentChatId,
        message: message
    });
    
    messageInput.value = '';
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search chats
searchChatsInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredChats = chats.filter(chat => 
        chat.name.toLowerCase().includes(searchTerm)
    );
    renderChatList(filteredChats);
});

// Event listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

refreshChatsBtn.addEventListener('click', loadChats);

logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout? This will disconnect your WhatsApp session.')) {
        location.reload();
    }
});

// Initial load
console.log('App initialized');
