const _fetch = require('node-fetch');
const _fs = require('fs');
const _path = require('path');


const getPre22Checksums = async (coreVersion) => {
  const signaturesURL = "https://api.github.com/repos/particl/gitian.sigs/contents";
  const maintainer = "tecnovert";

  const sigVersions = await _fetch(
    signaturesURL,
    { method: 'GET', headers: {'Content-Type': 'application/json'}, redirect: 'follow', }
  ).then(response => response.json());

  if (!Array.isArray(sigVersions)) {
    throw new Error('invalid signature versions list obtained');
  }

  const platforms = new Map();
  sigVersions.forEach(sigVersion => {
    if (sigVersion.name.includes(coreVersion) && !sigVersion.name.includes('-signed')) {
      const platformIndex = sigVersion.name.indexOf("-");
      const platform = sigVersion.name.substring(platformIndex + 1).replace('-unsigned', '');
      platforms.set(platform, sigVersion.name);
    }
  });

  const hashes = {};

  for (const platform of platforms.keys()) {
    const sigPath = platforms.get(platform);

    const signatures = await _fetch(
      `${signaturesURL}/${sigPath}/${maintainer}`,
      { method: 'GET', headers: {'Content-Type': 'application/json'}, redirect: 'follow', }
    ).then(response => response.json());

    const sigFile = signatures.find((sigFile) => (sigFile.path.indexOf(sigPath) === 0) && !sigFile.name.includes("assert.sig"));
    if (!sigFile) {
      throw new Error(`Unable to retrieve hashes for ${coreVersion} for ${sigPath} for platform ${platform}`);
    }
    const textFile = await _fetch(
      sigFile.download_url,
      { method: 'GET', redirect: 'follow', }
    ).then(response => response.text());

    if (textFile) {
      const matchLines = textFile.match(new RegExp(`^.*-${coreVersion}-.*$`, 'gm'));

      if (Array.isArray(matchLines)) {
        matchLines.forEach(ml => {
          const parts = ml.trim().split(' ').filter(s => s.length > 0);
          hashes[parts[1].trim()] = parts[0].trim();
        });
      }
    }
  }

  return hashes;

};


const getPost22Checksums = async (coreVersion) => {
  const signaturesURL = "https://api.github.com/repos/particl/guix.sigs/contents";

  const availableSignatureFiles = await _fetch(
    signaturesURL,
    { method: 'GET', headers: {'Content-Type': 'application/json'}, redirect: 'follow', }
  ).then(response => response.json());

  if (!Array.isArray(availableSignatureFiles)) {
    throw new Error('invalid signature versions list obtained');
  }
  const found = availableSignatureFiles.find(af => af.name === coreVersion);
  if (!found) {
    throw new Error('Cannot find signatures for this core version');
  }

  const textFile = await _fetch(
    found.url,
    { method: 'GET', headers: {'Content-Type': 'application/json'}, redirect: 'follow', }
  )
  .then(response => response.json())
  .then(signers => Array.isArray(signers) ? signers[0].url : '')
  .then(sigFilesUrl => {
    if (sigFilesUrl) return _fetch(sigFilesUrl, { method: 'GET', redirect: 'follow', });
    throw new Error('Cannot find signatures files URL for this core version');
  })
  .then(resp => resp.json())
  .then(sigFiles => sigFiles.find(sigFile => sigFile.name === 'all.SHA256SUMS'))
  .then(sigFile => {
    if (sigFile && sigFile.download_url) return _fetch(sigFile.download_url, { method: 'GET', redirect: 'follow', });
    throw new Error('non-existent signature file url');
  })
  .then(resp => resp.text());

  const hashes = {};

  if (textFile) {
    const matchLines = textFile.match(new RegExp(`^.*-${coreVersion}[-|_].*$`, 'gm'));

    if (Array.isArray(matchLines)) {
      matchLines.forEach(ml => {
        const parts = ml.trim().split(' ').filter(s => s.length > 0);
        hashes[parts[1].trim()] = parts[0].trim();
      });
    }
  }

  return hashes;
};


// Currently the binaries information is sourced from Github...
// This function is here so as to provide a simple single place to do any modification to the target URL if setting up the the binaries
//  to be hosted elsewhere
const calculateBinaryTargetUrl = (sourceUrl) => {
  return sourceUrl;
}


