var got = require("got");
var fs = require('fs');

var releasesURL = "https://api.github.com/repos/particl/particl-core/releases";
var signaturesURL = "https://api.github.com/repos/particl/gitian.sigs/contents";
var maintainer = "tecnovert";

/*
 * Filters a hash file to find this asset's hash
 */
var getHash = function (platform, name, hashes) {
  var filter = new RegExp(`.*${name}`);
  var sha256 = hashes[platform].match(filter);
  if (sha256) {
    sha256 = sha256[0].trim().split(" ")[0];
  } else {
    sha256 = undefined;
  }
  return (sha256);
}

/*
 * get assets for specific platforms
 */
var getWinAsset = function(data, asset, hashes) {
  data.platform = "win";
  data.arch = asset.name.includes("win64") ? "x64" : "ia32";
  data.type = asset.content_type === "application/zip" ? "zip" : undefined;
  data.sha256 = getHash(data.platform, asset.name, hashes);
}

var getOSXAsset = function (data, asset, hashes) {
  data.platform = "mac";
  data.arch = asset.name.includes("osx64") ? "x64" : "ia32";
  if (asset.content_type === "application/x-apple-diskimage") {
    data.type = "dmg";
  } else if (asset.content_type === "application/gzip") {
    data.type = "tar";
  }
  data.sha256 = getHash("osx", asset.name, hashes);
}

var getLinuxAsset = function (data, asset, hashes) {
  data.platform = "linux";
  if (asset.name.includes("x86_64")) {
    data.arch = "x64";
  } else if (asset.name.includes("i686")) {
    data.arch = "ia32";
  } else if (asset.name.includes("arm")) {
    data.arch = "arm";
  }
  data.type = asset.content_type === "application/gzip" ? "tar" : undefined;
  data.sha256 = getHash(data.platform, asset.name, hashes);
}

/*
 * Gets one asset's details (platform, arch, type. sha256...)
 */
var getAssetDetails = function (asset, hashes, version) {

  var data = {
    platform: undefined,
    arch: undefined,
    type: undefined,
    sha256: undefined
  };

  // windows binaries
  if (asset.name.includes("win")) {
    getWinAsset(data, asset, hashes);
  } // osx binaries
  else if (asset.name.includes("osx")) {
    getOSXAsset(data, asset, hashes);
  } // linux binaries
  else if (asset.name.includes("linux")) {
    getLinuxAsset(data, asset, hashes);
  }

  // add .exe extension for windows binaries
  var bin = `particld${data.platform === 'win' ? '.exe' : ''}`
  // return asset only if it is fully compliant
  return (data.platform && data.arch && data.type ? {
    platform: data.platform,
    arch: data.arch,
    name: asset.name,
    entry: {
      download: {
        url: asset.browser_download_url,
        type: data.type,
        sha256: data.sha256,
        bin: `particl-${version}/bin/${bin}`
      },
      bin: bin,
      commands: {
        sanity: {
          args: ["-version"],
          output: ["Particl Core Daemon", version]
        }
      }
    }
  } : undefined);
}

/*
 * Gets all hashes of current version for a specific platform
 */
var getHashesForPlatform = function (platform, path, hashes, promises) {
  // this promise is resolved when both HTTP calls returned
  return new Promise((resolve, reject) => {

    got(`${signaturesURL}/${path}/${maintainer}`).then(response => {

      var files = JSON.parse(response.body);

      files.forEach(file => {

        if (!file.name.includes("assert.sig")) {
          got(`${file.download_url}`).then(response => {
            hashes[platform] = response.body;
            resolve(response.body);
          }).catch(error => reject(error)); /* sig file */
        }

      })

    }).catch(error => reject(error)); /* folder containing sig files */

  });
}

/*
 * Entry point
 * get Particl latest release files
 */
got(`${releasesURL}`).then(response => {

  var release = JSON.parse(response.body)[0];
  var tag = release.tag_name.substring(1);
  var binaries = [];

  // get gitian repository of hashes
  got(`${signaturesURL}`).then(response => {

    var versions = JSON.parse(response.body);
    var hashes = {};
    var promises = [];

    versions.forEach(version => {
      // select folders that match the current version
      if (version.name.includes(tag)) {
        // extract matching folder's platform
        var platformIndex = version.name.indexOf("-");
        var platform = version.name.substring(platformIndex + 1);
        // wait for hashes to be added to our hashes array
        promises.push(getHashesForPlatform(platform, version.name, hashes));
      }
    })

    // once we have all hashes
    Promise.all(promises).then(function () {
      // prepare JSON object for the output file
      var json = {
        clients: {
          particld: {
            version: tag,
            platforms: {}
          }
        }
      }
      // get asset details for each release entry
      var entry;
      release.assets.forEach(asset => {
        if ((entry = getAssetDetails(asset, hashes, tag))) {
          binaries.push(entry);
        }
      })
      // include entries in JSON object
      var platforms = json.clients.particld.platforms;
      binaries.forEach(binary => {
        // define an empty object for current platform if not already defined
        if (!platforms[binary.platform]) {
          platforms[binary.platform] = {};
        }
        platforms[binary.platform][binary.arch] = binary.entry;
      })
      // generate JSON file
      var stringJSON = JSON.stringify(json, null, 2);
      var path = "./modules/clientBinaries/clientBinaries.json";
      fs.writeFile(path, stringJSON, function(error) {
        if (error) {
          return (console.error(err));
        }
        console.log("JSON file generated: " + path);
      });
    });
  }).catch(error => console.error(error)); /* signaturesURL */

}).catch(error => console.error(error)); /* releasesURL */
