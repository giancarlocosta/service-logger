'use strict';

const context = require('request-context');
const winston = require('winston');

winston.emitErrs = false; // winston logger emits errors so supress them

let projectRootPath = undefined;

/**
* Return filepath following the root path of this project.
*/
function parsePath(filePath) {
  return filePath.split(projectRootPath)[1];
}


/**
* Return longest common beginning string between all provided strings in
* 'stringArray'
*/
function longestCommonStartString(stringArray) {
  const sortedArr = stringArray.concat().sort();
  const shortestString = sortedArr[0];
  const longestString = sortedArr[sortedArr.length - 1];
  const shortestStringLength = shortestString.length;
  let i = 0;
  while (i < shortestStringLength && shortestString.charAt(i) === longestString.charAt(i)) {
    i++;
  }
  return shortestString.substring(0, i);
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
  * @param {string} filename - Filename to use in log statements
  */
  constructor(filename) {
    // Only set project root once
    projectRootPath = projectRootPath || process.env.PROJECT_ROOT || longestCommonStartString([__filename, module.parent.filename]);
    const projectRootRelativePath = parsePath(filename);

    this._filename = projectRootRelativePath ? projectRootRelativePath : filename;
    this._logLevel = (process.env.LOG_LEVEL || 'warning').toLowerCase();

    if (this._logLevel.indexOf('*') !== -1) {
      this._logLevel = 'debug';
    } else if (!winston.config.syslog.levels[this._logLevel]) {
      throw new Error(this._logLevel + ' is not a valid log level. It must be ONE value equal to one of the RFC5424 the syslog levels in Winston');
    }

    winstonLogger.transports.console.level = this._logLevel;
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

  formatMessage(message) {
    let formatted = this._filename + ' - ';
    if (context.get('request:requestId')) {
      formatted += context.get('request:requestId') + ' - ';
    }
    return formatted + message;
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


  /**
  * Main logging function that should be used in all files.
  * @param {string} level - log level to use
  * @param {string|Error} message - main log message or Error object
  * @param {Object} [metadata] - object containing any additional information
  *  you wish to log
  */
  log(level, message, metadata) {
    const lvl = level === 'err' ? 'error' : level;
    if (message instanceof Error) {
      this.logError(lvl, message, metadata);
    } else {
      const formattedMessage = this.formatMessage(message);
      winstonLogger.log(lvl, formattedMessage, metadata || null);
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
    if (err instanceof Error) {
      const formattedErr = this.formatMessage(err.name + ' - ' + err.message + ' - \n' + err.stack);
      winstonLogger.log(lvl, formattedErr, metadata || null);
    } else {
      // Probably shouldn't throw non-Error objects
      const formattedErr = this.formatMessage(JSON.stringify(err));
      winstonLogger.log(lvl, formattedErr, metadata || null);
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
    return 'Logger for file: ' + this._filename;
  }
}

module.exports = Logger;
