const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const platform = require('os').platform();
const log = require('electron-log');

log.transports.file.appName = (process.platform == 'linux' ? '.particl' : 'Particl');
log.transports.file.file = log.transports.file
  .findLogPath(log.transports.file.appName)
  .replace('log.log', 'partgui.log');

const options = require('./modules/options/options');
const rpc = require('./modules/rpc/rpc');
const multiwallet = require('./modules/multiwallet/multiwallet');
const daemonManager = require('./modules/daemon/daemonManager');
const daemon = require('./modules/daemon/daemon');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;
let _options;

let openDevTools = false;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', init);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    initMainWindow()
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('browser-window-created',function(e, window) {
  window.setMenu(null);
});

electron.app.on('quit', function (event, exitCode) {
  log.info('stopping')
  electron.ipcMain.removeAllListeners(['backend-rpccall']); // Remove all ipc listeners
  daemon.stop();
  if (exitCode === 991) {
    throw Error('Could not connect to daemon.');
  }
});

function init() {

  _options = options.parse();

  initMainWindow();
  rpc.init(_options);

  daemon.check()
    .then(() => log.info('daemon already started'))
    .catch(() => daemonManager.init())
    .then(() => multiwallet.get())
    .then(wallets => wallets /* TODO: prompt user which wallet */)
    .then(chosenWallets => daemon.start(chosenWallets))
    .then(log.info('daemon started'));
}

/*
** initiates the Main Window
*/
function initMainWindow() {

  let trayImage = makeTray();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: trayImage,
    webPreferences: {
      nodeIntegration: false,
      sandbox: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // and load the index.html of the app.
  if (_options.dev) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Open the DevTools.
  if (openDevTools || _options.devtools) {
    mainWindow.webContents.openDevTools()
  }

  // handle external URIs
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    electron.shell.openExternal(url);
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });
}

/*
** creates the tray icon and menu
*/
function makeTray() {

  // Default tray image + icon
  let trayImage = path.join(__dirname, 'src/assets/icons/logo.png');

  // Determine appropriate icon for platform
  // if (platform === 'darwin') {
  //    trayImage = path.join(__dirname, 'src/assets/icons/logo.icns');
  // }
  // else if (platform === 'win32' || platform === 'win64') {
  //   trayImage = path.join(__dirname, 'src/assets/icons/logo.ico');
  // }

  // The tray context menu
  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          click () { mainWindow.webContents.reloadIgnoringCache(); }
        },
        {
          label: 'Open Dev Tools',
          click () { mainWindow.openDevTools(); }
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          label: 'Close',
          click () { app.quit() }
        },
        {
          label: 'Hide',
          click () { mainWindow.hide(); }
        },
        {
          label: 'Show',
          click () { mainWindow.show(); }
        },
        {
          label: 'Maximize',
          click () { mainWindow.maximize(); }
        } /* TODO: stop full screen somehow,
        {
          label: 'Toggle Full Screen',
          click () {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
           }
        }*/
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About ' + app.getName(),
          click () { electron.shell.openExternal('https://particl.io/#about'); }
        },
        {
          label: 'Visit Particl.io',
          click () { electron.shell.openExternal('https://particl.io'); }
        },
        {
          label: 'Visit Electron',
          click () { electron.shell.openExternal('https://electron.atom.io'); }
        }
      ]
    }
  ]);

  // Create the tray icon
  tray = new electron.Tray(trayImage)

  // TODO, tray pressed icon for OSX? :)
  // if (platform === "darwin") {
  //   tray.setPressedImage(imageFolder + '/osx/trayHighlight.png');
  // }

  // Set the tray icon
  tray.setToolTip('Particl ' + app.getVersion());
  tray.setContextMenu(contextMenu)

  return trayImage;
}
