// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const ipc = require('electron').ipcMain;
const notifier = require('node-notifier');
const path = require('path');
const dotenv = require('dotenv');
const tray = require('./application/tray');
const AutoLaunch = require('auto-launch');
const { autoUpdater } = require("electron-updater");
const config = require('./config');
require('./application/menus/toolbar');
const Badge = require('electron-windows-badge');
const { dialog } = require('electron')
const isDev = require('electron-is-dev');

const autoLaunch = new AutoLaunch({
  name: 'Ticket Platform',
  path: app.getPath('exe'),
});

dotenv.config();

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
  mainWindow.webContents.openDevTools({ mode: "bottom" }); /* Enable when develop */

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
    new Badge(mainWindow, { font: '32px arial' });
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

  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.checkForUpdates();
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
    font: '32px arial'
  };
  new Badge(mainWindow, badgeOptions);

  mainWindow.once('focus', () => mainWindow.flashFrame(false))
  mainWindow.flashFrame(true)
}

function sendStatusToWindow(text) {
  mainWindow.webContents.send('message', text);
}
autoUpdater.on('checking-for-update', () => {
  if (isDev) {
    console.log('Running in development');
    sendStatusToWindow('Running in development');
  } else {
    console.log('Running in production');
    sendStatusToWindow('Running in production');
  }
  sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);

  if (mainWindow != null) mainWindow.setProgressBar(progressObj.percent / 100)
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
  if (mainWindow != null) mainWindow.setProgressBar(0)

  let title = 'Cập nhật phiên bản mới';
  let message = 'Phiên bản hiện tại là ' + autoUpdater.currentVersion + ' phiên bản mới nhất là ' + info.version;

  const trayIconDefault = path.join(__dirname, '../assets/img/question_doubt_red.png')
  const options = {
    type: 'question',
    icon: trayIconDefault,
    title: title,
    buttons: ['Cập nhật', 'Không'],
    message: message,
    defaultId: 0,
    cancelId: 1 // press esc key
  }
  dialog.showMessageBox(options, (index) => {
    if (index === 0) { // Cập nhật
      autoUpdater.quitAndInstall()
    }
  })

  // ========== NOTIFY SECTION ==========
  // notifier.notify({
  //   title: title,
  //   message: message + '. Bấm để cập nhật',
  //   sound: true,
  //   wait: true
  // }, function (err, res) {
  //   // console.log(err, res);
  // });

  // notifier.on("click", () => {
  //   autoUpdater.quitAndInstall()
  // });
});
