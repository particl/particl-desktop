declare const require: any;

export const environment = {
  production: false,
  releasesUrl: 'https://api.github.com/repos/particl/particl-desktop/releases/latest',
  name: require('../../package.json').name,
  version: require('../../package.json').version,
  preRelease: require('../../package.json').preRelease,
  envName: 'docker1',
  particlHost: 'localhost',
  particlPort: 52935,
  marketVersion: 'UNKNOWN',
  marketHost: 'localhost',
  marketPort: 3100,
  botHost: 'localhost',
  botPort: 3001,
  isTesting: false
};
