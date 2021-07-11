const rxIpc = require('rx-ipc-electron/lib/main').default;
const rxjs = require('rxjs');
const rxjsOps = require('rxjs/operators');
const rxjsStream = require('rxjs-stream');
const { Transform } = require('json2csv');
const _fs = require('fs');

const rxToStream = rxjsStream.rxToStream;

const LISTENER = 'market-export-writecsv';
let destroy$ = new rxjs.Subject();


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
    return rxjs.defer(() => {
      let writeStream;

      return new rxjs.Observable(obs$ => {
        if (!Array.isArray(data)) {
          obs$.error('INVALID_DATA');
          return;
        }

        writeStream = _fs.createWriteStream(this._targetPath, { encoding: 'utf8' });
        const sourceStream = rxjs.from(data).pipe(
          rxjsOps.skipWhile(d => !d || Object.prototype.toString.call(d) !== '[object Object]'),
          rxjsOps.catchError(e => this.destroy$.next()),
          rxjsOps.takeUntil(destroy$)
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
        rxjsOps.finalize(() => {
          if (writeStream && !writeStream.destroyed) {
            writeStream.end();
          }
        }),
        rxjsOps.takeUntil(destroy$)
      );
    });
  }


}


exports.init = function() {
  if (!destroy$) {
    destroy$ = new rxjs.Subject();
  } else {
    // may have been completed already
    try {
      destroy$.next();
    } catch(err) {
      destroy$ = new rxjs.Subject();
    }
  }

  rxIpc.registerListener(LISTENER, (targetPath /* string: file/url/path to save data to */, data /* Array of JSON objects */) => {
    return rxjs.defer(() => (new CSVWriter(targetPath)).write(data));
  });
}


exports.destroy = function() {
  rxIpc.removeListeners(LISTENER);
  destroy$.next();
  destroy$.complete();
}
