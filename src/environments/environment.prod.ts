declare const require: any;

export const environment = {
  production: true,
  name: require('../../package.json').name,
  version: require('../../package.json').version,
  preRelease: require('../../package.json').preRelease,
  releasesUrl: 'https://api.github.com/repos/particl/particl-desktop/releases/latest',
  envName: 'prod',
  marketVersion: require('../../node_modules/particl-marketplace/package.json').version,
  particlHost: 'localhost',
  particlPort: 51735,
  marketHost: 'localhost',
  marketPort: 3000,
  botHost: 'localhost',
  botPort: 3001,
  isTesting: false
};
