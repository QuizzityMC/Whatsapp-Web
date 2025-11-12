# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Browser                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Frontend (HTML/CSS/JS)                  │   │
│  │  • QR Code Display                                    │   │
│  │  • Chat List UI                                       │   │
│  │  • Message Display                                    │   │
│  │  • Input Controls                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/WebSocket (Socket.IO)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Node.js Server                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Express.js Web Server                      │   │
│  │  • Rate Limiting Middleware                           │   │
│  │  • Static File Serving                                │   │
│  │  • REST API Endpoints                                 │   │
│  │    - GET /api/status                                  │   │
│  │    - GET /api/health                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Socket.IO Server                         │   │
│  │  • Real-time Event Handling                           │   │
│  │  • Bidirectional Communication                        │   │
│  │  Events: getChats, sendMessage, etc.                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           WhatsApp Web Client                         │   │
│  │  (whatsapp-web.js + Puppeteer)                        │   │
│  │  • QR Code Generation                                 │   │
│  │  • Message Handling                                   │   │
│  │  • Session Management                                 │   │
│  │  • Media Processing                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Local File System                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  .wwebjs_auth/  - Session authentication data        │   │
│  │  .wwebjs_cache/ - WhatsApp cache                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                WhatsApp Servers                              │
│  (WhatsApp Web Protocol)                                     │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow
```
User Phone ──scan QR──> Browser ──WebSocket──> Server
                                                  │
                                                  ▼
                                           WhatsApp Client
                                                  │
                                                  ▼
                                           Generate QR Code
                                                  │
                                                  ▼
                                           Store Session
                                           (.wwebjs_auth/)
```

### 2. Message Sending Flow
```
User ──type message──> Browser
                         │
                         ▼
                    Socket.IO Event
                    (sendMessage)
                         │
                         ▼
                    Express Server
                         │
                         ▼
                  WhatsApp Client
                         │
                         ▼
                  WhatsApp Servers
                         │
                         ▼
                    Recipient
```

### 3. Message Receiving Flow
```
Sender ──sends message──> WhatsApp Servers
                              │
                              ▼
                        WhatsApp Client
                        (message event)
                              │
                              ▼
                        Socket.IO Emit
                              │
                              ▼
                          Browser
                              │
                              ▼
                        Update UI
```

## Component Details

### Frontend Components (public/)

**index.html** (123 lines)
- QR Code authentication screen
- Chat list sidebar
- Active chat area
- Message input interface
- Connection status indicator

**styles.css** (481 lines)
- Dark theme styling
- Responsive layout
- WhatsApp-like design
- Animations and transitions

**app.js** (313 lines)
- Socket.IO client
- Event handlers
- DOM manipulation
- Real-time updates
- Message rendering

### Backend Components

**server.js** (297 lines)
- Express.js setup with rate limiting
- WhatsApp client initialization
- Socket.IO event handlers
- REST API endpoints
- Session management

### Dependencies

**Core**
- express: Web server framework
- whatsapp-web.js: WhatsApp API wrapper
- socket.io: Real-time communication
- qrcode: QR code generation
- express-rate-limit: Security middleware

**Indirect**
- puppeteer: Browser automation (via whatsapp-web.js)
- Various utilities and helpers

## Security Layers

```
┌─────────────────────────────────────────┐
│     Rate Limiting (100 req/15min)       │
├─────────────────────────────────────────┤
│     Input Sanitization (HTML escape)    │
├─────────────────────────────────────────┤
│     Session Storage (Local Auth)        │
├─────────────────────────────────────────┤
│     WhatsApp E2E Encryption             │
└─────────────────────────────────────────┘
```

## Deployment Options

### Option 1: Docker Compose (Recommended)
```
docker-compose.yml
      │
      ▼
Docker Engine
      │
      ├─> Build Image (Dockerfile)
      ├─> Create Container
      ├─> Mount Volumes
      │   - whatsapp_auth
      │   - whatsapp_cache
      ├─> Expose Port 3000
      └─> Start Application
```

### Option 2: Node.js Direct
```
npm install
      │
      ▼
Install Dependencies
      │
      ▼
npm start
      │
      ▼
Start Server (port 3000)
```

## File Organization

```
Whatsapp-Web/
│
├── Backend
│   └── server.js                 # Main application server
│
├── Frontend
│   └── public/
│       ├── index.html           # UI structure
│       ├── styles.css           # Styling
│       └── app.js               # Client logic
│
├── Configuration
│   ├── package.json             # Dependencies
│   ├── .env.example             # Config template
│   ├── .gitignore               # Git exclusions
│   └── .dockerignore            # Docker exclusions
│
├── Deployment
│   ├── Dockerfile               # Container definition
│   └── docker-compose.yml       # Compose config
│
└── Documentation
    ├── README.md                # Main docs
    ├── QUICKSTART.md            # Quick guide
    ├── FEATURES.md              # Feature list
    ├── CONTRIBUTING.md          # Contribution guide
    ├── SUMMARY.md               # Project summary
    ├── ARCHITECTURE.md          # This file
    └── LICENSE                  # MIT license
```

## Technology Decisions

### Why Node.js?
- Native async/await support for real-time operations
- Large ecosystem for WhatsApp/messaging
- Excellent WebSocket support
- Good performance for I/O operations

### Why whatsapp-web.js?
- Most mature WhatsApp Web wrapper
- Active development and community
- Built-in session management
- Comprehensive API coverage

### Why Socket.IO?
- Reliable real-time bidirectional communication
- Automatic reconnection
- Fallback mechanisms
- Easy to use API

### Why Docker?
- Consistent deployment across platforms
- Isolated environment
- Easy dependency management
- Simple one-command startup

### Why Vanilla JavaScript (Frontend)?
- No build process needed
- Lightweight and fast
- Easy to understand and modify
- No framework dependencies

## Performance Considerations

- **Session Persistence**: Sessions stored locally, no DB overhead
- **Real-time Updates**: WebSocket for instant messaging
- **Rate Limiting**: Prevents server overload
- **Efficient DOM Updates**: Minimal re-rendering
- **Lazy Loading**: Messages loaded on-demand

## Scalability Notes

Current design is for **single-user deployment** (one WhatsApp account per instance).

For multi-user scenarios:
- Deploy multiple instances (one per user)
- Use container orchestration (Kubernetes)
- Add authentication layer
- Implement user session management
- Consider message queue for high volume

## Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update whatsapp-web.js for protocol changes

### Monitoring
- Use `/api/health` for uptime checks
- Monitor Docker container logs
- Set up alerts for failures

### Backups
- Backup `.wwebjs_auth/` directory
- Session can be restored from backup
- No message storage (messages from WhatsApp)
