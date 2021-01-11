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
* [Participate](#participate)
* [Development](#development)
* [Troubleshooting](#troubleshooting)
* [Bug Bounties](#bug-bounties)
* [Licence](#licence)

## About
The [Particl Project](https://particl.news/about/) is committed to providing everybody with privacy, security, and freedom in the digital age.

**Particl Desktop** is our feature-rich flagship client. It's currently hosting the Particl Marketplace application and an easy to use cryptocurrency wallet for PART coin. It is the recommended application for our users.

Technically spoken, Particl's decentralized platform delivers the following to put you into control:

* **A peer to peer network** 
All services are p2p. No central authority or central server is between you and the people you interact with. It's a direct connection.
* **An encrypted data exchange protocol** 
Communicate in a secure and decentralized manner without revealing your data or location.
* **A programmable blockchain with privacy features** 
Based on Bitcoin's latest code and carefully enhanced with bullet-proof privacy features from the industry leading technologies–which you may know from [`Monero Project`](https://github.com/monero-project/monero).
* **The privacy coin PART** 
Blazing fast, with multiple privacy-states, send and receive the PART cryptocurrency without revealing your financial data to anyone. Additionally, it's delivering incomparable automation, interoperability, and privacy to the Particl Marketplace.
* **The [Particl Marketplace](https://particl.io/marketplace)** 
Buy and sell goods and services without leaving a trace. Payments shall become available in multiple currencies but always settle in PART. No bank account is required. Transform today's e-commerce into a free, secure, and trustworthy place, yielding fair market conditions. 

## Participate

### Chats

* **For developers** The developers chat [#particl-dev:matrix.org](https://app.element.io/#/room/#particl-dev:matrix.org) with [Element](https://element.io) (formerly Riot) for more info and/or assistance.
* **For community** Join the multilingual, open community chat [https://discord.me/particl](https://discord.me/particl) [![Discord](https://img.shields.io/discord/391967609660112925)](https://discord.me/particl) with [Discord](https://discord.com).

[![Twitter Follow](https://img.shields.io/twitter/follow/ParticlProject?label=follow%20us&style=social)](http://twitter.com/particlproject)
[![Subreddit subscribers](https://img.shields.io/reddit/subreddit-subscribers/particl?style=social)](http://reddit.com/r/particl)

### Installation

For the average user, binaries are available ready for download and installation.

[Download](https://github.com/particl/particl-desktop/releases/latest) 

Currently, we have an open testnet phase for the upcoming V3 release. Feel free to test the new version, and we happily look forward to your feedback.

[Testnet Download](https://github.com/particl/particl-desktop/releases/)

## Development

[![Snyk](https://snyk.io/test/github/particl/particl-desktop/badge.svg)](https://snyk.io/test/github/particl/particl-desktop)
[![Build Status](https://travis-ci.org/particl/particl-desktop.svg?branch=master)](https://travis-ci.org/particl/particl-desktop)
[![Coverage Status](https://coveralls.io/repos/github/particl/particl-desktop/badge.svg?branch=master)](https://coveralls.io/github/particl/particl-desktop?branch=master)
[![Code Climate](https://codeclimate.com/github/particl/particl-desktop/badges/gpa.svg)](https://codeclimate.com/github/particl/particl-desktop)
[![Greenkeeper badge](https://badges.greenkeeper.io/particl/particl-desktop.svg)](https://greenkeeper.io/)

### Requirements

[Node.js®](https://nodejs.org/) v10, [git](https://git-scm.com/), and [yarn](https://yarnpkg.com/en/)

### Development install

Clone the repo & fetch dependencies:

```bash
git clone https://github.com/particl/particl-desktop
cd particl-desktop
yarn install
```

> Note: most recent development happens on `dev` branch. Keep in mind that the development currently happens on a private fork of this repo. This repository is the user interface that works in combination with our [`particl-core`](https://github.com/particl/particl-core).

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

## Bug bounties

Particl is a security and privacy oriented project. As such, a permanent bug bounty program is put in place in order to encourage the responsible disclosure of any bug or vulnerability contained within the Particl code and reward those who find them.

[Particl Bug Bounty Program](https://particl.io/bug-bounties/)

## Licence

Particl Desktop is released under [GNU General Public License v2.0](LICENCE).
