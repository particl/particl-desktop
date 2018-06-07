declare const require: any;

export const environment = {
  production: false,
  releasesUrl: 'https://api.github.com/repos/particl/particl-desktop/releases/latest',
  version: require('../../package.json').version,
  envName: 'docker1',
  particlHost: 'localhost',
  particlPort: 52935
};
