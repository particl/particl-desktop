const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path          = require('path');
const fs            = require('fs');
const url           = require('url');
const platform      = require('os').platform();


// @TODO: possibly move this to some external verification module
const ALLOWED_EXTERNAL_URLS = [
  'https://explorer.particl.io',
  'https://explorer-testnet.particl.io',

  // particl related domains
  'https://particl.io',
  'https://particl.news',
  'https://particl.community',
  'https://particl.wiki',
  'https://ccs.particl.io',
  'https://academy.particl.io',

  // social media links - url path included to prevent any accidental bypass
  'https://discordapp.com/invite/2tVJaZ9',
  'https://app.element.io/#/group/+particl:matrix.org',
  'https://t.me/particlproject',
  'https://twitter.com/particlProject',
  'https://www.facebook.com/ParticlProject',
  'https://www.reddit.com/r/Particl',
  'https://fosstodon.org/@particl',
  'https://www.youtube.com/c/Particl',
  'https://bitcointalk.org/index.php?topic=1835782.0',

  'https://github.com/particl',
];

// @TODO: possibly move this to some external verification module
const APP_PERMISSIONS = ['notifications'];


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let closingWindow;
let tray;
let isTerminating = false;


// Parse command line arguments
if (app.getName().toLowerCase().includes('testnet')) {
  process.argv.push('-testnet');
}

/* correct userData to respect Linux standards */
if (process.platform === 'linux') {
  app.setName(app.getName().toLowerCase().split(' ').join('-'));
  app.setPath('userData', `${app.getPath('appData')}/${app.getName()}`);
}

// Ensure only one application instance is currently running
const instanceLock = app.requestSingleInstanceLock();

let log;
let appIsReady = false;
let options = {};

