const rxIpc = require('rx-ipc-electron/lib/main').default;
const rxjs = require('rxjs');
const rxjsOps = require('rxjs/operators');

const _csv = require('csv-parser');
const _fs = require('fs');
const _iconv = require('iconv-lite');


const destroy$ = new rxjs.Subject();


class BaseParser {
  parseArgs;

  constructor(parseArgs) {
    this.parseArgs = this.validateArgs(parseArgs);
  }

  /**
   *
   * @param {any} parseArgs Any user defined optional parsing configuration
   * @returns An object representing the parsing configuration that will be set for this instance of the parser
   */
  validateArgs(parseArgs) {
    return new Error('NOT_IMPLEMENTED');
  }

  /**
   *
   * @param {string} source The filepath/url/etc indicating the source to be parsed
   * @returns {Observable} Observable that should be subscribed to in order to obtained parsed results.
   */
  parse(source) {
    return new Error('NOT_IMPLEMENTED');
  }
}


class CSVParser extends BaseParser {

  constructor(parseArgs) {
    super(parseArgs);
  }


  validateArgs(parseArgs) {

    const _config = {
      quote: '"',
      separator: ',',
      skipLines: 0,
      sourceEncoding: 'utf8'  // this is explicitly for stream decoding, and is not an explicit parser config option (ie: strip this out)
    };

    if ((Object.prototype.toString.call(parseArgs) === '[object Object]')) {
      if (Array.isArray(parseArgs.headers)) {
        const selectedHeaders = [];
        parseArgs.headers.forEach(h => {
          if (typeof h === 'string') {
            selectedHeaders.push(h);
          }
        });
        if (selectedHeaders.length > 0) {
          _config.mapHeaders = ({header, headerIdx}) => selectedHeaders.includes(header) ? header : null;
        }
      }
    }

    if ((typeof parseArgs.quote === 'string') && (parseArgs.quote.length > 0)) {
      _config.quote = parseArgs.quote;
    }

    if ((typeof parseArgs.separator === 'string') && (parseArgs.separator.length > 0)) {
      _config.separator = parseArgs.separator;
    }

    if ((typeof parseArgs.skipLines === 'number') && Number.isSafeInteger(parseArgs.skipLines) && (parseArgs.skipLines > 0)) {
      _config.skipLines += parseArgs.skipLines;
    }

    if ((typeof parseArgs.sourceEncoding === 'string') && (parseArgs.sourceEncoding.length > 0) && _iconv.encodingExists(parseArgs.sourceEncoding.toLowerCase())) {
      _config.sourceEncoding = parseArgs.sourceEncoding.toLowerCase();
    }

    return _config;
  }


  parse(source) {
    return rxjs.defer(() => {
      const rStream = _fs.createReadStream(source);

      return new rxjs.Observable(subs => {
        const sourceEncoding = this.parseArgs.sourceEncoding || 'utf8';
        const parserConfig = this.omitKey(this.parseArgs, 'sourceEncoding');
        const results = [];

        rStream.on('error', (err) => {
          subs.error(err);
        })
        .pipe(_iconv.decodeStream(sourceEncoding))
        .on('error', (err) => {
          subs.error(err);
        })
        .pipe(_csv(parserConfig))
        .on('data', (data) => results.push(data))
        .on('end', () => {
          subs.next(results);
          subs.complete();
        })
        .on('error', (err) => {
          subs.error(err);
        });
      }).pipe(
        rxjsOps.finalize(() => {
          if (!rStream.destroyed) {
            rStream.destroy();
          }
        }),
        rxjsOps.takeUntil(destroy$)
      );
    });
  };


  omitKey(obj, key) {
    const { [key]: removedKey, ...newObj } = obj;
    return newObj;
  }
}


const SUPPORTED_PARSERS = {
  csv: CSVParser
};


exports.init = function() {
  rxIpc.registerListener('market-importer', (parseType /* SUPPORTED_PARSERS keys */, source /* string: file/url/path to process */, parseArgs /* object: args for the parser */) => {
    return rxjs.defer(() => {
      if ((typeof parseType !== 'string') || !Object.keys(SUPPORTED_PARSERS).includes(parseType)) {
        return rxjs.throwError(new Error('INVALID_PARSER'));
      }

      if ((typeof source !== 'string') || (!source.length > 0)) {
        return rxjs.throwError(new Error('INVALID_SOURCE'));
      }

      if ((Object.prototype.toString.call(parseArgs) !== '[object Object]')) {
        return rxjs.throwError(new Error('INVALID_PARSER_ARGS'));
      }

      return (new SUPPORTED_PARSERS[parseType](parseArgs)).parse(source);
    })
  });
}


exports.destroy = function() {
  rxIpc.removeListeners('market-importer');
  destroy$.next();
  destroy$.complete();
}
