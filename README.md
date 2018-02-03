# particl-desktop - UI

![UI Preview](preview.gif)

> *"Particl is an open source project that aims to restore the balance of privacy on the internet."*

We provide a decentralized privacy platform with a suite of tools to enhance your online privacy:
* **An anonymous cryptocurrency** - send and receive the PART cryptocurrency without revealing the transaction history
* **End-to-end encrypted messaging** - communicate in a secure and decentralized manner without revealing your IP address
* **A private marketplace** - buy and sell goods without leaving a trace

This repository is the user interface that works in combination with our [`particl-core`](https://github.com/particl/particl-core).

[![Download the packaged wallet for Mac, Windows and Linux](download-button.png)](https://github.com/particl/particl-desktop/releases)

# Contribute
[![Snyk](https://snyk.io/test/github/particl/particl-desktop/badge.svg)](https://snyk.io/test/github/particl/particl-desktop)
[![Build Status](https://travis-ci.org/particl/particl-desktop.svg?branch=master)](https://travis-ci.org/particl/particl-desktop)
[![Coverage Status](https://coveralls.io/repos/github/particl/particl-desktop/badge.svg?branch=master)](https://coveralls.io/github/particl/particl-desktop?branch=master)
[![Code Climate](https://codeclimate.com/github/particl/particl-desktop/badges/gpa.svg)](https://codeclimate.com/github/particl/particl-desktop)
[![Greenkeeper badge](https://badges.greenkeeper.io/particl/particl-desktop.svg)](https://greenkeeper.io/)

## Development

### Boostrapping for development:
* Download + Install [Node.js®](https://nodejs.org/) 6.4 - 7.10
* Download + Install [git](https://git-scm.com/)

```bash
git clone https://github.com/particl/particl-desktop
cd particl-desktop
npm install
```

### Development with Electron
* Run `ng serve` to start the dev server.
* Run `npm run start:electron:dev -- -testnet -debug` to start the electron application. Daemon will be updated and launched automatically.

### Development with a Browser (deprecating)
* Run `ng serve`. Daemon will not launch automatically.
* Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

#### Interact with particl-core daemon
You can directly interact with the daemon ran by the Electron version.
```
./particl-cli -testnet getblockchaininfo
```

## Running

### Start Electron
* `npm run start:electron:fast` - disables debug messages for faster startup

### Package Electron
* `npm run package:win` - Windows
* `npm run package:mac` - OSX
* `npm run package:linux` - Linux

## Contributors
Join us in [#particl-dev:matrix.org](https://riot.im/app/#/room/#particl-dev:matrix.org) on [riot](https://riot.im)
