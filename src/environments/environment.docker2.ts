import * as app from '../../package.json';

export const environment = {
  production: false,
  releasesUrl: 'https://api.github.com/repos/particl/particl-desktop/releases/latest',
  name: app.name,
  version: app.version,
  preRelease: app.preRelease,
  envName: 'docker2',
  particlHost: 'localhost',
  particlPort: 53935,
  marketVersion: 'UNKNOWN',
  marketHost: 'localhost',
  marketPort: 3200,
  botHost: 'localhost',
  botPort: 3001,
  isTesting: false
};
