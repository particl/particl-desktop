const path = require('path');

/*
** returns our real user path
*/
function getCustomUserPath(options) {
    // small hack, userData points to  ~/.config/brave/
    // instead of ~/.config/Particl\ Desktop
    return path.join(path.dirname(app.getPath('userData')), 'Particl Desktop');
}

exports.getCustomUserPath = getCustomUserPath;
