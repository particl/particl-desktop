declare const require: any;

export const environment = {
  production: true,
  version: require('../../package.json').version,
  envName: 'prod'
};
