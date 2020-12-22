import * as app from '../../package.json';
import * as MP from '../../node_modules/particl-marketplace/package.json';

export const environment = {
  production: true,
  envName: 'test',
  releasesUrl: 'https://api.github.com/repos/particl/particl-desktop/releases/latest',
  name: app.name,
  version: app.version,
  preRelease: app.preRelease,
  marketVersion: MP.version,
  walletVersion: app.appVersions.wallet,
  particlHost: 'localhost',
  particlPort: 51935,
  marketHost: 'localhost',
  marketPort: 45492,
  botHost: 'localhost',
  botPort: 3001,
  isTesting: true
};
