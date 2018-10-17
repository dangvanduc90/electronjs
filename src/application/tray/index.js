'use strict'
const path = require('path');
const { Tray: Index, Menu } = require('electron');
const helper = require('../../helpers/index');

const trayIconDefault = path.join(__dirname, '../../../assets/img/ticket-icon.png');
const trayIconWindows = path.join(__dirname, '../../../assets/img/ticket-icon.png');
let tray = null

exports.destroy = win => {
  // tray.destroy();
}

exports.create = (mainWindow, app) => {
  if (process.platform === 'darwin' || tray) {
    return
  }

  let icon = trayIconDefault

  if (process.platform === 'win32') icon = trayIconWindows;

  // Create toolbar
  tray = new Index(icon)

  const contextMenu = [
    {
      label: 'Open',
      click: function() {
        mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: function() {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]

  tray.setToolTip(`${app.getName()}`)
  tray.setContextMenu(Menu.buildFromTemplate(contextMenu))
  tray.on('click', function() {
    mainWindow.show();
  })
}
