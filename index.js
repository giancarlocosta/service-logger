'use strict';

const winston = require('winston');
const projectRootPath = process.env.PROJECT_ROOT || __dirname;

// logger emits errors so supress them
winston.emitErrs = false;

/**
 * Return filepath following the root path of this project.
 */
function parsePath(filePath) {
  return filePath.split(projectRootPath)[1];
}


/**
 * Return current time string in ISO format
 */
function isoTimestamp() {
  return (new Date()).toISOString();
}


const winstonLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: isoTimestamp,
      colorize: true
    }),
    new (winston.transports.File)({
      name: 'security-suite.log',
      filename: `${process.env.AUDIT_LOG_PATH}`
    })
  ]
});


/**
 * Class wrapper around winston.
 * A new instance of this class should be instantiated in each file that will be
 * doing logging like so:
 *  const logger = new Logger(__dirname);
 */
class Logger {

  /**
   * @constructor
   * @param {string} filename - Filename to use in log statements
   */
  constructor(filename) {
    this._filename = parsePath(filename) ? parsePath(filename) : filename;
  }

  /**
   * Set the name of the file this Logger is being used in
   * @param {string} filename - Filename to use in log statements
   */
  set filename(value) {
    this._filename = value;
  }

  /**
   * Get the name of the file this Logger is being used in (must be set before)
   * @return {string}
   */
  get filename() {
    return this._filename;
  }

  /**
   * Function to check if passed level is included (enabled) in env variables
   * @param {string} level - level to check against env variables
   * @return {Boolean} true if level enabled
   */
  levelEnabled(level) {
    return process.env.LOG_LEVEL && (process.env.LOG_LEVEL === '*'
      || process.env.LOG_LEVEL.indexOf(level) !== -1);
  }

  /**
   * Main logging function that should be used in all files.
   * @param {string} level - log level to use
   * @param {string} message - main log message
   * @param {Object} [metadata] - object containing any additional information
   *  you wish to log
   */
  log(level, message, metadata) {
    if (typeof level === 'string' && this.levelEnabled(level.toUpperCase())) {
      if (message instanceof Error) {
        this.logError(level, message, metadata);
      } else {
        winstonLogger.log(level, message, { file: this._filename, metadata });
      }
    }
  }

  /**
   * Special function for logging objects that are instances of 'Error' class
   * @param {string} level - log level to use
   * @param {Object} err - SHOULD BE an instance of Error class but will accept
   *   anything
   * @param {Object} [metadata] - object containing any additional information
   *  you wish to log
   */
  logError(level, err, metadata) {
    if (err instanceof Error) {
      if (this.levelEnabled(level.toUpperCase())) {
        winstonLogger.log(level, err.name + ' - ' + err.message + ' - \n' + err.stack, {
          file: this._filename, metadata
        });
      } else {
        // Probably shouldn't throw non-Error objects
        winstonLogger.log(level, err, { file: this._filename, metadata });
      }
    }
  }

  toString() {
    return 'Logger for file:' + this._filename;
  }
}

module.exports = Logger;
