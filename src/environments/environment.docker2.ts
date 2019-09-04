declare const require: any;

export const environment = {
  production: false,
  releasesUrl: 'https://api.github.com/repos/particl/particl-desktop/releases/latest',
  version: require('../../package.json').version,
  preRelease: require('../../package.json').preRelease,
  envName: 'docker2',
  particlHost: 'localhost',
  particlPort: 53935,
  marketVersion: 'UNKNOWN',
  marketHost: 'localhost',
  marketPort: 3200,
  isTesting: false
};
