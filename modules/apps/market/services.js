const _fs = require('fs');
const _path = require('path');
const _csv = require('csv-parser');
const _url = require('url');
const _got = require('got');
const _sharp = require('sharp');
const _iconv = require('iconv-lite');
const _autoDetectDecoderStream = require('autodetect-decoder-stream');
const _getStream = require('get-stream');
const _app = require('electron').app;
const { Observable, Subject, defer, from, throwError } = require('rxjs');
const { skipWhile, catchError, takeUntil, finalize } = require('rxjs/operators');
const { rxToStream } = require('rxjs-stream');
const { Transform } = require('json2csv');
const bitcore = require('particl-bitcore-lib');


class CSVWriter {

  _targetPath;

  constructor(targetPath) {
    if ((typeof targetPath === 'string') && (targetPath.length > 3) ) {
      this._targetPath = targetPath;
    }
  }

  _validatePath() {
    return !!this._targetPath;
  }


  write(data /* JSON objects to be written */) {
    return defer(() => {
      let writeStream;

      return new Observable(obs$ => {
        if (!Array.isArray(data)) {
          obs$.error('INVALID_DATA');
          return;
        }

        writeStream = _fs.createWriteStream(this._targetPath, { encoding: 'utf8' });
        const sourceStream = from(data).pipe(
          skipWhile(d => !d || Object.prototype.toString.call(d) !== '[object Object]'),
          catchError(e => this.destroy$.next()),
          takeUntil(destroy$)
        );
        const json2csv = new Transform({}, {highWaterMark: 16384, encoding: 'utf8', objectMode: true});
        json2csv
          .on('header', header => console.log('EXPORT (OUTPUT HEADER): ', header))
          .on('line', line => console.log('EXPORT (OUTPUT LINE):', line))
          .on('error', err => console.log('EXPORT (ERROR!!):', err));

        writeStream
          .on('error', (err) => {
            obs$.error(err);
          })
          .on('finish', () => {
            obs$.next();
            obs$.complete();
          });

        rxToStream(sourceStream, { objectMode: true }).pipe(json2csv).pipe(writeStream);
      }).pipe(
        finalize(() => {
          if (writeStream && !writeStream.destroyed) {
            writeStream.end();
          }
        }),
        takeUntil(destroy$)
      );
    });
  }

}


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
      sourceEncoding: 'utf8',  // this is explicitly for stream decoding, and is not an explicit parser config option (ie: strip this out)
      externalSourceFields: [],   // should be stripped out of the actual config
    };

    if ((Object.prototype.toString.call(parseArgs) === '[object Object]')) {
      const selectedHeaders = [];
      const externalSourceFields = [];

      if (Array.isArray(parseArgs.headers)) {
        parseArgs.headers.forEach(h => {
          if (typeof h === 'string') {
            selectedHeaders.push(h);
          }
        });

        if (selectedHeaders.length > 0) {
          _config.mapHeaders = ({ header, _ }) => selectedHeaders.includes(header) ? header : null;
        }
      }

      if (Array.isArray(parseArgs.getFromUrlFields)) {
        parseArgs.getFromUrlFields.forEach(f => {
          if (f && (typeof f === 'object') && selectedHeaders.includes(f.fieldName) && f.fieldType === 'IMAGE') {
            const filt = { fieldName: f.fieldName, fieldType: f.fieldType, data: {} };
            externalSourceFields.push(filt);
          }
        });
      }

      _config.externalSourceFields = externalSourceFields;

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
    }

    return _config;
  }


  parse(source) {
    const fallbackDefaultEncoding = this.parseArgs.sourceEncoding || 'utf8';
    const externalSourceFields = this.parseArgs.externalSourceFields || [];
    let parserConfig = this.omitKey(this.parseArgs, 'sourceEncoding');
    parserConfig = this.omitKey(this.parseArgs, 'externalSourceFields');
    let rStream;

    return new Observable(subs => {
      (async () => {
        const results = [];
        rStream = _fs.createReadStream(source);
        rStream
          .pipe(new _autoDetectDecoderStream({ defaultEncoding: fallbackDefaultEncoding, stripBOM: true }))
          .pipe(_csv(parserConfig))
          .on('data', (obj) => {
            if (Object.keys(obj).length > 0) {
              results.push(obj);
            }
          });

        await _getStream(rStream).catch(e => { /** Should any failure here be logged?? */ });

        for (const res of results) {
          for (const esf of externalSourceFields) {
            if (typeof res[esf.fieldName] !== 'string') {
              res[esf.fieldName] = [];
              continue;
            }

            const filePaths = res[esf.fieldName]
              .split(',')
              .map(s => s.trim());

            const data = [];

            for (const filePath of filePaths) {
              let fileBuffer;
              try {
                switch (true) {

                  case filePath.startsWith('http://'):
                  case filePath.startsWith('https://'):
                    const resp = await _got(filePath, {
                      encoding: null,
                      timeout: {
                        request: 30_000,  // global timeout for this request
                      }

                    });
                    fileBuffer = resp.body;
                    break;

                  case filePath.startsWith('file://'):
                    const rp1 = _url.fileURLToPath(filePath);
                    if (_fs.existsSync(rp1)) {
                      fileBuffer = _fs.readFileSync(rp1);
                    }
                    break;

                  default:
                    // local file path
                    const rp2 = _path.resolve(filePath);
                    if (_fs.existsSync(rp2)) {
                      fileBuffer = _fs.readFileSync(rp2);
                    }
                }
              } catch (err) {
                // log out the error?
              }

              if (!fileBuffer) {
                continue;
              }

              try {
                switch (esf.fieldType) {
                  case 'IMAGE':
                    const uint = new Uint8Array(fileBuffer, 0, 4);
                    const bytes = [];
                    uint.forEach(byte => {
                      bytes.push(byte.toString(16));
                    });
                    const hex = bytes.join('').toUpperCase();
                    if (!hex.startsWith('FFD8') || hex.startsWith('89504E47')) {
                      continue;
                    }

                    fileBuffer = await _sharp(fileBuffer)
                      .resize({
                        width: 800,
                        height: 800,
                        fit: _sharp.fit.inside,
                      }).toBuffer();

                    data.push(`data:image/jpeg;base64,${fileBuffer.toString('base64')}`);
                    break;

                  default:
                    continue;
                }
              } catch (e) {
                // log out the error?
                fileBuffer = '';
              }
            };
            res[esf.fieldName] = data;
          }
        }
        subs.next(results);
        subs.complete();
      })().catch(e => {
        // can be logged...
        // this simply catches any uncaught exception from occurring (typically should only be programming errors) and prevents the parsing request from exploding if an error occurs
      });
    }).pipe(
      finalize(() => {
        if (rStream && !rStream.destroyed) {
          rStream.destroy();
        }
      }),
      takeUntil(destroy$)
    );
  };


  omitKey(obj, key) {
    const { [key]: removedKey, ...newObj } = obj;
    return newObj;
  }
}


