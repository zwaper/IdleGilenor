const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'src/assets/icon.png'),
    title: 'IdleGilenor'
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Create menu
  const template = [
    {
      label: 'Game',
      submenu: [
        {
          label: 'Export Save',
          click: () => mainWindow.webContents.send('export-save')
        },
        {
          label: 'Import Save',
          click: () => mainWindow.webContents.send('import-save')
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { 
          label: 'Zoom In', 
          accelerator: 'CommandOrControl+=',
          click: () => mainWindow.webContents.send('zoom-in')
        },
        { 
          label: 'Zoom Out', 
          accelerator: 'CommandOrControl+-',
          click: () => mainWindow.webContents.send('zoom-out')
        },
        { 
          label: 'Reset Zoom', 
          accelerator: 'CommandOrControl+0',
          click: () => mainWindow.webContents.send('zoom-reset')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About IdleGilenor',
          click: () => mainWindow.webContents.send('show-version-info')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// When Electron is ready
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle save export
ipcMain.on('save-export-data', (event, data) => {
  dialog.showSaveDialog({
    title: 'Export Save',
    defaultPath: path.join(app.getPath('documents'), 'idlegilenor_save.json'),
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  }).then(result => {
    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, data);
      mainWindow.webContents.send('save-exported', result.filePath);
    }
  });
});

// Handle save import
ipcMain.on('request-import-save', () => {
  dialog.showOpenDialog({
    title: 'Import Save',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile']
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const saveData = fs.readFileSync(result.filePaths[0], 'utf8');
      mainWindow.webContents.send('save-imported', saveData);
    }
  });
});