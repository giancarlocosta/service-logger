'use strict';

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
    this._logLevel = (process.env.LOG_LEVEL || 'WARN,ERROR').toUpperCase();
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
  set logLevel(levels) {
    this._logLevel = levels.toUpperCase();
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

  /**
   * Function to check if passed level is included (enabled) in env variables
   * @param {string} level - level to check against env variables
   * @return {Boolean} true if level enabled
   */
  levelEnabled(level) {
    const enabledLevels = process.env.LOG_LEVEL || this._logLevel;
    return enabledLevels && typeof level === 'string' && (enabledLevels === '*'
      || enabledLevels.toUpperCase().indexOf(level.toUpperCase()) !== -1);
  }

  /**
   * Main logging function that should be used in all files.
   * @param {string} level - log level to use
   * @param {string|Error} message - main log message or Error object
   * @param {Object} [metadata] - object containing any additional information
   *  you wish to log
   */
  log(level, message, metadata) {
    if (this.levelEnabled(level)) {
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
    if (this.levelEnabled(level)) {
      if (err instanceof Error) {
        winstonLogger.log(level, err.name + ' - ' + err.message + ' - \n' + err.stack, {
          file: this._filename, metadata
        });
      } else {
        // Probably shouldn't throw non-Error objects
        winstonLogger.log(level, err, { file: this._filename, metadata });
      }
    }
  }

  info(message, metadata) {
    this.log('info', message, metadata);
  }

  warn(message, metadata) {
    this.log('warn', message, metadata);
  }

  error(message, metadata) {
    this.log('error', message, metadata);
  }

  toString() {
    return 'Logger for file: ' + this._filename;
  }
}

module.exports = Logger;
