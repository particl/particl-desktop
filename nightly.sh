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