const fetchData = async (usePreRelease, skipCount) => {

  // fetch list of releases
  const releasesURL = "https://api.github.com/repos/particl/particl-core/releases";

  const releases = await _fetch(
    releasesURL,
    { method: 'GET', headers: {'Content-Type': 'application/json'}, redirect: 'follow', }
  ).then(response => response.json());

  if (!Array.isArray(releases)) {
    throw new Error('Invalid responses');
  }

  // find the correct release
  let skippedCount = 0;
  let foundRelease;
  for (const release of releases) {
    if (release.prerelease && !usePreRelease) {
      continue;
    }
    if (skippedCount < skipCount) {
      skippedCount++;
      continue;
    }

    foundRelease = release;
    break;
  }
  if (!foundRelease) {
    throw new Error('No valid core releases found');
  }

  const tag = foundRelease.tag_name.substring(1).replace(/rc./g, "");
  console.log('found core release:', tag);

  // process the assets attached to the release
  const filteredAssets = [];

  for (const asset of foundRelease.assets) {

    const assetType = asset.content_type.replace('application/', '');

    if (!['gzip', 'zip', ].includes(assetType.toLowerCase())) continue;

    let arch;
    switch (true) {
      case asset.name.includes("arm"):
        arch = 'arm';
        break;
      case asset.name.includes("aarch64"):
        arch = 'arm64';
        break;
      case ['win64', 'osx64', 'x86_64', 'x64'].find(a => asset.name.includes(a)) !== undefined:
        arch = 'x64';
        break;
      case ['win32', 'i686'].find(a => asset.name.includes(a)) !== undefined:
        arch = 'ia32';
        break;
    }

    if (!arch) continue;

    const platform = ['linux', 'win', 'osx'].find(p => {
      if (p === 'osx') {
        return asset.name.includes('-osx') || asset.name.includes('-apple');
      }
      return asset.name.includes(`-${p}`);
    });
    if (!platform) continue;

    // store some details about the assets to be used shortly
    filteredAssets.push({
      arch,
      platform,
      url: asset.browser_download_url,
      name: asset.name,
    });
  }

  // get checksums for the current release version
  // NB! core >= v22 is using guix instead of gitian, so need to cater for obtaining the checksums differently
  let assetHashes = +tag.split('.')[0] >= 22 ? await getPost22Checksums(tag) : await getPre22Checksums(tag);

  // the data structure to be returned
  const appVersionResults = {
    version: tag,
    platforms: {},
  };

  // process each filtered asset, look up the appropriate checksum value, and add to data structure accordingly
  for (const asset of filteredAssets) {
    if (!(asset.platform in appVersionResults.platforms)) {
      appVersionResults.platforms[asset.platform] = {};
    }

    const hash = assetHashes[asset.name];

    if (hash) {
      appVersionResults.platforms[asset.platform][asset.arch] = {
        url: calculateBinaryTargetUrl(asset.url),
        sha256: hash,
      };
      console.log(`platform: ${asset.platform} name: ${asset.name} => ${hash}`);
    }
  }

  return appVersionResults;
};


const saveData = (data, appVersion) => {
  const filePath = _path.join('.', 'modules', 'particl-core', 'clientBinaries.json');
  const currentContent = JSON.parse(_fs.readFileSync(filePath, {encoding: 'utf8'}));
  currentContent[appVersion] = data;
  _fs.writeFileSync(filePath, JSON.stringify(currentContent, null, 2), {encoding: 'utf8'});
};

/**
 * !!!Execution of the main script starts from here!!!
 *
 * Args currently supported are:
 *  -v={semver}
 *      : specifies the version of Particl Desktop to generate release binaries for.
 *      : all of "3.2.1", "3.2" and "3" are supported (although currently not checked so any string is generally valid at present)
 *      : if not provided, the major version as specified in package.json is used, eg: "3"
 *
 *  -prerelease
 *      : if provided, indicates that pre-release versions of particl core will be used
 *
 *  -skip={num}
 *      : the number of releases to skip over
 *      : this is useful when attempting to update to a newer particl core version, but not necessarily the latest.
 */

let appVersion = process.argv.find(a => a.startsWith('-v='));
if (!appVersion) {
  const pkgVersion = require('../../package.json').version.split('.')[0];
  if (+pkgVersion > 0) {
    appVersion = pkgVersion;
  }
} else {
  appVersion = appVersion.split('=')[1];
}

const usePreRelease = process.argv.includes('-prerelease');
const skip = process.argv.find(a => a.startsWith('-skip='));
let skipCount = 0;
if (skip) {
  const c = +skip.split('=')[1];
  if (c > 0) {
    skipCount = c;
  }
}


if (!appVersion) {
  console.log('Cannot determine application/client version to process');
} else {
  console.log(`Using application/client version: ${appVersion}, using pre-releases: ${usePreRelease}, skipping core releases: ${skipCount}`);

  fetchData(usePreRelease, skipCount)
  .then(data => saveData(data, appVersion))
  .catch(error => console.error(error));
}
