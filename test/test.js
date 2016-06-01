'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const fs = require('fs-promise');

describe('Tests Vote Class', () => {

  before(function(done) {
    Promise.coroutine(function* () {
      try {

        done();

      } catch(err) {
        done(new Error(err));
      }
    })();
  });

  it(`should ...`, (done) => {
    Promise.coroutine(function* () {
      try {

        done();

      } catch(err) {
        done(new Error(err));
      }
    })();
  });


  it(`should ...`, (done) => {
    Promise.coroutine(function* () {
      try {

        done();

      } catch(err) {
        done(new Error(err));
      }
    })();
  });

});
