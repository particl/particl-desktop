curl -H "Authorization: token ${GITHUB_TOKEN}" -X POST \
-d "{\"body\": \"A build has started for this pull request! \"}" \
"https://api.github.com/repos/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PR_REPONAME}/issues/${CIRCLE_PR_NUMBER}/comments"

yarn run build:electron:prod

# Linux
if [[ $TRUE_COMMIT_MESSAGES != *"-linux"* ]]
then
    echo 'Linux build'
    DEBUG=electron-builder yarn run travis:linux

    cd packages
    mv `ls | grep "particl-desktop.*linux-x64.zip"` particl-desktop-linux-x64-PR$CIRCLE_PR_NUMBER-$TRUE_COMMIT.zip
    mv `ls | grep "particl-desktop.*linux-amd64.deb"` particl-desktop-linux-amd64-PR$CIRCLE_PR_NUMBER-$TRUE_COMMIT.deb
    mv `ls | grep "particl-desktop.*linux-x86_64.rpm"` particl-desktop-linux-x68_64-PR$CIRCLE_PR_NUMBER-$TRUE_COMMIT.rpm
    cd ..
fi

# OSX
if [[ $TRUE_COMMIT_MESSAGES != *"-mac"* ]]
then

    echo 'Mac build'
    DEBUG=electron-builder yarn run travis:mac

    cd packages
    mv `ls | grep "particl-desktop.*mac.zip"` particl-desktop-mac-PR$CIRCLE_PR_NUMBER-$TRUE_COMMIT.zip
    cd ..
fi

# Winblows
if [[ $TRUE_COMMIT_MESSAGES != *"-win"* ]]
then
    echo 'Win build'
    DEBUG=electron-builder yarn run travis:win64

    cd packages
    zip -r particl-desktop-win-x64-PR$CIRCLE_PR_NUMBER-$TRUE_COMMIT.zip win-unpacked
    cd ..

    DEBUG=electron-builder yarn run travis:win32

    cd packages
    zip -r particl-desktop-win-ia32-PR$CIRCLE_PR_NUMBER-$TRUE_COMMIT.zip win-ia32-unpacked
    cd ..

    ls -l ./packages
fi


# Upload
if [[ $TRUE_COMMIT_MESSAGES != *"-upload"* ]]
then
    cd packages
    declare -a Uploads
    Uploads=("${TRUE_COMMIT_MESSAGES}\nNote: the download links expire after 10 days.\n")
    Matrix=("<p><strong>Help developer ${CIRCLE_PR_USERNAME} by testing these builds and reporting any issues!</strong><br />${TRUE_COMMIT_MESSAGES}</p>\n<p>Note: the download links expire after 10 days.</p>\n")
    for fn in `ls | grep "particl-desktop"`; do
        echo "Uploading $fn"
        url="$(curl  -H "Max-Days: 10" -s --upload-file $fn https://transfer.sh/$fn)\n"
        onion="$(echo $url | sed 's,https://transfer.sh,http://jxm5d6emw5rknovg.onion,g')"
        checksum="$(sha256sum $fn)\n"
        Uploads=(${Uploads[@]} "\`\`\`\n")
        Uploads=(${Uploads[@]} $checksum)
        Uploads=(${Uploads[@]} $url)
        Uploads=(${Uploads[@]} $onion)
        Uploads=(${Uploads[@]} "\`\`\`\n\n")

        # Build message for Matrix
        Matrix=(${Matrix[@]} "<pre><code>")
        Matrix=(${Matrix[@]} $checksum)
        Matrix=(${Matrix[@]} $url)
        Matrix=(${Matrix[@]} $onion)
        Matrix=(${Matrix[@]} "</code></pre>\n\n")
    done
    echo -e ${Uploads[@]}

    export MSG=$(echo ${Uploads[@]})
    curl -H "Authorization: token ${GITHUB_TOKEN}" -X POST \
    -d "{\"body\": \"${MSG}\"}" \
    "https://api.github.com/repos/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PR_REPONAME}/issues/${CIRCLE_PR_NUMBER}/comments"

    # Request testing from the test channel.
    if [[ $TRUE_COMMIT_MESSAGES == *"+request"* ]]
    then
        export MATRIX_MSG=$(echo ${Matrix[@]})
        export TIMESTAMP=$(date +%s)
        export TEST_ROOM="wvPJvGRnvoVersNXPK"
        export DEV_ROOM="QHzKmRcPojxJmQRhMD"
        curl 'https://matrix.org/_matrix/client/r0/rooms/!'"${TEST_ROOM}"'%3Amatrix.org/send/m.room.message/m'"${TIMESTAMP}"'?access_token='"${MATRIX_TOKEN}" \
        -X PUT --data '{"msgtype":"m.text", "format": "org.matrix.custom.html", "body": "'"${MSG}"'" ,"formatted_body":"'"${MATRIX_MSG}"'Married to Rutherford, hubby for life &lt;3"}'
    fi
fi
