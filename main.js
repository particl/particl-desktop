const electron        = require('electron');
const path            = require('path');
const fs              = require('fs');
const _url             = require('url');

const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;


/* correct userData to respect Linux standards */
if (process.platform === 'linux') {
  app.setName(app.getName().toLowerCase().split(' ').join('-'));
  app.setPath('userData', `${app.getPath('appData')}/${app.getName()}`);
}


// Ensure only one application instance is currently running
const instanceLock = app.requestSingleInstanceLock();

if (!instanceLock) {
  app.exit();
}


if (process.platform === 'win32') {
  // Fix for windows 10 regarding notifications, etc
  const appId = require('./package.json').build.appId;
  if (typeof appId === 'string' && appId.length > 0) {
    electron.setAppUserModelId(appId);
  }
}


// Set up logging: turn off file logging until we know that the target directory is created and writeable
let log;
let mainWindow;

try {
  log = require('electron-log');
  log.transports.file.level = false;
  log.transports.console.level = 'debug';
} catch(err) {
  console.log('Fatal Error: Failed to setup logging: ', err);
}

if (!log) {
  app.exit();
}

// Create if not existing the base application path
const appUserDataPath = app.getPath('userData');
try {
  [
    appUserDataPath
  ].map(path => !fs.existsSync(path) && fs.mkdirSync(path));
} catch(err) {
  log.error('Cannot write to filesystem: ', err);
  app.exit();
}


const modManager = require('./modules/init');
// Obtain system configuration/settings: set the relevant settings base path (can only be done once, so do it now)
const settingsManager = require('./modules/settingsManager');

settingsManager.setBasePathDir(appUserDataPath);

if (!settingsManager.loadDefaultSettings()) {
  log.error('Invalid default settings!');
  app.exit();
}

// Ensure relevant additional directories are created
try {
  Object.values(settingsManager.getSettings(null, 'PATHS')).map(path => !fs.existsSync(path) && fs.mkdirSync(path));
} catch(err) {
  log.error('Cannot write to filesystem: ', err);
  app.exit();
}



// Default system setup is complete, and relevant directories are created, so turn on file logging and configure the logger correctly
log.transports.file.fileName = 'application.log';
log.transports.file.resolvePath = (variables) => {
  return path.join(settingsManager.getSettings(null, 'PATHS').logs, variables.fileName);
}
log.transports.console.level = log.transports.file.level = settingsManager.getSettings(null, 'DEBUGGING_LEVEL');
log.hooks.push(
  (message, transport) => {
    message.data = message.data.map(m => typeof m === 'string' ? m.replaceAll(app.getPath('home'), '<USER_HOME_PATH>') : m);
    return message;
  }
);


log.info(`Initializing ${app.getName()} : ${app.getVersion()}`);

/**
 * CONFIGURE APPLICATION EVENTS
 */

// What to do if an attempt was made to launch a second instance
app.on('second-instance', () => {
  if (BrowserWindow.getAllWindows().length > 0) {
    const win = BrowserWindow.getAllWindows()[0];
    if (win.isMinimized()) {
      win.restore();
    }
    win.focus();
  }
});

// Run these commands when the application is ready
app.whenReady().then(() => {

  log.debug('Application startup configuration: ', JSON.stringify(settingsManager.getSettings(), null, 2));

  // Prevent untrusted/unused permissions from automatically being allowed
  // See https://www.electronjs.org/docs/tutorial/security#4-handle-session-permission-requests-from-remote-content
  electron.session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (settingsManager.getSettings(null, 'APP_PERMISSIONS').includes(permission)) {
      return callback(true);
    }
    return callback(false);
  });


  app.on('activate', () => {
    // handles macOS behaviour: closing all windows does not quit the application, so re-activating the application needs to re-create the window
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainGUI();
    }
  });

  createMainGUI();

}).catch((err) => {
  log.error('System crash event detected: ', err);
  if (app.isReady()) {
    openCrashWindow();
  } else {
    app.on('ready', () => openCrashWindow());
  }
});


// Remove the menu from the created window
app.on('browser-window-created', function (e, window) {
  window.setMenu(null);
});


app.on('web-contents-created', (event, contents) => {
  /**
 * This shouldn't technically be necessary to implement, but this takes measure to preventing webviews created in the DOM after the page has loaded DO NOT
 *  get the opportunity to obtain node integration (electron gives them their own )
 *   See https://www.electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
 */
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;
    delete webPreferences.preloadURL;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;
    webPreferences.sandbox = true;

    // Verify URL being loaded
    if (!params.src.startsWith('http://localhost') || !params.src.startsWith('http://127.0.0')) {
      event.preventDefault();
    }
  });

  // Handle external URIs;
  contents.on('new-window', (event, url) => {
    event.preventDefault();
    let matchesAllowedURL = false;
    for (const allowedUrl of settingsManager.getSettings(null, 'ALLOWED_EXTERNAL_URLS')) {
      const testUrl = allowedUrl.endsWith('/') ? allowedUrl : `${allowedUrl}/`;
      if ((url === allowedUrl) || url.startsWith(testUrl)) {
        matchesAllowedURL = true;
        break;
      }
    }

    if (matchesAllowedURL) {
      setImmediate(() => {
        electron.shell.openExternal(url, {activate: true});
      });
      return;
    }

    const errorWin = createNewWindow('Particl Desktop - load URL error', 500, 500, true);
    errorWin.once('ready-to-show', () => errorWin.show());
    errorWin.loadURL(_url.format({
      protocol: 'file:',
      pathname: path.join(
        __dirname,
        `${settingsManager.getSettings(null, 'MODE') === 'developer' ? 'src' : 'dist'}`,
        'assets',
        'modals',
        'errorExternalUrlOpen.html'
      ),
      slashes: true
    }));

  });
});


