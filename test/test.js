'use strict';


const expect = require('chai').expect;

const INDEX = '../index.js';

describe('Logger Tests', () => {


  it(`Normal logging with custom source path in constructor`, (done) => {

    let logger;

    process.env.LOG_LEVEL = 'INFO';
    logger = new (require(INDEX))('my:custom:source:path');
    logger.info('Basic test');
    logger.log('info', 'Basic test');

    done();
  });


  it(`Normal logging with undefined source path in constructor (results in full path being shown)`, (done) => {

    let logger;

    process.env.LOG_LEVEL = 'INFO';
    logger = new (require(INDEX))();
    logger.info('Basic test');
    logger.log('info', 'Basic test');

    done();
  });


  it(`Normal logging with __filename in constructor`, (done) => {

    let logger;

    // Normal logging with __filename in constructor
    process.env.LOG_LEVEL = 'INFO';
    logger = new (require(INDEX))(__filename); // Infer project root path
    logger.info('Basic test');
    logger.log('info', 'Basic test');
    logger.info('Object metadata included', {
      prop1: 'p1',
      prop2: 'p2'
    });
    logger.notice('Throwing Authorization Required error', {
      summary: 'Level validation failed in afterRemote hook',
      gian: { hi: 4 }
    }, 4, 5);
    logger.notice(`Show a request id`, { requestId: '12345678', otherMetadata: 'yay' });
    logger.info({ g: { g: [{ g: 1}] }});
    logger.info({ g: { g: [{ g: 1}] }}, { g: 1});

    done();
  });


  it(`Direct logger.log() calls`, (done) => {

    let logger;

    process.env.LOG_LEVEL = 'INFO';
    logger = new (require(INDEX))(__filename);
    logger.log('info', 'Basic test');
    logger.log('warning', 'Basic test');
    logger.log('error', 'Basic test');
    logger.log('badLevel', 'Level isnt valid. Should not log');

    done();
  });


  it(`Set level manually`, (done) => {

    let logger;

    process.env.LOG_LEVEL = 'INFO';
    logger = new (require(INDEX))(__filename);
    logger.info('Should show info');

    // Set level manually
    logger.logLevel = 'ERROR';
    logger.info('Should NOT show info since info level < error level');
    logger.error('Should show error');
    process.env.LOG_LEVEL = 'INFO';
    logger.info('Should NOT show info since process.env.LOG_LEVEL is only used during instantiation');
    logger.logLevel = 'INFO';
    logger.info('Should show info again');

    done();
  });


  it(`Default log level in absence of LOG_LEVEL env var`, (done) => {

    let logger;

    process.env.LOG_LEVEL = '';
    logger = new (require(INDEX))(__filename);
    logger.info('Should NOT show debug');
    logger.info('Should NOT show info');
    logger.notice('Should show notice');
    logger.warning('Should show warning');
    logger.error('Should show error');

    done();
  });


  it(`Log Error objects`, (done) => {

    let logger;

    process.env.LOG_LEVEL = 'INFO';
    logger = new (require(INDEX))(__filename);

    const appError = new Error('AppError');
    logger.error(appError);
    logger.log('error', appError);
    logger.warning(appError, { requestId: '12345678' });

    done();
  });


  it(`Add custom file Transport`, (done) => {

    // Use winston instance to add transports
    process.env.LOG_LEVEL = 'INFO';
    let logger = new (require(INDEX))(__filename);
    const winston = logger.getWinstonInstance();
    const winstonLogger = logger.getWinstonLoggerInstance();
    winstonLogger.add(winston.transports.File, {
      name: 'audit_log',
      filename: 'test.log'
    });

    logger.log('info', 'Should show in console and file');

    logger = new (require(INDEX))(__filename);
    logger.log('info', 'Should show in console and file also');

    done();
  });


  it(`Catch instatiation error if process.env.LOG_LEVEL set to invalid level`, (done) => {

    // Use winston instance to add transports
    process.env.LOG_LEVEL = 'WTFFF';
    try {
      const logger = new (require(INDEX))(__filename);
      done(new Error('Should throw instatiation error due to bad process.env.LOG_LEVEL'));
    } catch (e) {
      done();
    }
  });

});
