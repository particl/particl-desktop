const electron = require('electron');
// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const platform = require('os').platform();
const zmq = require('zeromq');
const sock = zmq.socket('sub');
const log = require('electron-log');

log.transports.file.appName = '.particl';
log.transports.file.file = log.transports.file
  .findLogPath(log.transports.file.appName)
  .replace('log.log', 'partgui.log');

const daemonManager = require('./modules/clientBinaries/clientBinaries');
const rpc = require('./modules/rpc/rpc');

sock.connect('tcp://127.0.0.1:30000');
sock.subscribe('hashtx');
sock.subscribe('hashblock');

sock.on('message', function(topic, message) {
  console.log('received a message related to:', topic, 'containing message:', message);
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;
let daemon;

let openDevTools = false;
let options;

function createWindow () {

  options = parseArguments();
  options.port = options.rpcport
    ? options.rpcport
    : options.testnet
      // testnet port
      ? 51935
      // mainnet port
      : 51735;
  options.rpcbind = options.rpcbind
    ? options.rpcbind
    : 'localhost';

  // check for daemon version, maybe update, and keep the daemon's process for exit
  daemonManager.init(false, options).then(child => {
    daemon = child ? child : undefined;
    rpc.init(options);
  }).catch(error => {
    console.error(error);
  });

  // Default tray image + icon
  let trayImage = path.join(__dirname, 'src/assets/icons/logo.png');

  // Determine appropriate icon for platform
  if (platform === 'darwin') {
    trayImage = path.join(__dirname, 'src/assets/icons/logo.icns')
  }
  else if (platform === 'win32' || platform === 'win64') {
    trayImage = path.join(__dirname, 'src/assets/icons/logo.ico')
  }

  // The tray context menu
  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {role: 'about'},
        {
          label: 'Visit Particl.io',
          click () { require('electron').shell.openExternal('https://particl.io') }
        },
        {
          label: 'Visit Electron',
          click () { require('electron').shell.openExternal('https://electron.atom.io') }
        }
      ]
    }
  ])

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: trayImage,
    webPreferences: {
      //sandbox: true,
      //nodeIntegration: false,
      preload: 'preload.js',
    },
  })

  // handle external URIs
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    electron.shell.openExternal(url);
  });

  // and load the index.html of the app.
  if (options.dev) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Open the DevTools.
  if (openDevTools || options.devtools) {
    mainWindow.webContents.openDevTools()
  }

  function test() {
    mainWindow.webContents.send("ipc-test", "test")
  }

  setTimeout(test, 2000);
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // Create the tray icon
  tray = new electron.Tray(trayImage)

  // TODO, tray pressed icon for OSX? :)
  if (platform === "darwin") {
    tray.setPressedImage(imageFolder + '/osx/trayHighlight.png');
  }

  // Set the tray icon
  tray.setToolTip('This is my application')
  tray.setContextMenu(contextMenu)
}

/*
** compose options from arguments
**
** exemple:
** --dev -testnet -reindex -rpcuser=user -rpcpassword=pass
** returns
** {
**   dev: true,
**   testnet: true,
**   reindex: true,
**   rpcuser: user,
**   rpcpassword: pass
** }
*/
function parseArguments() {

  let options = {};
  let args = process.argv.splice(1);

  function stripDashes(str) {
    while (str[0] === '-') {
      str = str.substr(1);
    }
    return (str);
  }

  args.forEach(arg => {
    if (arg.includes('=')) {
      arg = arg.split('=');
      options[stripDashes(arg[0])] = arg[1];
    } else {
      options[stripDashes(arg)] = true;
    }
  });

  return (options);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', function () {
  // kill the particl daemon if initiated on launch
  if (daemon) {
    daemon.kill();
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('browser-window-created',function(e, window) {
  window.setMenu(null);
});
