const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path          = require('path');
const fs            = require('fs');
const url           = require('url');
const platform      = require('os').platform();


/* correct appName and userData to respect Linux standards */
if (process.platform === 'linux') {
  app.setName('particl-desktop');
  app.setPath('userData', `${app.getPath('appData')}/${app.getName()}`);
}

/* check for paths existence and create */
[ app.getPath('userData'),
  app.getPath('userData') + '/testnet'
].map(path => !fs.existsSync(path) && fs.mkdirSync(path));

if (app.getVersion().includes('RC'))
  process.argv.push(...['-testnet']);

const options = require('./modules/options').parse();
const log     = require('./modules/logger').init();
const init    = require('./modules/init');
const rpc     = require('./modules/rpc/rpc');
const _auth = require('./modules/webrequest/http-auth');
const daemon  = require('./modules/daemon/daemon');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

  log.info('app ready')
  log.debug('argv', process.argv);
  log.debug('options', options);
  
  app.setAppUserModelId("io.particl.desktop");
  
  // initialize the authentication filter
  _auth.init();
  
  initMainWindow();
  init.start(mainWindow);
});

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
app.on('browser-window-created', function (e, window) {
  window.setMenu(null);
});

/*
** initiates the Main Window
*/
function initMainWindow() {
  if (platform !== "darwin") {
    let trayImage = makeTray();
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    // width: on Win, the width of app is few px smaller than it should be
    // (this triggers smaller breakpoints) - this size should cause
    // the same layout results on all OSes
    // minWidth/minHeight: both need to be specified or none will work
    width:     1270,
    minWidth:  1270,
    height:    675,
    minHeight: 675,
    icon:      path.join(__dirname, 'resources/icon.png'),

    frame: true,
    darkTheme: true,

    webPreferences: {
      backgroundThrottling: false,
      webviewTag: false,
      nodeIntegration: false,
      sandbox: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Hide the menu bar, press ALT
  // to show it again.
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);
  
  // and load the index.html of the app.
  if (options.dev) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadURL(url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist/index.html'),
      slashes: true
    }));
  }

  // Open the DevTools.
  if (options.devtools) {
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
  let trayImage = path.join(__dirname, 'resources/icon.png');

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
          click() { mainWindow.webContents.reloadIgnoringCache(); }
        },
        {
          label: 'Open Dev Tools',
          click() { mainWindow.openDevTools(); }
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          label: 'Close',
          click() { app.quit() }
        },
        {
          label: 'Hide',
          click() { mainWindow.hide(); }
        },
        {
          label: 'Show',
          click() { mainWindow.show(); }
        },
        {
          label: 'Maximize',
          click() { mainWindow.maximize(); }
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
          click() { electron.shell.openExternal('https://particl.io/#about'); }
        },
        {
          label: 'Visit Particl.io',
          click() { electron.shell.openExternal('https://particl.io'); }
        },
        {
          label: 'Visit Electron',
          click() { electron.shell.openExternal('https://electron.atom.io'); }
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

  // Always show window when tray icon clicked
  tray.on('click', function () {
    mainWindow.show();
  });

  return trayImage;
}
