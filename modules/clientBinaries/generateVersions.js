var got = require("got");
var fs = require('fs');

var releasesURL = "https://api.github.com/repos/particl/particl-core/releases";
var signaturesURL = "https://api.github.com/repos/particl/gitian.sigs/contents";
var maintainer = "tecnovert";

/*
 * Gets one asset's details (platform, arch, type. sha256...)
 */
var getAssetDetails = function (asset, hashes, version) {

  var platform, arch, type, sha256;

  // windows binaries
  if (asset.name.includes("win")) {
    platform = "win";
    arch = asset.name.includes("win64") ? "x64" : "ia32";
    type = asset.content_type === "application/zip" ? "zip" : undefined;
    var filter = new RegExp(`.*${asset.name}`);
    sha256 = hashes["win"].match(filter);
    if (sha256) {
      sha256 = sha256[0].trim().split(" ")[0];
    }
  } // osx binaries
  else if (asset.name.includes("osx")) {
    platform = "mac";
    arch = asset.name.includes("osx64") ? arch = "x64" : "ia32";
    switch (asset.content_type) {
      case "application/x-apple-diskimage":
        type = "dmg";
        break ;
      case "application/gzip":
        type = "tar";
        break ;
    }
    var filter = new RegExp(`.*${asset.name}`);
    sha256 = hashes["osx"].match(filter);
    if (sha256) {
      sha256 = sha256[0].trim().split(" ")[0];
    }
  } // linux binaries
  else if (asset.name.includes("linux")) {
    platform = "linux";
    if (asset.name.includes("x86_64")) {
      arch = "x64";
    } else if (asset.name.includes("i686")) {
      arch = "ia32";
    } else if (asset.name.includes("arm")) {
      arch = "arm";
    }
    type = asset.content_type === "application/gzip" ? "tar" : undefined;
    var filter = new RegExp(`.*${asset.name}`);
    sha256 = hashes["linux"].match(filter)[0].trim().split(" ")[0];
  }

  // add .exe extension for windows binaries
  var bin = `particld${platform === 'win' ? '.exe' : ''}`
  // return asset only if it is fully compliant
  return (platform && arch && type ? {
    platform: platform,
    arch: arch,
    name: asset.name,
    entry: {
      download: {
        url: asset.browser_download_url,
        type: type,
        sha256: sha256,
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
      for (id in files) {
        if (!files[id].name.includes("assert.sig")) {

          got(`${files[id].download_url}`).then(response => {
            hashes[platform] = response.body;
            resolve(response.body);
          }).catch(error => reject(error)); /* sig file */

        }
      }

    }).catch(error => reject(error)); /* folder containing sig files */

  });
}

/*
 * Entry point
 * get Particl latest release files
 */
got(`${releasesURL}`).then(response => {

  var release = JSON.parse(response.body)[0];
  var version = release.tag_name.substring(1);
  var binaries = [];

  // get gitian repository of hashes
  got(`${signaturesURL}`).then(response => {
    var versions = JSON.parse(response.body);
    var hashes = {};
    var promises = [];

    for (id in versions) {
      // select folders that match the current version
      if (versions[id].name.includes(version)) {
        // extract matching folder's platform
        var platformIndex = versions[id].name.indexOf("-");
        var platform = versions[id].name.substring(platformIndex + 1);
        // wait for hashes to be added to our hashes array
        promises.push(getHashesForPlatform(platform, versions[id].name, hashes));
      }
    }

    // once we have all hashes
    Promise.all(promises).then(() => {
      // get asset details for each release entry
      for (id in release.assets) {
        var asset = release.assets[id];
        var entry = getAssetDetails(asset, hashes, version);
        if (entry) {
          binaries.push(entry);
        }
      }
      // prepare JSON object for the output file
      var json = {
        clients: {
          particld: {
            version: version,
            platforms: {}
          }
        }
      }
      // include entries in JSON object
      var platforms = json.clients.particld.platforms;
      for (id in binaries) {
        var binary = binaries[id];
        // define an empty object for current platform if not already defined
        if (!platforms[binary.platform]) {
          platforms[binary.platform] = {};
        }
        platforms[binary.platform][binary.arch] = binary.entry;
      }
      // generate JSON file
      var stringJSON = JSON.stringify(json, null, 2);
      fs.writeFile("./modules/clientBinaries/clientBinaries.json", stringJSON, function(err) {
        if(err) {
          return (console.error(err));
        }
        console.log("JSON file generated.");
      });
    });
  }).catch(error => console.error(error)); /* signaturesURL */

}).catch(error => console.error(error)); /* releasesURL */
