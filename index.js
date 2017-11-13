'use strict';

const context = require('request-context');
const winston = require('winston');
const fs = require('fs');
const debug = require('debug')('service-logger');

winston.emitErrs = false; // winston logger emits errors so supress them


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
      colorize: true,
      formatter: function(options) {
        // Return string will be passed to logger.
        return options.timestamp() + ' - ' + options.level.toLowerCase() + ' - ' +
        (options.message ? options.message : '') + ' ' +
        (options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : '');
      }
    })
  ]
});
winstonLogger.setLevels(winston.config.syslog.levels); // Use RFC5424 the syslog levels


/**
* Class wrapper around winston.
* A new instance of this class should be instantiated in each file that will be
* doing logging like so:
*  const logger = new Logger(__filename);
*/
class Logger {

  /**
  * @constructor
  * @param {string} sourcePath - sourcePath to use in log statements
  */
  constructor(sourcePath) {

    debug(`sourcePath: ${sourcePath}`);

    // Treat sourcePath as a valid file path. If not a file path use the literal value
    let filepathRelativeToProjectRoot;
    try {
      debug(`__filename: ${__filename}`);
      fs.statSync(sourcePath);
      let projectRootPath = __filename.split('index.js')[0];
      if (projectRootPath.includes('node_modules/service-logger/')) {
        projectRootPath = projectRootPath.split('node_modules/service-logger')[0];
      }
      debug(`projectRootPath: ${projectRootPath}`);

      if (projectRootPath === '/') {
        // If project in OS's root dir (/), then filepathRelativeToProjectRoot is everything after /
        filepathRelativeToProjectRoot = sourcePath.substring(1);
      } else {
        // Get filepath relative to the root path of this project.
        filepathRelativeToProjectRoot = sourcePath.split(projectRootPath)[1];
      }
    } catch (e) {
      // If sourcePath isn't file path, use the literal value
    }

    this._sourcePath = filepathRelativeToProjectRoot || sourcePath || 'unknown:source:file';
    debug(`this._sourcePath: ${this._sourcePath}`);

    this._logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();

    if (this._logLevel.indexOf('*') !== -1) {
      this._logLevel = 'debug';
    } else if (!winston.config.syslog.levels[this._logLevel]) {
      throw new Error(this._logLevel + ' is not a valid log level. It must be ONE value equal to one of the RFC5424 the syslog levels in Winston');
    }

    winstonLogger.transports.console.level = this._logLevel;
  }

  /**
  * Set the name of the file this Logger is being used in
  * @param {string} sourcePath - sourcePath to use in log statements
  */
  set sourcePath(value) {
    this._sourcePath = value;
  }

  /**
  * Get the name of the file this Logger is being used in (must be set before)
  * @return {string}
  */
  get sourcePath() {
    return this._sourcePath;
  }

  /**
  * Set the levels that this Logger is allowed to log
  * @param {string} levels - comma separated string list of levels. See Winston
  *   documentation for available levels
  */
  set logLevel(level) {
    this._logLevel = level.toLowerCase();
    winstonLogger.transports.console.level = this._logLevel;
  }

  /**
  * Get the levels this Logger is allowed to log
  * @return {string}
  */
  get logLevel() {
    return this._logLevel;
  }


  /**
  * Get winston instance
  * @return {string}
  */
  getWinstonInstance() {
    return winston;
  }

  /**
  * Get winston logger instance
  * @return {string}
  */
  getWinstonLoggerInstance() {
    return winstonLogger;
  }


  formatMessage(message, metadata = {}) {
    let formatted = this._sourcePath + ' - ';
    if (context.get('request:requestId')) {
      formatted += context.get('request:requestId') + ' - ';
    } else if (metadata.requestId) {
      formatted += metadata.requestId + ' - ';
    }
    return formatted + message;
  }


  /**
  Main logging function.
  @param {string} level - RFC5424 syslog level to use
  @param {string|Error} message - main log message or Error object
  @param {Object} [metadata] - object containing any additional information
  you wish to log
  */
  log(level, message, metadata) {
    const lvl = level === 'err' ? 'error' : level;
    const meta = typeof metadata === 'object' ? metadata : {};
    if (message instanceof Error) {
      this.logError(lvl, message, meta);
    } else {
      const msg = typeof message === 'object' ? JSON.stringify(message) : message;
      const formattedMessage = this.formatMessage(msg, meta);
      winstonLogger.log(lvl, formattedMessage, meta);
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
    const lvl = level === 'err' ? 'error' : level;
    const meta = typeof metadata === 'object' ? metadata : {};
    if (err instanceof Error) {
      const formattedErr = this.formatMessage(err.name + ' - ' + err.message + ' - \n' + err.stack, meta);
      winstonLogger.log(lvl, formattedErr, meta);
    } else {
      // Probably shouldn't throw non-Error objects
      const formattedErr = this.formatMessage(JSON.stringify(err), meta);
      winstonLogger.log(lvl, formattedErr, meta);
    }
  }

  debug(message, metadata) {
    this.log('debug', message, metadata);
  }

  info(message, metadata) {
    this.log('info', message, metadata);
  }

  notice(message, metadata) {
    this.log('notice', message, metadata);
  }

  warn(message, metadata) {
    this.log('warning', message, metadata);
  }

  warning(message, metadata) {
    this.log('warning', message, metadata);
  }

  error(message, metadata) {
    this.log('error', message, metadata);
  }

  err(message, metadata) {
    this.log('error', message, metadata);
  }

  crit(message, metadata) {
    this.log('crit', message, metadata);
  }

  alert(message, metadata) {
    this.log('alert', message, metadata);
  }

  emerg(message, metadata) {
    this.log('emerg', message, metadata);
  }

  toString() {
    return 'Logger for file: ' + this._sourcePath;
  }
}

module.exports = Logger;
