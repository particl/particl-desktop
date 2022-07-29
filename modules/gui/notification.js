const { Notification, BrowserWindow } = require('electron');
const path = require('path');
const settingsManager = require('../settingsManager');

const currentPathItems = __dirname.split(path.sep);
const basePath = currentPathItems.slice(0, currentPathItems.length - 2).join(path.sep);
const icon = path.join(
  basePath,
  settingsManager.getSettings(null, 'MODE') === 'developer' ? 'src' : 'dist',
  'assets',
  'icons',
  'notification.png'
);

exports.channels = {
    on: {
      'notifications': (title, desc, onlyUnfocused) => {
        if (
          (typeof onlyUnfocused === 'boolean' && onlyUnfocused ? BrowserWindow.getFocusedWindow() === null : true) &&
          (typeof title === 'string') &&
          (title.length > 0) &&
          (typeof desc === 'string') &&
          (desc.length > 0)) {
          const nObj = {
            icon,
            title: title,
            body: desc,
          };
          const notification = new Notification(nObj);
          notification.show();
        }
      }
    }
};