'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const fs = require('fs-promise');

describe('Logger Tests', () => {

  before(function(done) {
    Promise.coroutine(function* () {
      try {
        done();
      } catch (err) {
        done(new Error(err));
      }
    })();
  });

  it(`should test essential functionality`, (done) => {
    Promise.coroutine(function* () {
      try {
        // Set project root so no auto inferring process.env.PROJECT_ROOT = __dirname;
        // Infer project root path
        let logger = new (require('../index.js'))(__filename);

        // Normal logging
        process.env.LOG_LEVEL = 'INFO,WARN,ERROR';
        logger.log('info', 'Basic test');
        logger.log('badLevel', 'Level isnt valid. Should not log');
        logger.log('info', 'Object metadata included', {
          prop1: 'p1',
          prop2: 'p2'
        });

        // Shortcut methods
        logger.info('Basic test');
        logger.warn('Basic test');
        logger.error('Basic test');

        // Log Error objects
        const appError = new Error('AppError');
        logger.log('error', appError);

        // Test env vars
        process.env.LOG_LEVEL = 'WARN,ERROR';
        logger.log('info', 'INFO not in env var. Shouldnt show');
        process.env.PROJECT_ROOT = 'what?';
        logger = new (require('../index.js'))(__filename);
        logger.log('warn', 'PROJECT_ROOT is not correct. Should show full source file path');

        // Set level manually
        logger.logLevel = 'inFo,WARN,ERROR';
        logger.log('info', 'Set logLevel but no effect because LOG_LEVEL is set');
        process.env.LOG_LEVEL = '';
        logger.log('info', 'Now it should show');

        done();

      } catch (err) {
        done(new Error(err));
      }
    })();
  });


  it(`should test special cases`, (done) => {
    Promise.coroutine(function* () {
      try {

        // Use winston instance to add transports
        process.env.LOG_LEVEL = 'INFO,WARN,ERROR';
        let logger = new (require('../index.js'))(__filename);
        const winston = logger.getWinstonInstance();
        const winstonLogger = logger.getWinstonLoggerInstance();
        winstonLogger.add(winston.transports.File, {
          name: 'audit_log',
          filename: 'test.log'
        });

        logger.log('info', 'Should show in console and file');

        logger = new (require('../index.js'))(__filename);
        logger.log('info', 'Should show in console and file also');

        done();

      } catch (err) {
        done(new Error(err));
      }
    })();
  });

});
