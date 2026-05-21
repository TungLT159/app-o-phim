const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ophimWatchHistoryStorage", {
  read: () => ipcRenderer.invoke("watch-history:read"),
  write: (history) => ipcRenderer.invoke("watch-history:write", history),
  clear: () => ipcRenderer.invoke("watch-history:clear"),
});
