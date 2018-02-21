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

function isVerboseLevel(arg) {
  let level = 0;
  let notVerbose = false;
  [...arg].map(char => char === 'v' ? level++ : notVerbose = true);
  return notVerbose ? false : level;
}

exports.parse = function() {

  let options = {};
  if (process.argv[0].match(/[Ee]lectron/)) {
    process.argv = process.argv.splice(2); /* striping 'electron .' from argv */
  } else {
    process.argv = process.argv.splice(1); /* striping /path/to/particl from argv */
  }

  process.argv.map((arg, index) => {

    let argIndex = arg.lastIndexOf('-') + 1;
    arg = arg.substr(argIndex);

    if (argIndex === 2) { /* double-dash: desktop-only argument */
      process.argv.splice(process.argv.indexOf(arg), 1);
      let verboseLevel = isVerboseLevel(arg);
      if (verboseLevel) {
        options['verbose'] = verboseLevel;
        return ;
      }
    } else if (argIndex === 1) { /* single-dash: core argument */
      if (arg.includes('=')) {
        arg = arg.split('=');
        options[arg[0]] = arg[1];
        return ;
      }
    }
    options[arg] = true;
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
