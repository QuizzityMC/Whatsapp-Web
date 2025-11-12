# Troubleshooting Guide

This guide helps you resolve common issues when running the WhatsApp Web Client.

## Installation Issues

### Error: "libatk-1.0.so.0: cannot open shared object file"

**Problem:** System is missing required libraries for Puppeteer/Chromium.

**Solution:**

1. **Easiest: Use Docker** (all dependencies included)
   ```bash
   docker-compose up -d
   ```

2. **Alternative: Install system dependencies**
   
   Run the provided installation script:
   ```bash
   chmod +x install-dependencies.sh
   sudo ./install-dependencies.sh
   npm install
   npm start
   ```
   
   Or install manually (Debian/Ubuntu):
   ```bash
   sudo apt-get update
   sudo apt-get install -y \
       ca-certificates fonts-liberation libappindicator3-1 \
       libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
       libdbus-1-3 libgbm1 libgtk-3-0 libnspr4 libnss3 \
       libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
       xdg-utils wget
   ```

### Error: "Failed to launch the browser process"

This is usually the same as the libatk error above. Follow the same solutions.

### Error: "EACCES: permission denied"

**Problem:** Insufficient permissions.

**Solution:**
```bash
# Option 1: Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules

# Option 2: Use Docker
docker-compose up -d
```

### Error: "Port 3000 already in use"

**Problem:** Another application is using port 3000.

**Solution:**

1. **Change the port:**
   ```bash
   PORT=8080 npm start
   ```

2. **Or stop the other application:**
   ```bash
   # Find what's using port 3000
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

## Runtime Issues

### QR Code Not Appearing

**Symptoms:** Browser shows "Initializing WhatsApp client..." but no QR code appears.

**Solutions:**

1. **Wait longer** - Initial setup can take 30-60 seconds
2. **Check server logs** for errors
3. **Refresh the browser** (Ctrl+R or Cmd+R)
4. **Clear browser cache** and reload
5. **Check network connectivity**
6. **Verify server is running:**
   ```bash
   curl http://localhost:3000/api/health
   # Should return: {"status":"ok", ...}
   ```

### Connection Lost / Session Expired

**Problem:** WhatsApp disconnects or session is lost.

**Solution:**

1. **Delete session data and reconnect:**
   ```bash
   rm -rf .wwebjs_auth/ .wwebjs_cache/
   npm start
   # Scan QR code again
   ```

2. **For Docker:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Messages Not Sending

**Symptoms:** Messages typed but not sending.

**Solutions:**

1. **Check internet connection**
2. **Verify WhatsApp is still connected on your phone**
3. **Check server logs for errors**
4. **Refresh the browser**
5. **Check if rate limiting is blocking you** (unlikely with normal use)

### Messages Not Receiving

**Problem:** New messages don't appear in the interface.

**Solutions:**

1. **Refresh the chat** - Click the refresh button
2. **Check connection status** - Look at the indicator in top-right
3. **Reload the browser page**
4. **Check server is still running:**
   ```bash
   ps aux | grep node
   ```
5. **Restart the server:**
   ```bash
   # Press Ctrl+C to stop
   npm start
   ```

## GitHub Codespaces Specific

### Running in Codespaces

If you're using GitHub Codespaces:

1. **Install dependencies first:**
   ```bash
   sudo ./install-dependencies.sh
   ```

2. **Run the application:**
   ```bash
   npm install
   npm start
   ```

3. **Access via forwarded port:**
   - Codespaces will automatically forward port 3000
   - Click the "Open in Browser" button when prompted
   - Or go to the Ports tab and open port 3000

### Codespaces Port Forwarding

**Problem:** Can't access the application.

**Solution:**

1. Go to the "Ports" tab in Codespaces
2. Find port 3000
3. Make sure it's set to "Public" or "Private" (not disabled)
4. Click the globe icon to open in browser

## Docker Issues

### Docker Container Won't Start

**Problem:** `docker-compose up` fails.

**Solutions:**

1. **Check Docker is running:**
   ```bash
   docker --version
   docker ps
   ```

2. **Check logs:**
   ```bash
   docker-compose logs
   ```

3. **Rebuild the image:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Docker: Permission Denied

**Problem:** Permission errors with Docker.

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in, or:
newgrp docker
```

## Performance Issues

### Application is Slow

**Solutions:**

1. **Check system resources:**
   ```bash
   top
   # or
   htop
   ```

2. **Reduce message history:**
   - The app loads the last 50 messages by default
   - This is already optimized

3. **Use Docker** - Often performs better with dependencies

### High Memory Usage

**Normal:** Puppeteer/Chromium uses 200-500MB of RAM.

**If excessive (>1GB):**
1. Restart the application
2. Check for memory leaks in server logs
3. Update to the latest version

## Browser Issues

### Works in Chrome but not Firefox/Safari

**Solution:** The app is tested primarily in Chrome. For best results:
- Use Chrome, Chromium, or Edge (Chromium-based)
- Clear browser cache
- Disable browser extensions
- Try incognito/private mode

### WhatsApp Web Shows "Phone Not Connected"

**Problem:** Phone disconnected from internet.

**Solution:**
1. Ensure phone has internet connection
2. Keep WhatsApp open on phone (doesn't need to be in foreground)
3. Check phone battery saver isn't killing WhatsApp

## Advanced Troubleshooting

### Enable Debug Logging

Add this to your startup command:
```bash
DEBUG=* npm start
```

### Check WhatsApp Client State

Visit: `http://localhost:3000/api/status`

Should return:
```json
{
  "ready": true,
  "hasQR": false
}
```

### Check Health Endpoint

Visit: `http://localhost:3000/api/health`

Should return:
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-..."
}
```

### Inspect WebSocket Connection

Open browser console (F12) and check for:
- WebSocket connection errors
- Socket.IO connection status
- Any JavaScript errors

### Full Reset

If nothing works, do a complete reset:

```bash
# Stop everything
docker-compose down -v  # if using Docker
# or
# Press Ctrl+C if running with npm

# Clean everything
rm -rf node_modules/
rm -rf .wwebjs_auth/
rm -rf .wwebjs_cache/
rm package-lock.json

# Reinstall
npm install
npm start
```

## Getting Help

If you're still having issues:

1. **Check existing issues:** https://github.com/QuizzityMC/Whatsapp-Web/issues
2. **Create a new issue** with:
   - Your OS and version
   - Node.js version (`node --version`)
   - Exact error message
   - Steps to reproduce
   - Server logs
3. **Include logs:**
   ```bash
   npm start > output.log 2>&1
   ```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `EADDRINUSE` | Port already in use | Change port: `PORT=8080 npm start` |
| `EACCES` | Permission denied | Use `sudo` or fix permissions |
| `MODULE_NOT_FOUND` | Missing dependencies | Run `npm install` |
| `libatk-1.0.so.0` | Missing system libraries | Run `install-dependencies.sh` |
| `Protocol error` | Chromium issue | Restart application |
| `Session closed` | WhatsApp disconnected | Delete `.wwebjs_auth/` and reconnect |

## Prevention Tips

1. **Use Docker** - Avoids most environment issues
2. **Keep Node.js updated** - Use Node 18 or higher
3. **Keep dependencies updated** - Run `npm update` periodically
4. **Backup session data** - Copy `.wwebjs_auth/` regularly
5. **Monitor logs** - Check for warnings before they become errors
6. **Use stable internet** - Both server and phone need good connectivity

## Still Need Help?

- GitHub Issues: https://github.com/QuizzityMC/Whatsapp-Web/issues
- Check the [README](README.md) for more information
- Review the [Architecture](ARCHITECTURE.md) to understand how it works
