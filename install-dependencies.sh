#!/bin/bash

# WhatsApp Web Client - System Dependencies Installation Script
# This script installs the required system libraries for Puppeteer/Chromium

echo "Installing system dependencies for WhatsApp Web Client..."

# Detect OS
if [ -f /etc/debian_version ]; then
    echo "Detected Debian/Ubuntu-based system"
    
    # Update package list
    sudo apt-get update
    
    # Install Chromium dependencies
    sudo apt-get install -y \
        ca-certificates \
        fonts-liberation \
        libappindicator3-1 \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libc6 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libexpat1 \
        libfontconfig1 \
        libgbm1 \
        libgcc1 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libstdc++6 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxss1 \
        libxtst6 \
        lsb-release \
        wget \
        xdg-utils
    
    echo "✅ System dependencies installed successfully!"
    
elif [ -f /etc/redhat-release ]; then
    echo "Detected RedHat/CentOS-based system"
    
    sudo yum install -y \
        pango.x86_64 \
        libXcomposite.x86_64 \
        libXcursor.x86_64 \
        libXdamage.x86_64 \
        libXext.x86_64 \
        libXi.x86_64 \
        libXtst.x86_64 \
        cups-libs.x86_64 \
        libXScrnSaver.x86_64 \
        libXrandr.x86_64 \
        GConf2.x86_64 \
        alsa-lib.x86_64 \
        atk.x86_64 \
        gtk3.x86_64 \
        nss \
        liberation-fonts
    
    echo "✅ System dependencies installed successfully!"
    
else
    echo "⚠️  Could not detect OS type. Please install Chromium dependencies manually."
    echo "See: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md"
    exit 1
fi

echo ""
echo "Now you can run: npm install && npm start"
