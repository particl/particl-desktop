const _path = require('path');
const _fs = require('fs');
const _packageJson = require('../package.json');

patchModules();
extractPackageConfig();


function extractPackageConfig() {
    const filename = 'buildConfiguration.json';
    console.log('Extracting build configuration to file', filename);

    const data = {
        appId: _packageJson.build.appId,
    };
    const filePath = _path.join('.', filename);
    try {
        _fs.writeFileSync(filePath, JSON.stringify(data, null, 2), {encoding: 'utf8'});
    } catch (err) {
        console.log('Error writing build configuration to file!', err);
    }
}


function patchModules() {
    const modNames = {
        'zeromq': patchzeromq,
    };

    for (const modName of Object.keys(modNames)) {
        if (modName.length === 0) {
            continue;
        }

        let modBaseDir = _path.normalize(_path.dirname(require.resolve(modName)));
        let isFound = false;

        try {

            while ((modBaseDir.length > 0) && !isFound) {
                const modParts = _path.parse(modBaseDir);
                switch (true) {
                case modParts.dir === modParts.root:
                case modParts.base === modParts.root:
                case modParts.base.toLowerCase() === 'node_modules':
                case modParts.name.toLowerCase() === 'node_modules':
                case modParts.ext.length > 0:
                    throw new Error(`${modName} node_module not found!`);
                    break;
                case modParts.name === modName:
                    isFound = true;
                    break;
                }

                if (!isFound) {
                    modBaseDir = modParts.dir;
                }
            }

            if (!isFound) {
                throw new Error(`${modName} node_module not found!`);
            }
        } catch (err) {
            console.log(`ABORTING PATCH OF ${modName}:`, err.message);
        }

        if (isFound) {
            console.log(`patching ${modName}...`);
            const success = modNames[modName](modBaseDir);

            if (!success) {
                throw new Error(`patching ${modName} failed!`)
            }
            console.log(`Successfully patched ${modName}`);
        }
    }
}
/**
 * Required to patch zeromq, specifically on Windows.
 * This is due to zeromq v6.0.0-beta.6 not being supported properly on some Windows versions:
 * tecnovert's comments:
    The problem is the .node file depends on msvs runtime dlls not present in all windows installs.
    The v5 binaries don't have those dependencies, so it must be possible to do without them.
    It's likely the required files support c++17 features.
    In gcc/mingw -static-libstdc++ would pull in the equivalent libs.
    RuntimeLibrary MultiThreaded (/MT) is the msvs equivalent of -static-libstdc++
    You can change all the RuntimeLibrary entries in binding.gyp to get the wrapper to build in /MT mode.
    However when it links to the libzmq static lib it errors out as libzmq was built in /MD mode.

 * The files copied are based on this patch: https://github.com/tecnovert/zeromq.js/commit/026b4cb9792bbc4a8348f7f027543ad8f387f19d

    Generating the .node file(s) can be done as follows (in Windows) for zeromq (using the build files used here or the commit patch mentioned above), per tecnovert:

    Install nodejs (v14) vs 2017 cmake and git
    Right click -> git bash here

    $ npm config set msvs_version 2017
    $ npm install
    $ prebuildify --napi --strip --electron-compat
 *
 * @param {string} moduleDir - the path to the (node_modules) module
 * @returns {boolean} Whether patching was completed successfully or not
 */
function patchzeromq(moduleDir) {
    let rVal = true;

    // if can't read then let it error and crash
    const modDef = _path.join(moduleDir, 'package.json')
    _fs.accessSync(modDef, _fs.constants.R_OK);

    const modDefContents = JSON.parse(_fs.readFileSync(modDef, 'utf8'));
    if (modDefContents.version !== '6.0.0-beta.6') {
        console.log('skipping patch...');
        return rVal;
    }

    const fileCopies = {
        'binding.gyp': [_path.join(__dirname, 'win', 'zeromq', 'binding.gyp'), _path.join(moduleDir, 'binding.gyp')],
        'build.sh': [_path.join(__dirname, 'win', 'zeromq', 'build.sh'), _path.join(moduleDir, 'script', 'build.sh')],
        'electron.napi.node (x64)': [_path.join(__dirname, 'win', 'zeromq', 'electron.napi.node'), _path.join(moduleDir, 'prebuilds', 'win32-x64', 'electron.napi.node')],
    };

    for (const fileCopy of Object.keys(fileCopies)) {
        const sourceFile = fileCopies[fileCopy][0];
        const targetFile = fileCopies[fileCopy][1];

        const sourceExists = _fs.existsSync(sourceFile);
        const targetExists = _fs.existsSync(targetFile);

        let canWrite = true;
        try {
            _fs.accessSync(targetFile, _fs.constants.W_OK);
        } catch (err) {
            canWrite = false;
        }

        if (!sourceExists || !targetExists || !canWrite) {
            rVal = false;
            console.log(`Something is wrong (${fileCopy}) => source exists? ${sourceExists} , target exists? ${targetExists} , can write? ${canWrite}`);
        } else {
            _fs.copyFileSync(sourceFile, targetFile);
        }
    }

    return rVal;
}