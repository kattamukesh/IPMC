// Add this to main.js if you want ipcMain window control
// This is a supplementary file showing the ipcMain handlers pattern

const { ipcMain, BrowserWindow } = require('electron');

function registerWindowHandlers(mainWindow) {
  ipcMain.on('window-minimize', () => {
    mainWindow && mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window-close', () => {
    mainWindow && mainWindow.close();
  });
}

module.exports = { registerWindowHandlers };
