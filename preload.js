const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    exportSave: (saveData) => ipcRenderer.send('save-export-data', saveData),
    importSave: () => ipcRenderer.send('request-import-save'),
    onExportSave: (callback) => ipcRenderer.on('export-save', callback),
    onImportSave: (callback) => ipcRenderer.on('import-save', callback),
    onSaveImported: (callback) => ipcRenderer.on('save-imported', callback),
    onSaveExported: (callback) => ipcRenderer.on('save-exported', callback),
    onZoomIn: (callback) => ipcRenderer.on('zoom-in', callback),
    onZoomOut: (callback) => ipcRenderer.on('zoom-out', callback),
    onZoomReset: (callback) => ipcRenderer.on('zoom-reset', callback),
    onShowVersionInfo: (callback) => ipcRenderer.on('show-version-info', callback)
  }
);