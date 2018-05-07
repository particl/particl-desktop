
# Linux
echo 'Linux build' && echo -en 'travis_fold:start:script.linux\\r'
DEBUG=electron-builder yarn run package:linux
echo -en 'travis_fold:end:script.linux\\r'

# OSX
echo 'Mac build' && echo -en 'travis_fold:start:script.mac\\r'
DEBUG=electron-builder yarn run package:mac
echo -en 'travis_fold:end:script.mac\\r'

# Winblows
echo 'Win build' && echo -en 'travis_fold:start:script.win\\r'
sudo dpkg --add-architecture i386
wget -nc https://dl.winehq.org/wine-builds/Release.key
sudo apt-key add Release.key
sudo apt-add-repository https://dl.winehq.org/wine-builds/ubuntu/
sudo apt-get update
sudo apt-get install -y --install-recommends winehq-devel
winecfg
DEBUG=electron-builder yarn run package:win
echo -en 'travis_fold:end:script.win\\r'

# Upload
cd packages
declare -a Uploads
Uploads=("Builds\n")
for fn in `ls | grep "particl-desktop"`; do
    echo "Uploading $fn"
    url="$(curl -s --upload-file $fn https://transfer.sh/$fn)\n\n"
    checksum="$(sha256sum $fn)\n"
    Uploads=(${Uploads[@]} $checksum)
    Uploads=(${Uploads[@]} $url)
done

echo -e ${Uploads[@]}
