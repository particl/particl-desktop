// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  envName: 'dev',

  server: {
    hostname: 'localhost',
    port: 51935, // no separate mainnet/testnet ports, assuming that we're always using testnet on dev
    username: 'test',
    password: 'test'
  }
};
