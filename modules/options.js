const path = require('path');

let _options = {};

/*
** compose options from arguments
**
** exemple:
** --dev -testnet -reindex -rpcuser=user -rpcpassword=pass
** strips --dev out of argv (double dash is not a particld argument) and returns
** {
**   dev: true,
**   testnet: true,
**   reindex: true,
**   rpcuser: user,
**   rpcpassword: pass
** }
*/
exports.parse = function() {

  let options = {};

  if (path.basename(process.argv[0]).includes('electron')) {
    // striping 'electron .' from argv
    process.argv = process.argv.splice(2);
  } else {
    // striping /path/to/particl from argv
    process.argv = process.argv.splice(1);
    // @TODO make sure it will only work for dev
    // if (process.platform === 'darwin') {
    //   process.argv = process.argv.splice(1);
    // }
  }

  process.argv.forEach((arg, index) => {
    if (arg.includes('=')) {
      arg = arg.split('=');
      options[arg[0].substr(1)] = arg[1];
    } else if (arg[1] === '-'){
      // double dash command
      options[arg.substr(2)] = true;
    } else if (arg[0] === '-') {
      // simple dash command
      options[arg.substr(1)] = true;
    }
  });

  options.port = options.rpcport
    ? options.rpcport // custom rpc port
    : options.testnet
      ? 51935  // default testnet port
      : 51735; // default mainnet port

  _options = options;
  return options;
}

exports.get = function() {
  return _options;
}