app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Run just prior to the application quitting... run before the 'quit' event.
//  This event is hooked instead of 'quit' so as to provide sufficient time for shutting down modules, etc.
app.once('will-quit', async function beforeQuit(event) {
  app.removeListener('will-quit', beforeQuit);
  event.preventDefault();

  log.info('Shutdown requested...');

  let closingWindow;

  try {

    // Display a 'modal'-like window indicating that the application is shutting down
    closingWindow = createNewWindow('Closing Particl Desktop', 320, 500, false);

    closingWindow.loadURL(_url.format({
      protocol: 'file:',
      pathname: path.join(
        __dirname,
        `${settingsManager.getSettings(null, 'MODE') === 'developer' ? 'src' : 'dist'}`,
        'assets',
        'modals',
        'closing.html'
      ),
      slashes: true
    }));

    closingWindow.setClosable(false);

  } catch (err) {
    log.error('Failed creating closing modal window -> ', err);
  }

  if (electron.Tray.length > 0) {
    for (let ii = 0; ii < electron.Tray.length; ii++) {
      try {
        const t = electron.Tray[ii];
        t.destroy();
      } catch (err) {
        log.error('Failed to cleanup Tray item... deferring to system cleanup');
      }
    }
  }

  log.info('Cleaning up modules.');
  await modManager.cleanup(true).catch(() => {
    // do nothing, here just to ensure that we prevent errors from aborting the shutdown process
  });

  if (closingWindow) {
    closingWindow.setClosable(true);
    closingWindow.close();
  }
  log.info('Shutdown complete.');
  app.quit();
});


function createNewWindow(title, minHeight, minWidth, showFrame = true) {
  return new BrowserWindow({
    title:     title,
    width:     minWidth,
    minWidth:  minWidth,
    height:    minHeight,
    minHeight: minHeight,
    icon:      path.join(__dirname, 'resources', 'icon.png'),

    backgroundColor: '#222828',
    frame: showFrame !== false,
    darkTheme: true,

    webPreferences: {
      backgroundThrottling: false,
      webviewTag: false,
      nodeIntegration: false,
      sandbox: true,
      contextIsolation: true,
      webSecurity: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
}


function openCrashWindow() {
  const errorWindow = createNewWindow('Particl Desktop Error', 320, 500, true);
  errorWindow.loadURL(_url.format({
    protocol: 'file:',
    pathname: path.join(__dirname, `${settingsManager.getSettings(null, 'MODE') === 'developer' ? 'src' : 'dist'}`, 'assets', 'modals', 'crash.html'),
    slashes: true
  }));

  errorWindow.setClosable(true);
  errorWindow.on('closed', function () {
    app.quit();
  });
}


function createMainGUI() {
  log.info('Building up UI elements...');

  createSystemTray();

  const win = createNewWindow('Particl Desktop', 675, 1270, true);

  win.setMenuBarVisibility(false);
  win.setAutoHideMenuBar(true);

  const url = settingsManager.getSettings(null, 'MODE') === 'developer' ?
    'http://localhost:4200' :
    _url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    });

  win.loadURL(url);

  if (settingsManager.getSettings(null, 'STARTUP_WITH_DEVTOOLS') === true) {
    win.webContents.openDevTools();
  }

  // win.on('closed', async () => {
  //   log.info('Tearing down UI');
  //   // TODO: stop other UI functionality: notifications, marketplace, etc
  // });

  mainWindow = win;
}


function createSystemTray() {

  if (electron.Tray.length > 0) {
    return;
  }

  if (process.platform === 'darwin') {
    electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate([
      {
        label: app.getName(),
        submenu: [
          { label: 'Quit', role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'pasteandmatchstyle' },
          { role: 'delete' },
          { role: 'selectall' }
        ]
      }
    ]));

  }

  const tray = new electron.Tray(path.join(__dirname, 'resources/icon.png'));
  tray.setToolTip(`${app.getName()} ${app.getVersion()}`);
  tray.setContextMenu(electron.Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        { label: 'Open Dev Tools', click() { mainWindow.webContents.openDevTools(); } }
      ]
    },
    {
      role: 'window',
      submenu: [
        { label: 'Close', click() { app.quit() } },
        { label: 'Hide', click() { mainWindow.hide(); } },
        { label: 'Show', click() { mainWindow.show(); } },
        { label: 'Maximize', click() { mainWindow.maximize(); } }
      ]
    },
    {
      role: 'help',
      submenu: [
        { label: 'About ' + app.getName(), click() { electron.shell.openExternal('https://particl.io/#about'); } },
        { label: 'Visit Particl.io', click() { electron.shell.openExternal('https://particl.io'); } },
        { label: 'Visit Electron', click() { electron.shell.openExternal('https://electron.atom.io'); } }
      ]
    }
  ]));
}
