const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (pdfBytes: ArrayBuffer) => ipcRenderer.invoke('save-file', pdfBytes),
})
