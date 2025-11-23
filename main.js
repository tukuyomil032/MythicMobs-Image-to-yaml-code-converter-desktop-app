const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const Rpc = require('discord-rpc');
const isDev = !app.isPackaged;
const clientId = '1442024361036087296'; 


Rpc.register(clientId);
const rpc = new Rpc.Client({ transport: 'ipc' });
const startTimestamp = new Date(); 

async function setActivity() {
  if (!rpc || !win) {
    return;
  }

  
  rpc.setActivity({
    details: 'Playing Image Converter',     
    state: 'Configuring settings for code generation...', 
    startTimestamp,                    
    largeImageKey: 'mm_logo', 
    largeImageText: 'MythicMobs - Image to Yaml Code Converter', 
    smallImageKey: 'app_icon', 
    smallImageText: 'v0.1.0', 
    instance: false,
  });
}

let win; 

function createWindow() {
  win = new BrowserWindow({ 
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

const preloadPath = path.join(__dirname, 'preload.js');
if (!fs.existsSync(preloadPath)) {
  fs.writeFileSync(preloadPath, '');
}

app.whenReady().then(() => {
  createWindow(); 

  rpc.on('ready', () => {
    console.log('Discord Rich Presence is ready.');
    setActivity();
  });

  rpc.login({ clientId }).catch(err => {
    console.error('Failed to login to Discord RPC:', err);
  });
});

app.on('window-all-closed', () => {
  rpc.destroy(); 
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});