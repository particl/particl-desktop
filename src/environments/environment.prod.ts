declare const require: any;

export const environment = {
  production: true,
  version: require('../../package.json').version,
  releasesUrl: 'https://api.github.com/repos/particl/particl-desktop/releases/latest',
  envName: 'prod',
  particlHost: 'localhost',
  particlPort: 51935,
  marketVersion: require('../../node_modules/particl-marketplace/package.json').version,
  marketHost: 'localhost',
  marketPort: 3000,
  isTesting: false
};
