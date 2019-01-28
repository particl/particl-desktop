const fs          = require('fs');
const path        = require('path');
const log         = require('electron-log');
const iniParser   = require('@jedmao/ini-parser').default;
const cookie      = require('../rpc/cookie');
const _options    = require('../options');

const conFilePath = path.join( cookie.getParticlPath(_options.get()), 'particl.conf');
const SAFE_KEYS = ['addressindex'];


const formatSettingsOutput = function(rawConfig) {
  let formattedConfig = {};

    let sections = [];
    if (Object.prototype.toString.call(rawConfig) === '[object Object]' && Object.prototype.toString.call(rawConfig.items) === '[object Array]') {
      sections = rawConfig.items;
    }

    let sectionKey;

  try {
    for (let ii=0; ii < sections.length; ii++) {
      const section = sections[ii];

      if ( (('name' in section) && String(section.name).length) || !sectionKey) {
        sectionKey = section.name || 'global';

        sectionKey = String(sectionKey).trim();
        if (!(sectionKey in formattedConfig)) {
          formattedConfig[sectionKey] = {};
        }
      }

      const hasNodes = Object.prototype.toString.call(section.nodes) === '[object Array]' && section.nodes.length > 0;

      if (hasNodes) {
        for (let jj = 0; jj < section.nodes.length; jj++) {
          const node = section.nodes[jj];
          if (Object.prototype.toString.call(node) === '[object Object]' && ('key' in node) && ('value' in node)) {
            formattedConfig[sectionKey][String(node.key)] = node.value;
          }
        }
      }
    }
  } catch (err) {
    log.error(`Failed formatting daemonConfig: `, err.stack);
    formattedConfig = {};
  }

  return formattedConfig;
}

const readConfigFile = function () {
  log.debug('Attempting to read particld config from: ', conFilePath);
  if (fs.existsSync(conFilePath)) {
    try {
      const p = new iniParser();
      const result = p.parse(fs.readFileSync(conFilePath, 'utf-8'));
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      log.error(`particld config file parsing failed from ${conFilePath}`);
      log.error(`parsing error: ${err.message}`);
    }
  }
  return {};
}


const getSettings = function(rawOutput = false) {
  const parsedConfig = readConfigFile();

  if (rawOutput === true) {
    return parsedConfig;
  }
  return formatSettingsOutput(parsedConfig);
}


const saveSettings = function(networkOpt) {
  // TODO: Only accepts global config changes for now (no section config changes at the moment) - this should be changed.

  let items = [];
  if (Object.prototype.toString.call(networkOpt) !== '[object Object]' ) {
    return;
  }
  let keys = Object.keys(networkOpt).filter(
    (key) => networkOpt.hasOwnProperty(key) && SAFE_KEYS.includes(key) && ['string', 'number', 'boolean'].includes(typeof networkOpt[key])
  );

  // make certain that the latest config data has been obtained.
  const latest = getSettings(true);
  if (Object.prototype.toString.call(latest.items) === '[object Array]' ) {
    items = latest.items;
  }

  // TODO: clean this crappy code up - which means: reduce the double memory footprint of
  //  having 2 copies of the file in memory (one in JSON and the other as the output)
  //  This can be done better with streams.

  let output = '';
  let isModified = false;
  let isGlobalConfig = true;

  for (let ii = 0; ii < items.length; ii++) {
    const section = items[ii];
    const hasNodes = Object.prototype.toString.call(section.nodes) === '[object Array]';

    if ('name' in section) {
      // section delimiting (could be global config item or blank line as well)
      let name = section.name;
      if (section.name.length && hasNodes && section.nodes.length) {
        // Start of a new section

        if (isGlobalConfig) {
          isGlobalConfig = false;

          // New keys (settings) that need to be saved
          if (keys.length) {
            for (const key of keys) {
              output += `${key}=${typeof networkOpt[key] === 'boolean' ? +networkOpt[key] : networkOpt[key]}${section.newline}`;
            }
            output += `${section.newline}`;
            isModified = true;
            keys = [];
          }
        }

        name = `[${section.name}]`;
      }
      output += `${name}${section.newline}`;
    }

    if (section.indicator) {
      // section comments
      output += `${section.indicator}${section.text || ''}${section.newline}`;
    }

    if (hasNodes) {
      for (let jj = 0; jj < section.nodes.length; jj++) {
        const node = section.nodes[jj];

        if ( node.hasOwnProperty('key') ) {
          // key-value pairs
          let value = node.hasOwnProperty('value') ? node.value : '';
          value = typeof value === 'boolean' ? +value : value;

          // Update existing global keys (settings)
          if (isGlobalConfig && keys.length) {
            const keyIdx = keys.findIndex((elem) => elem === node.key);
            if (keyIdx > -1) {
              const newVal = typeof networkOpt[node.key] === 'boolean' ? +networkOpt[node.key] : networkOpt[node.key];
              if (value !== newVal) {
                value = newVal;
                isModified = true;
              }
              keys.splice(keyIdx, 1);
            }
          }
          output += `${node.key}${node.delimiter}${value}${section.newline}`;
        } else if (node.indicator) {
          // comments
          output += `${node.indicator}${node.text || ''}${section.newline}`;
        }
      }
    }
  }

  if (keys.length) {
    // Should only be here if conFilePath returned no data (config file exists?)

    for (const key of keys) {
      output += `${key}=${typeof networkOpt[key] === 'boolean' ? +networkOpt[key] : networkOpt[key]}\n`;
    }

    isModified = true;
  }

  if (isModified) {
    const tmpConfPath = conFilePath + '.tmp';
    fs.writeFile(tmpConfPath, output, (err) => {
      if (err) {
        log.error(`Failed writing changes to ${tmpConfPath}`, err.stack);
      } else {
        fs.rename(tmpConfPath, conFilePath, (error) => {
          if (error) {
            log.error(`Failed updating ${conFilePath}`, err.stack);
          } else {
            log.info('Successfully set particld configuration at', conFilePath);
          }
        });
      }
    });
  }
}

exports.getSettings = getSettings;
exports.saveSettings = saveSettings;
