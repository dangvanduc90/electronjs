// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const ipc = require('electron').ipcMain;
const notifier = require('node-notifier');
const path = require('path');
const dotenv = require('dotenv');
const tray = require('./application/tray');
const AutoLaunch = require('auto-launch');
const config = require('./config');
require('./application/menus/toolbar');
const Badge = require('electron-windows-badge');

const autoLaunch = new AutoLaunch({
  name: 'Ticket Platform',
  path: app.getPath('exe'),
});

dotenv.config();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366, height: 768,
    icon: path.join(__dirname, '../assets/img/ticket-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(config.FRONTEND_HOST_SPLASH);
  // mainWindow.webContents.openDevTools({ mode: "bottom" }); /* Enable when develop */

  mainWindow.on('close', (event) => {
    if (app.isQuitting) {
      app.quit();
      return;
    }
    event.preventDefault();
    mainWindow.hide();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });

  ipc.on("receiveTotalNotifications", (e, args) => {
    new Badge(mainWindow, {font: '32px arial'});
  });

  ipc.on("receiveNotification", (event, args) => {
    if (args) {
      notifier.notify({
        title: 'Ticket Platform',
        message: args.message,
        sound: true,
        wait: true
      }, function (err, res) {
        // console.log(err, res);
      });

      notifier.on("click", () => {
        mainWindow.loadURL(args.url);
      });

      initBadge();
    }
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  tray.create(mainWindow, app);

  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
  });
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for application and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

function initBadge() {
  const badgeOptions = {
    font:	'32px arial'
  };
  new Badge(mainWindow, badgeOptions);

  mainWindow.once('focus', () => mainWindow.flashFrame(false))
  mainWindow.flashFrame(true)
}
