'use strict'
const path = require('path')
const electron = require('electron')
const helper = require('../../helper')

const app = electron.app
const shell = electron.shell
const Tray = electron.Tray
const Menu = electron.Menu

const trayIconDefault = path.join(__dirname, '../../../assets/img/icon-tray.png')
const trayIconWindows = path.join(__dirname, '../../../assets/img/icon-tray.png')
let tray = null

exports.destroy = win => {
  // tray.destroy();
}

exports.create = win => {
  if (process.platform === 'darwin' || tray) {
    return
  }

  let icon = trayIconDefault

  if (process.platform === 'win32') {
    icon = trayIconWindows
  }

  // Create toolbar
  tray = new Tray(icon)

  const contextMenu = [{
    label: 'Toggle',
    click() {
      helper.toggleWin(win)
    }
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    click() {
      app.quit()
    }
  }]

  tray.setToolTip(`${app.getName()}`)
  tray.setContextMenu(Menu.buildFromTemplate(contextMenu))
  tray.on('click', function handleClicked() {
    helper.toggleWin(win)
  })
}
