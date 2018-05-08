post=$(echo ${Uploads[@]})
curl -H "Authorization: token ${GITHUB_TOKEN}" -X POST \
-d "{\"body\": \"A build has started for this pull request! \"}" \
"https://api.github.com/repos/${TRAVIS_REPO_SLUG}/issues/${TRAVIS_PULL_REQUEST}/comments"

yarn run build:electron:prod

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
#    sudo dpkg --add-architecture i386
#    wget -nc https://dl.winehq.org/wine-builds/Release.key
#    sudo apt-key add Release.key
#    sudo apt-add-repository https://dl.winehq.org/wine-builds/ubuntu/
#    sudo apt-get update -y
#    sudo apt-get install -y --force-yes wine-stable winehq-stable
#    WINEARCH=win32 winecfg

#    wine regedit /d 'HKEY_LOCAL_MACHINE\\Software\\Microsoft\Windows\CurrentVersion\Explorer\Desktop\Namespace\{9D20AAE8-0625-44B0-9CA7-71889C2254D9}'
#    echo disable > "${WINEPREFIX:-${HOME}/.wine}/.update-timestamp"

    DEBUG=electron-builder yarn run package:win64

    cd packages
    zip -r particl-desktop-win-x64-PR$TRAVIS_PULL_REQUEST.zip win-unpacked
    cd ..

    DEBUG=electron-builder yarn run package:win32

    cd packages
    zip -r particl-desktop-win-ia32.zip win-ia32-unpacked
    cd ..

    ls -l ./packages
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
        url="$(curl  -H "Max-Days: 2" -s --upload-file $fn https://transfer.sh/$fn)\n\n"
        checksum="$(sha256sum $fn)\n"
        Uploads=(${Uploads[@]} "\`\`\`")
        Uploads=(${Uploads[@]} $checksum)
        Uploads=(${Uploads[@]} $url)
        Uploads=(${Uploads[@]} "\`\`\`\n")
    done
    echo -e ${Uploads[@]}

    echo "Posting comment"
    post=$(echo ${Uploads[@]})
    curl -H "Authorization: token ${GITHUB_TOKEN}" -X POST \
    -d "{\"body\": \"${post}\"}" \
    "https://api.github.com/repos/${TRAVIS_REPO_SLUG}/issues/${TRAVIS_PULL_REQUEST}/comments"
fi
