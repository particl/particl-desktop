
# Linux
if [[ $TRUE_COMMIT_MESSAGES != *"-linux"* ]]
then 
    echo 'Linux build' && echo -en 'travis_fold:start:script.linux\\r'
    DEBUG=electron-builder yarn run package:linux
    echo -en 'travis_fold:end:script.linux\\r'
fi

# OSX
if [[ $TRUE_COMMIT_MESSAGES != *"-mac"* ]]
then 

    echo 'Mac build' && echo -en 'travis_fold:start:script.mac\\r'
    DEBUG=electron-builder yarn run package:mac
    echo -en 'travis_fold:end:script.mac\\r'
fi

# Winblows
if [[ $TRUE_COMMIT_MESSAGES != *"-win"* ]]
then
    echo 'Win build' && echo -en 'travis_fold:start:script.win\\r'
    sudo dpkg --add-architecture i386
    wget -nc https://dl.winehq.org/wine-builds/Release.key
    sudo apt-key add Release.key
    sudo apt-add-repository 'deb https://dl.winehq.org/wine-builds/ubuntu/ trusty main'
    sudo apt-get update
    sudo apt-get install -y --install-recommends winehq-devel
    DEBUG=electron-builder yarn run package:win
    echo -en 'travis_fold:end:script.win\\r'
fi

# Upload
if [[ $TRUE_COMMIT_MESSAGES != *"-upload"* ]]
then 
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
fi
