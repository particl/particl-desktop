# Partgui

[![Build Status](https://travis-ci.org/particl/partgui.svg?branch=master)](https://travis-ci.org/particl/partgui)
[![Coverage Status](https://coveralls.io/repos/github/particl/partgui/badge.svg?branch=master)](https://coveralls.io/github/particl/partgui?branch=master)
[![Code Climate](https://codeclimate.com/github/particl/partgui/badges/gpa.svg)](https://codeclimate.com/github/particl/partgui)
[![Greenkeeper badge](https://badges.greenkeeper.io/particl/partgui.svg)](https://greenkeeper.io/)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development server
* Download + Install [nodejs](https://nodejs.org/) 6.4 - 7.10
* Download + Install [git](https://git-scm.com/)
*
```
git clone https://github.com/particl/partgui
cd partgui
npm install
```
* Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## With real rpc data
### Start
```
./particld -daemon -testnet -debug -rpcuser=test -rpcpassword=test -rpccorsdomain=http://localhost:4200
```

### Stop
```
./particl-cli -rpcuser=test -rpcpassword=test stop
```

You can now navigate to `http://localhost:4200/`.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
