# Quick Start Guide

This guide will help you get the WhatsApp Web Client up and running in just a few minutes.

## Prerequisites

Choose one of the following methods:

### Method 1: Node.js (Standard)
- Node.js 18 or higher installed
- npm package manager

### Method 2: Docker (Recommended for easy hosting)
- Docker installed
- Docker Compose installed

## Installation

### Using Node.js

1. **Clone and install:**
   ```bash
   git clone https://github.com/QuizzityMC/Whatsapp-Web.git
   cd Whatsapp-Web
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   - Navigate to http://localhost:3000
   - You should see a QR code

4. **Connect WhatsApp:**
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code

5. **Start chatting!**
   - Once connected, you'll see all your chats
   - Click on any chat to start messaging

### Using Docker

1. **Clone the repository:**
   ```bash
   git clone https://github.com/QuizzityMC/Whatsapp-Web.git
   cd Whatsapp-Web
   ```

2. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **View logs (optional):**
   ```bash
   docker-compose logs -f
   ```

4. **Open your browser:**
   - Navigate to http://localhost:3000
   - Follow steps 4-5 from the Node.js method above

## Stopping the Application

### Node.js
Press `Ctrl+C` in the terminal where the server is running.

### Docker
```bash
docker-compose down
```

To remove all data and start fresh:
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, you can change it:

**Node.js:**
```bash
PORT=8080 npm start
```

**Docker:**
Edit `docker-compose.yml` and change the port mapping:
```yaml
ports:
  - "8080:3000"
```

### QR Code Not Appearing
1. Wait 10-20 seconds for the client to initialize
2. Refresh the browser
3. Check the server logs for errors

### Connection Lost
The session data is stored in `.wwebjs_auth/`. If you delete this folder, you'll need to scan the QR code again.

## Next Steps

- Check out the full [README.md](README.md) for detailed documentation
- Learn about security best practices
- Explore the features and customize the interface

## Support

For issues or questions, please visit the [GitHub Issues](https://github.com/QuizzityMC/Whatsapp-Web/issues) page.
