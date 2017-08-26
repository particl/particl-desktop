var got = require("got");

var releasesURL = "https://api.github.com/repos/particl/particl-core/releases";
var signaturesURL = "https://api.github.com/repos/particl/gitian.sigs/contents";
var maintainer = "tecnovert";

var getAssetDetails = function (asset) {

  var platform, arch, type;

  // TODO: add sha and bin

  if (asset.name.includes("win")) {
    platform = "win";
    arch = asset.name.includes("win64") ? "x64" : "ia32";
    type = asset.content_type === "application/zip" ? "zip" : undefined;
  }
  else if (asset.name.includes("osx")) {
    platform = "mac";
    arch = asset.name.includes("osx64") ? arch = "x64" : "ia32";
    type = asset.content_type === "application/x-apple-diskimage" ? "dmg" : undefined;
  }
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
  }

  return (platform && arch && type ? {
    platform: platform,
    arch: arch,
    type: type,
    url: asset.browser_download_url
  } : undefined);
}

var getAssetHash(platform, name) {

}

got(releasesURL).then(response => {

  var release = JSON.parse(response.body)[0];
  // console.log(release);

  var version = release.tag_name.substring(1);
  var binaries = [];

  got(signaturesURL).then(response => {

    var versions = JSON.parse(response.body);
    var platforms = [];

    for (id in versions) {

      if (versions[id].name.includes(version)) {

        var platformIndex = versions[id].name.indexOf("-");
        var platform = versions[id].name.substring(platformIndex + 1);

        got(`${signaturesURL}/${versions[id].path}/${maintainer}`).then(response => {

          var files = JSON.parse(response.body);
          for (id in files) {

            if (!files[id].name.includes("assert.sig")) {

              got(files[id].download_url).then(response => {
                var filter = /.*particl.*(?!debug).*/g
                console.log(response.body.match(filter));
              }).catch(error => console.log(error));

            }
          }

        }).catch(error => console.log(error));
      }
    }
    console.log(platforms);
  }).catch(error => console.log(error));

  for (id in release.assets) {

    var asset = release.assets[id];
    var entry = getAssetDetails(asset);

    if (entry) {
      binaries.push(entry);
    }
  }

  console.log(version, binaries)

  // TODO: construct JSON

}).catch(error => {
  console.log(error);
});
