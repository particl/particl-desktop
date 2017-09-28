# Particl-UI

![UI Preview](preview.png)

[![Build Status](https://travis-ci.org/particl/partgui.svg?branch=master)](https://travis-ci.org/particl/partgui)
[![Coverage Status](https://coveralls.io/repos/github/particl/partgui/badge.svg?branch=master)](https://coveralls.io/github/particl/partgui?branch=master)
[![Code Climate](https://codeclimate.com/github/particl/partgui/badges/gpa.svg)](https://codeclimate.com/github/particl/partgui)
[![Greenkeeper badge](https://badges.greenkeeper.io/particl/partgui.svg)](https://greenkeeper.io/)

> *"Particl is an open source project that aims to restore the balance of privacy on the internet."* 

We provide a decentralized privacy platform with a suite of tools to enhance your online privacy:
* **An anonymous cryptocurrency** - send and receive the PART cryptocurrency without revealing the transaction history
* **End-to-end encrypted messaging** - communicate in a secure and decentralized manner without revealing your IP address
* **A private marketplace** - buy and sell goods without leaving a trace

This repository is the user interface that works in combination with our [`particl-core`](https://github.com/particl/particl-core).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development

### Boostrapping development:
* Download + Install nodejs 6.4 - 7.10
* Download + Install git

```
git clone https://github.com/particl/partgui
cd partgui
npm install
```

### Development in Electron
* Run `ng serve` to start the dev server.
* Run `npm run start:electron:dev -- -testnet` in another window to start the electron application.

## Development server
* Download + Install [nodejs](https://nodejs.org/) 6.4 - 7.10
* Download + Install [git](https://git-scm.com/)

```
git clone https://github.com/particl/partgui
cd partgui
npm install
```
* Run `ng serve` for a dev server. 
* Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Start the particl-core daemon
### Start
```
./particld -daemon -testnet -debug -rpcuser=test -rpcpassword=test -rpccorsdomain=http://localhost:4200
```

### Stop
```
./particl-cli -rpcuser=test -rpcpassword=test stop
```

You can now navigate to `http://localhost:4200/`.