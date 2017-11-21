declare const require: any;

export const environment = {
  production: true,
  envName: 'prod',
  version: require('../../package.json').version
};
