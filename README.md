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
* [License](#license)

## About
The [Particl Project](https://particl.news/about/) is committed to providing everyone with privacy, security, resistance to censorship, and freedom in this digital age.

**Particl Desktop** is a standalone, multi-purpose desktop application capable of hosting multiple functionalities at once and delivering a streamlined user-experience when interacting with Particl's services and applications. 

Particl Desktop provides easy access to the Particl Blockchain and the SMSG protocol, hosts Particl coin (PART) related wallets, gives users access to the Particl Marketplace and the encrypted chat application. Additionally, Particl Desktop supports a bot framework to optionally integrate interactions with third-party services within a user-friendly interface. Particl Desktop generally refers to Particl’s flagship application.

On a technical level, with **Particl Desktop**, you get access to a decentralized platform delivering the following to you:

* **The Particl Network** 
All services are peer to peer (p2p). No central authority or central server stands between you and the people you interact with. It's a direct connection.
   * **An encrypted data exchange protocol** 
Particl SecureMessaging (SMSG protocol) is a decentralized storage network (DSN) to store and transfer data between nodes in a privacy-preserving manner. It enables a private and secure environment for e-commerce and communications between users. SMSG powers the Particl Marketplace without bloating the blockchain with excessive data and without leaving any permanent record.
   * **A programmable blockchain with advanced privacy features** 
The Particl Blockchain is a decentralized, immutable, and censorship-proof ledger. It is based on bitcoin technology and has been carefully enhanced by the Particl team to provide a more robust level of privacy through industry-leading privacy technologies. The Particl Blockchain processes and validates payments between two users without requiring any third-party such as a bank or a payment processor.
* **The privacy coin PART** 
PART is a blazing fast and highly flexible cryptocurrency with multiple privacy states. It lets you send and receive payments without revealing your financial data to anyone. The PART coin provides automation, interoperability, complete resistance to censorship, and privacy to the Particl Marketplace.
* **The [Particl Marketplace](https://particl.io/marketplace)** 
The Particl Marketplace is a decentralized and privacy-oriented marketplace that lets you buy and sell goods and services on the web without leaving any digital footprint behind. Payments between two users can be initiated using multiple currencies but always settle in PART. No bank account, documentation, email, phone number, or any other identification type is required. It transforms today's e-commerce into a free, secure, and trustworthy place where the market conditions are fair and equal to all.

Repositories: [Particl Core](https://github.com/particl/particl-core) | [Particl Marketplace](https://github.com/particl/particl-market) 

## Participate

### Chats

* **For developers** The developers chat [#particl-dev:matrix.org](https://app.element.io/#/room/#particl-dev:matrix.org) using [Element](https://element.io) (formerly Riot).
* **For community** Join the multilingual, open community chat [https://discord.me/particl](https://discord.me/particl) [![Discord](https://img.shields.io/discord/391967609660112925)](https://discord.me/particl) with [Discord](https://discord.com).

[![Twitter Follow](https://img.shields.io/twitter/follow/ParticlProject?label=follow%20us&style=social)](http://twitter.com/particlproject)
[![Subreddit subscribers](https://img.shields.io/reddit/subreddit-subscribers/particl?style=social)](http://reddit.com/r/particl)

### Installation

For the average user, binaries can be downloaded and installed. It is the easiest way to get started.

[Download](https://github.com/particl/particl-desktop/releases/latest) 

There currently is an open testnet phase for the upcoming "Particl V3" release. Feel free to test the new version; we happily look forward to your feedback.

[V3 Testnet Download](https://github.com/particl/particl-desktop/releases/)

## Development

[![Snyk](https://snyk.io/test/github/particl/particl-desktop/badge.svg)](https://snyk.io/test/github/particl/particl-desktop)
[![Build Status](https://travis-ci.org/particl/particl-desktop.svg?branch=master)](https://travis-ci.org/particl/particl-desktop)
[![Coverage Status](https://coveralls.io/repos/github/particl/particl-desktop/badge.svg?branch=master)](https://coveralls.io/github/particl/particl-desktop?branch=master)
[![Code Climate](https://codeclimate.com/github/particl/particl-desktop/badges/gpa.svg)](https://codeclimate.com/github/particl/particl-desktop)
[![Greenkeeper badge](https://badges.greenkeeper.io/particl/particl-desktop.svg)](https://greenkeeper.io/)

### Requirements

[Node.js®](https://nodejs.org/) v10, [git](https://git-scm.com/), and [yarn](https://yarnpkg.com/en/)

### Development install

Clone the repo & fetch the dependencies:

```bash
git clone https://github.com/particl/particl-desktop
cd particl-desktop
yarn install
```

> Note: The most recent development happens on the `dev` branch. Keep in mind that the development currently happens on a private fork of this repo. This repository is the user interface that works in combination with our [`particl-core`](https://github.com/particl/particl-core).

In the project's folder:

1. Run `ng serve` to start the dev server and keep it running
1. In another terminal window, run `yarn run start:electron:dev -testnet --devtools` to start Particl Desktop on testnet (the daemon will be updated and launched automatically)
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

Delete the marketplace testnet `database` folder and restart the app:

| OS      | path                                                       |
|---------|------------------------------------------------------------|
| Linux   | `~/.particl-market/testnet/03/`                            |
| Windows | `%APPDATA%/Particl Market/testnet/03/`                     |
| macOS   | `~/Library/Application Support/particl-market/testnet/03/` |

### Other issues

See our [Particl Wiki](https://particl.wiki/) for the most common problems or join [#particlhelp:matrix.org](https://app.element.io/#/room/#particlhelp:matrix.org) on [Element](https://element.io) for community help.

## Bug bounties

Particl is a security and privacy oriented project. As such, a permanent bug bounty program is put in place in order to encourage the responsible disclosure of any bug or vulnerability contained within the Particl code and reward those who find them.

[Particl Bug Bounty Program](https://particl.io/bug-bounties/)

## License

Particl Desktop is released under [GNU General Public License v2.0](LICENSE).
