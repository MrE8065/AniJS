const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    onUpdatePopularAnime: (callback) => ipcRenderer.on('update-popular-anime', callback),
    onUpdateRecentAnime: (callback) => ipcRenderer.on('update-recent-anime', callback),
    getAnimeDetails: (link) => ipcRenderer.invoke('get-anime-details', link)
})