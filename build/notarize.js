const nodePath = require('path');
const { notarize } = require('@electron/notarize');
const packageConfig = require('../package.json');

require('dotenv').config({ path: nodePath.join(__dirname, 'mac', '.env') });

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: packageConfig.build.appId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASSWORD,
    ascProvider: process.env.APPLEASCPROVIDER
  });
};
