exports.toggleWindow = (mainWindow) => {
    if (process.platform === 'win32') {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    } else {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    }
}
