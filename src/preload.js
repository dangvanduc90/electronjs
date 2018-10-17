const { ipcRenderer: ipc } = require('electron');
const notifications = require("./../assets/js/index.js");
const update_badge = 'update-badge';
init();

function init() {
  window.Bridge = {
    sendToDesktopApp,
    sendTotalNotifications
  };
}

function sendTotalNotifications(totalNotifications) {
  ipc.send("receiveTotalNotifications", totalNotifications);
  ipc.sendSync(update_badge, totalNotifications);
}

function sendToDesktopApp(notify){
  ipc.send("receiveNotification", notifications(notify));
  let notify_obj = JSON.parse(notify);
  ipc.sendSync(update_badge, notify_obj.not_yet_seen_notifications);
}

ipc.on('message', function(event, text) {
  console.log(text)
})