const { app } = require('electron');
const electron = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');


function getRootOrResourcePath() {
  var dir; 
  // running from packaged
  if(__dirname.search('app.asar') > -1) {
    dir = __dirname.substring(0, __dirname.indexOf('app.asar')) + 'app.asar';
    dir = path.join(dir, 'dist/assets/icons/notification.png');
  } else {
    dir = path.join(__dirname, '../../src/assets/icons/notification.png');
  }
  console.log('dir:', dir);
  return dir;
}

exports.getRootOrResourcePath = getRootOrResourcePath;