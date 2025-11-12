# WhatsApp Web Client

A fully-fledged WhatsApp web client that is easy to host and has all required functions. This application provides a clean, modern interface to interact with WhatsApp using the whatsapp-web.js library.

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in minutes
- **[Features](FEATURES.md)** - Complete list of features and capabilities
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing](CONTRIBUTING.md)** - Guidelines for contributing to the project

## Features

✅ **Complete WhatsApp Integration**
- Send and receive messages in real-time
- View all your chats and contacts
- Support for individual and group chats
- Message history viewing
- Media support (images, videos, documents)

✅ **Easy to Host**
- Simple Node.js setup
- Docker support for containerized deployment
- Docker Compose for one-command startup
- Persistent session storage

✅ **Modern UI**
- Clean, WhatsApp-like interface
- Real-time updates via Socket.IO
- Responsive design
- Dark theme

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Chrome/Chromium (automatically handled by Puppeteer)
- **Unrestricted internet access** to WhatsApp servers (*.whatsapp.com, *.whatsapp.net)

**OR**

- Docker and Docker Compose

## Installation

### Method 1: Standard Node.js Setup

**Prerequisites:**
- Node.js 18 or higher
- npm or yarn
- System dependencies for Chromium (see below)

**Step 1: Install System Dependencies (Required for Puppeteer)**

The application uses Puppeteer which requires certain system libraries.

**Option A: Using the provided script (Debian/Ubuntu/Codespaces):**
```bash
git clone https://github.com/QuizzityMC/Whatsapp-Web.git
cd Whatsapp-Web
chmod +x install-dependencies.sh
sudo ./install-dependencies.sh
```

**Option B: Manual installation (Debian/Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install -y \
    ca-certificates fonts-liberation libappindicator3-1 \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
    libdbus-1-3 libgbm1 libgtk-3-0 libnspr4 libnss3 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    xdg-utils wget
```

For other operating systems, see the [Puppeteer troubleshooting guide](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md).

**Step 2: Install and Run**

1. Clone the repository:
```bash
git clone https://github.com/QuizzityMC/Whatsapp-Web.git
cd Whatsapp-Web
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Method 2: Docker Setup (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/QuizzityMC/Whatsapp-Web.git
cd Whatsapp-Web
```

2. Start with Docker Compose:
```bash
docker-compose up -d
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### First Time Setup

1. When you first open the application, you'll see a QR code
2. Open WhatsApp on your phone
3. Go to Settings → Linked Devices
4. Tap "Link a Device"
5. Scan the QR code displayed in your browser

### Using the Application

Once connected, you can:

- **View Chats**: All your chats appear in the left sidebar
- **Search**: Use the search bar to find specific chats
- **Send Messages**: Click on a chat, type your message, and press Enter or click the send button
- **Receive Messages**: New messages appear in real-time
- **Refresh**: Click the refresh button to update your chat list

## Configuration

### Environment Variables

You can customize the application using environment variables:

- `PORT`: The port the server runs on (default: 3000)

Example:
```bash
PORT=8080 npm start
```

### Docker Environment

When using Docker, modify the `docker-compose.yml` file to set environment variables:

```yaml
environment:
  - PORT=8080
```

## Architecture

The application consists of three main components:

1. **Backend (server.js)**
   - Express.js server
   - WhatsApp client using whatsapp-web.js
   - Socket.IO for real-time communication
   - API endpoints for status checking

2. **Frontend (public/)**
   - HTML/CSS/JavaScript single-page application
   - Socket.IO client for real-time updates
   - Modern, responsive UI

3. **Docker Configuration**
   - Dockerfile for containerization
   - Docker Compose for easy deployment
   - Volume mounting for persistent sessions

## Data Persistence

The application stores WhatsApp session data in the following directories:

- `.wwebjs_auth/` - Authentication data
- `.wwebjs_cache/` - Cache data

These directories are automatically created and are excluded from git via `.gitignore`.

When using Docker, these directories are mounted as volumes to ensure your session persists across container restarts.

## Troubleshooting

### Puppeteer/Chromium Errors

**Error: "Failed to launch the browser process" or "libatk-1.0.so.0: cannot open shared object file"**

This means your system is missing required libraries for Chromium to run.

**Solution 1: Install system dependencies**
```bash
# Using the provided script
chmod +x install-dependencies.sh
sudo ./install-dependencies.sh

# Then restart the application
npm start
```

**Solution 2: Use Docker (recommended)**
```bash
docker-compose up -d
```
Docker includes all dependencies automatically and is the easiest way to avoid these issues.

### QR Code Not Appearing

1. Check if the server is running properly
2. Look at the server logs for any errors
3. Ensure you have a stable internet connection
4. Try refreshing the page

### Connection Issues

1. Check server logs for errors
2. Ensure port 3000 (or your configured port) is not in use
3. Verify your internet connection
4. Try restarting the application

### Session Lost

If you lose your session:
1. Delete the `.wwebjs_auth/` and `.wwebjs_cache/` directories
2. Restart the application
3. Scan the QR code again

For Docker:
```bash
docker-compose down -v
docker-compose up -d
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

### Project Structure

```
Whatsapp-Web/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
├── .gitignore         # Git ignore rules
└── public/            # Frontend files
    ├── index.html     # Main HTML file
    ├── styles.css     # Styles
    └── app.js         # Frontend JavaScript
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Do not expose this application directly to the internet** without proper authentication
2. The session data in `.wwebjs_auth/` contains sensitive information - protect it
3. Use a reverse proxy (like nginx) with SSL/TLS for production deployments
4. Consider implementing additional authentication before the QR code screen
5. Keep your dependencies updated for security patches

### Known Dependency Vulnerabilities

The whatsapp-web.js library depends on an older version of Puppeteer which has some known vulnerabilities in its dependencies (tar-fs and ws). These vulnerabilities are:

- **tar-fs**: Path traversal vulnerabilities when extracting tarballs (CVE related to tar file extraction)
- **ws**: DoS vulnerability when handling requests with many HTTP headers

**Impact Assessment**: These vulnerabilities have minimal impact on this application because:
1. The tar-fs vulnerability only affects scenarios where untrusted tarballs are extracted, which doesn't occur in normal WhatsApp operations
2. The ws vulnerability is a DoS issue that would require an attacker to send specially crafted WebSocket messages with many headers, which is mitigated by proper network configuration and rate limiting

**Mitigation**: 
- Deploy behind a reverse proxy with rate limiting
- Use a firewall to restrict access
- Keep the application in a containerized environment (Docker)
- Monitor for unusual network activity

The whatsapp-web.js maintainers are aware of these issues and are working on updates.

## Technologies Used

- **Backend**: Node.js, Express.js
- **WhatsApp Integration**: whatsapp-web.js
- **Real-time Communication**: Socket.IO
- **QR Code Generation**: qrcode
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Containerization**: Docker, Docker Compose

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Disclaimer

This project is not affiliated with, endorsed by, or connected to WhatsApp or Meta. It uses the unofficial whatsapp-web.js library. Use at your own risk and ensure compliance with WhatsApp's Terms of Service.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/QuizzityMC/Whatsapp-Web).