[![Platform:Windows](https://img.shields.io/badge/platform-Windows-lightgrey)](https://github.com/particl/particl-desktop/releases/latest)
[![Platform:macOS](https://img.shields.io/badge/platform-macOS-lightgrey)](https://github.com/particl/particl-desktop/releases/latest)
[![Platform:Linux](https://img.shields.io/badge/platform-Linux-lightgrey)](https://github.com/particl/particl-desktop/releases/latest)

# Particl Desktop

![Particl Desktop 3.0 Preview](.github-readme/particl-desktop-3.0-preview.gif)

<p align="center">
   <a href="https://github.com/particl/particl-desktop/releases"><img src=".github-readme/button-download.png" alt="Download Wallet"></a>
   <a href="https://particl.io"><img src=".github-readme/button-website.png" alt="Official website"></a>
   <a href="https://particl.news"><img src=".github-readme/button-news.png" alt="Lastest news"></a>
   <a href="https://particl.wiki"><img src=".github-readme/button-wiki.png" alt="Project wiki"></a>
</p>

**Table of Contents**

* [About](#about)
* [Contribute](#contribute)
   * [Requirements](#requirements)
   * [Installation](#installation)
   * [Development](#development)
   * [Packaging](#packaging)
* [Troubleshooting](#troubleshooting)
* [Licence](#licence)

## About

> Particl is an open source project that aims to restore the balance of privacy on the internet

Particl Desktop is our feature-rich flagship client, recommended for most users for interacting with Particl network.

We provide a decentralized privacy platform with a suite of tools to enhance your online privacy:

* **An anonymous cryptocurrency** – send and receive the PART cryptocurrency without revealing the transaction history
* **End-to-end encrypted messaging** – communicate in a secure and decentralized manner without revealing your IP address
* **A private marketplace** – buy and sell goods without leaving a trace

This repository is the user interface that works in combination with our [`particl-core`](https://github.com/particl/particl-core).


## Contribute

[![Snyk](https://snyk.io/test/github/particl/particl-desktop/badge.svg)](https://snyk.io/test/github/particl/particl-desktop)
[![Build Status](https://travis-ci.org/particl/particl-desktop.svg?branch=master)](https://travis-ci.org/particl/particl-desktop)
[![Coverage Status](https://coveralls.io/repos/github/particl/particl-desktop/badge.svg?branch=master)](https://coveralls.io/github/particl/particl-desktop?branch=master)
[![Code Climate](https://codeclimate.com/github/particl/particl-desktop/badges/gpa.svg)](https://codeclimate.com/github/particl/particl-desktop)
[![Greenkeeper badge](https://badges.greenkeeper.io/particl/particl-desktop.svg)](https://greenkeeper.io/)

#### Developers Chat

Join our open developers chat [#particl-dev:matrix.org](https://app.element.io/#/room/#particl-dev:matrix.org) with [Element](https://element.io) (formerly Riot) for more info and/or assistance.

Keep in mind that the development currently happens on a private fork of this repo. 

#### Community Chat 
Join our multilingual, open community chat [https://discord.me/particl](https://discord.me/particl) [![Discord](https://img.shields.io/discord/391967609660112925)](https://discord.me/particl) with [Discord](https://discord.com).

#### Socialmedia

[![Twitter Follow](https://img.shields.io/twitter/follow/ParticlProject?label=follow%20us&style=social)](http://twitter.com/particlproject)
[![Subreddit subscribers](https://img.shields.io/reddit/subreddit-subscribers/particl?style=social)](http://reddit.com/r/particl)

### Requirements

* [Node.js®](https://nodejs.org/) v10
* [git](https://git-scm.com/)
* [yarn](https://yarnpkg.com/en/)

### Installation

Clone the repo & fetch dependencies:

```bash
git clone https://github.com/particl/particl-desktop
cd particl-desktop
yarn install
```

### Development

> Note: most recent development happens on `dev` branch

In project's folder:

1. Run `ng serve` to start the dev server and keep it running
1. In another terminal window, run `yarn run start:electron:dev -testnet --devtools` to start Particl Desktop on testnet (daemon will be updated and launched automatically)
   * `-testnet` – for running on testnet (omit for running the client on mainnet)
   * `-reindex` – reindexes the blockchain (in case you're stuck)
   * `--devtools` – automatically opens Developer Tools on client launch

#### Interact with particl-core daemon

You can directly interact with the daemon ran by the Electron version:

```
./particl-cli -testnet getblockchaininfo
```

### Packaging

#### Windows-only requirements

Building for Windows requires the 32-bit libraries to be available:

```
sudo apt-get install gcc-multilib
sudo apt-get install g++-multilib
```

#### Packaging commands

* `yarn run package:win` – Windows
* `yarn run package:mac` – macOS
* `yarn run package:linux` – Linux


## Troubleshooting

### Development issues

#### Blockchain syncing stuck

Restart the app with `-reindex` flag:

```
yarn run start:electron:dev -testnet --devtools -reindex
```

#### Marketplace fails to load

Delete marketplace `database` folder and restart app:

| OS      | path                                                       |
|---------|------------------------------------------------------------|
| Linux   | `~/.particl-market/testnet/03/`                            |
| Windows | `%APPDATA%/Particl Market/testnet/03/`                     |
| macOS   | `~/Library/Application Support/particl-market/testnet/03/` |

### Other issues

See our [Particl Wiki](https://particl.wiki/) for most common problems or join [#particlhelp:matrix.org](https://app.element.io/#/room/#particlhelp:matrix.org) on [Element](https://element.io) for community help.


## Licence

Particl Desktop is released under [GNU General Public License v2.0](LICENCE).
