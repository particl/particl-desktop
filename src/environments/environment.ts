// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
declare const require: any;

export const environment = {
  production: false,
  envName: 'dev',
  releasesUrl: 'https://api.github.com/repos/particl/particl-desktop/releases/latest',
  name: require('../../package.json').name,
  version: require('../../package.json').version,
  preRelease: require('../../package.json').preRelease,
  marketVersion: require('../../node_modules/particl-marketplace/package.json').version,
  particlHost: 'localhost',
  particlPort: 51935,
  marketHost: 'localhost',
  marketPort: 3000,
  botHost: 'localhost',
  botPort: 3001,
  isTesting: false
};
