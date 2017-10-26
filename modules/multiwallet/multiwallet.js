const path = require('path');

exports.get = function () {
  // check for wallet_*.dat in app.userData
  return new Promise((resolve, reject) => resolve([ 'wallet.dat' ]));
}