let destroy$ = new Subject();


const SUPPORTED_PARSERS = {
  csv: CSVParser
};


exports.init = () => {
  if (!destroy$) {
    destroy$ = new Subject();
  } else {
    // may have been completed already
    try {
      destroy$.next();
    } catch(err) {
      destroy$ = new Subject();
    }
  }
}


exports.destroy = function() {
  destroy$.next();
  destroy$.complete();
}


exports.channels = {
  invoke: {

    'export-writecsv': (_, targetPath /* string: file/url/path to save data to */, data /* Array of JSON objects */) => {
      return defer(() => (new CSVWriter(targetPath)).write(data));
    },

    'export-example-csv': (_, targetPath /* string */) => {
      const basePath = _app.getAppPath();
      const SOURCE_CSV_PATH = _path.join(basePath, 'resources', 'templates', 'csv_template.csv');

      return new Observable(observer => {
        if ((typeof targetPath !== 'string') || (targetPath.length < 3) || !_fs.existsSync(SOURCE_CSV_PATH)) {
          observer.error('MP_COPY_ERROR');
          observer.complete();
        } else {
          try {
            _fs.copyFile(SOURCE_CSV_PATH, targetPath, _fs.constants.COPYFILE_EXCL, (err) => {
              if (err) {
                observer.error(err);
              } else {
                observer.next(true);
              }
              observer.complete();
            });
          } catch (err1) {
            observer.error('MP_COPY_ERROR');
            observer.complete();
          }
        }
      });
    },

    'importer': (_, parseType /* SUPPORTED_PARSERS keys */, source /* string: file/url/path to process */, parseArgs /* object: args for the parser */) => {
      return defer(() => {
        if ((typeof parseType !== 'string') || !Object.keys(SUPPORTED_PARSERS).includes(parseType)) {
          return throwError(new Error('INVALID_PARSER'));
        }

        if ((typeof source !== 'string') || (!source.length > 0)) {
          return throwError(new Error('INVALID_SOURCE'));
        }

        if ((Object.prototype.toString.call(parseArgs) !== '[object Object]')) {
          return throwError(new Error('INVALID_PARSER_ARGS'));
        }

        return defer(() => (new SUPPORTED_PARSERS[parseType](parseArgs)).parse(source));
      });
    },

    'key-generator': (_, keyTypeRequired /* 'PRIVATE' | 'PUBLIC' */, fromKey /* string */ ) => {
      return new Observable(observer => {
        if ((typeof keyTypeRequired !== 'string') || !['PUBLIC'].includes(keyTypeRequired) || (typeof fromKey !== 'string')) {
          observer.error('MP_KEYGEN_INVALID_PARAMS');
        } else {
          try {
            let newKey;
            switch (keyTypeRequired) {
              case 'PUBLIC': newKey = bitcore.PrivateKey.fromWIF(fromKey).toPublicKey().toString(); break;
            }
            if ((typeof newKey !== 'string') || !(newKey.length > 0)) {
              throw new Error('something went wrong');
            } else {
              observer.next(newKey);
            }

          } catch (err) {
            observer.error('MP_KEYGEN_INVALID_KEY');
          }
          observer.complete();
        }
      });
    },

  }
};