import * as app from '../../package.json';
import * as MP from '../../node_modules/@zasmilingidiot/particl-marketplace/package.json';

export const environment = {
  production: true,
  name: app.name,
  version: app.version,
  preRelease: app.preRelease,
  releasesUrl: 'https://api.github.com/repos/particl/particl-desktop/releases/latest',
  envName: 'prod',
  marketVersion: MP.version,
  walletVersion: app.appVersions.wallet,
  governanceVersion: app.appVersions.governance,
  particlHost: 'localhost',
  particlPort: 51735,
  marketHost: 'localhost',
  marketPort: 45492,
  botHost: 'localhost',
  botPort: 3001,
  isTesting: false
};