if (!instanceLock) {
  app.quit();
} else {  // This is the primary instance that we're creating

  try {
    /* check for paths existence and create */
    [ app.getPath('userData')].map(path => !fs.existsSync(path) && fs.mkdirSync(path));


    log                  = require('./modules/logger').init();
    options              = require('./modules/options').get();
    const init           = require('./modules/init');
    const _auth          = require('./modules/webrequest/http-auth');

    log.info(`init ${app.getName()} : ${app.getVersion()}`);

    app.on('second-instance', () => {
      // Someone tried to run a second instance, we should focus our window.
      // OSX users with a closed mainWindow are catered for with the 'activate' event
      if (!isTerminating && mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      }
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
      appIsReady = true;

      /**
       * Prevent untrusted/unused permissions from automatically being allowed
       * See https://www.electronjs.org/docs/tutorial/security#4-handle-session-permission-requests-from-remote-content
       */
      electron.session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        if (APP_PERMISSIONS.includes(permission)) {
          // Approves the permissions request
          return callback(true);
        }

        return callback(false);
      });


      log.info('initialization complete');
      log.debug('argv', process.argv);
      _auth.init();
      init.startSystem();
      initMainWindow();
    });


    app.on('activate', function () {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        initMainWindow();
      }
    });

    app.on('browser-window-created', function (e, window) {
      window.setMenu(null);
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.once ('will-quit', async function beforeQuit(event) {
      app.removeListener('will-quit', beforeQuit);
      event.preventDefault();

      isTerminating = true;

      log.info('Shutdown of application started...');

      try {

        // Display a 'modal'-like window indicating that the application is shutting down
        closingWindow = new BrowserWindow({
          width:     500,
          minWidth:  500,
          height:    320,
          minHeight: 320,
          icon:      path.join(__dirname, 'resources/icon.png'),

          backgroundColor: '#222828',
          frame: false,
          darkTheme: true,

          webPreferences: {
            webviewTag: false,
            nodeIntegration: false,
            sandbox: true,
            contextIsolation: false,
            nativeWindowOpen: true,
            webSecurity: true,
            enableRemoteModule: false
          }
        });

        closingWindow.loadURL(url.format({
          protocol: 'file:',
          pathname: path.join(__dirname, `${options.dev ? 'src' : 'dist'}`, 'assets', 'modals', 'closing.html'),
          slashes: true
        }));

        closingWindow.setClosable(false);

        closingWindow.on('closed', function () {
          closingWindow = null;
        });

      } catch (err1) {
        log.error('Failed creating closing modal window -> ', err1);
      }

      if (platform !== "darwin" && tray) {
        try {
          tray.destroy();
        } catch (err2) {
          // do nothing.. we don't care because electron will destroy it if not already destroyed
        }
      }

      // if (mainWindow) {
      //   try {
      //     mainWindow.close();
      //   } catch(err) {
      //     // do nothing: window is likely closed already
      //   }
      // }

      await init.stopSystem().catch(() => {
        // do nothing, here just to ensure that we prevent errors from aborting the shutdown process
      });

      closingWindow.setClosable(true);

      closingWindow.close();
      app.quit();
    });

    app.on('quit', () => {
      log.info('Exiting!');
    });


    /**
     * This shouldn't technically be necessary to implement, but this takes measure to preventing webviews created in the DOM after the page has loaded DO NOT
     *  get the opportunity to obtain node integration (electron gives them their own )
     *   See https://www.electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
     */
    app.on('web-contents-created', (event, contents) => {
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
      })
    })


    /*
    ** initiates the Main Window
    */
    function initMainWindow() {
      log.info('Building up UI elements...');

      if (platform !== "darwin") {
        makeTray();
      } else {
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
        icon:      path.join(__dirname, 'resources', 'icon.png'),

        frame: true,
        darkTheme: true,
        backgroundColor: '#222828',

        webPreferences: {
          backgroundThrottling: false,
          webviewTag: false,
          nodeIntegration: false,
          sandbox: true,
          contextIsolation: true,
          nativeWindowOpen: true,
          webSecurity: true,
          enableRemoteModule: false,
          preload: path.join(__dirname, 'preload.js')
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
          pathname: path.join(__dirname, 'dist', 'index.html'),
          slashes: true
        }));
      }

      init.startGUI(mainWindow);

      // Open the DevTools.
      if (options.devtools) {
        mainWindow.webContents.openDevTools();
      }


      // handle external URIs;
      // NOTE: this is called AFTER the window object has already been opened by `window.open()`
      mainWindow.webContents.on('new-window', (event, requestUrl) => {
        event.preventDefault();

        let matchesAllowedURL = false;
        for (const allowedUrl of ALLOWED_EXTERNAL_URLS) {
          const url = allowedUrl.endsWith('/') ? allowedUrl : `${allowedUrl}/`;
          if ((requestUrl === allowedUrl) || requestUrl.startsWith(url)) {
            matchesAllowedURL = true;
            break;
          }
        }

        if (matchesAllowedURL) {
          electron.shell.openExternal(requestUrl);
          return;
        }

        const errorUrl = url.format({
          protocol: 'file:',
          pathname: path.join(__dirname, `${options.dev ? 'src' : 'dist'}`, 'assets', 'modals', 'errorExternalUrlOpen.html'),
          slashes: true
        });

        const errorWin = new BrowserWindow({
          width:     500,
          minWidth:  500,
          height:    320,
          minHeight: 320,
          icon:      path.join(__dirname, 'resources/icon.png'),

          backgroundColor: '#222828',
          frame: true,
          darkTheme: true,
          show: false,
          webPreferences: options.webPreferences
        });
        errorWin.once('ready-to-show', () => errorWin.show());
        errorWin.loadURL(errorUrl);

        event.newGuest = errorWin;
      });

      // Emitted when the window is closed.
      mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        log.info('Tearing down UI');
        init.stopGUI();
        mainWindow = null;
      });
    }

    /*
    ** creates the tray icon and menu
    */
    function makeTray() {

      // Default tray image + icon
      let trayImage = path.join(__dirname, 'resources/icon.png');

      // The tray context menu
      const contextMenu = electron.Menu.buildFromTemplate([
        {
          label: 'View',
          submenu: [
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
            }
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
      tray = new electron.Tray(trayImage);

      // Set the tray icon
      tray.setToolTip(`${app.getName()} ${app.getVersion()}`);
      tray.setContextMenu(contextMenu);

      // Always show window when tray icon clicked
      tray.on('click', function () {
        mainWindow.show();
      });

      return trayImage;
    }
  } catch (err) {
    if (log) {
      log.error('Application crash: ', err);
    }

    function createCrashWindow() {

      const errorWindow = new BrowserWindow({
        width:     500,
        minWidth:  500,
        height:    320,
        minHeight: 320,
        icon:      path.join(__dirname, 'resources/icon.png'),

        backgroundColor: '#222828',
        frame: true,
        darkTheme: true,

        webPreferences: {
          webviewTag: false,
          nodeIntegration: false,
          sandbox: true,
          contextIsolation: false,
          nativeWindowOpen: true,
          webSecurity: true,
          enableRemoteModule: false
        }
      })
      errorWindow.loadURL(url.format({
        protocol: 'file:',
        pathname: path.join(__dirname, `${options.dev ? 'src' : 'dist'}`, 'assets', 'modals', 'crash.html'),
        slashes: true
      }));

      errorWindow.setClosable(true);
      errorWindow.on('closed', function () {
        app.quit();
      });
    }

    if (!appIsReady) {
      app.on('ready', () => {
        createCrashWindow();
      });
    } else {
      createCrashWindow();
    }
  }
}
