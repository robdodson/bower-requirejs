/* global describe:true, it:true */

'use strict';
var fs = require('fs');
var should = require('should');
var BowerRequireJS = require('../lib/index');
var durableJsonLint = require('durable-json-lint');

// extract the config object as a string from the actual and expected files.
// then turn the string into json so we can deeply compare the objects.
// we do this because bower does not always create the paths object's keys
// in the same order. so a pure string to string comparison will break.
var jsonify = function (str) {
  var dirtyJson = str.slice(str.indexOf('{'), str.lastIndexOf('}') + 1);
  var cleanJson = durableJsonLint(dirtyJson).json;

  return JSON.parse(cleanJson);
};

describe('BowerRequireJS', function() {
  this.timeout(5000);

  it('should exist', function() {
    var options = { config: 'tmp/config.js', excludes: ['underscore'] };
    var bowerRequireJS = new BowerRequireJS(options);
    should.exist(bowerRequireJS);
  });

  describe('config', function() {
    it('should return the expected result', function(done) {
      var options = { config: 'tmp/config.js', excludes: ['underscore'] };
      var bowerRequireJS = new BowerRequireJS(options);
      bowerRequireJS.run(function(err) {
        if (err) {
          throw err;
        }

        var actual = jsonify(fs.readFileSync('tmp/config.js', 'utf-8'));
        var expected = jsonify(fs.readFileSync('test/fixtures/config-expected.js', 'utf-8'));
        actual.should.eql(expected);
        done();
      });
    });
  });

  describe('global-config', function() {
    it('should return the expected result', function(done) {
      var options = { config: 'tmp/global-config.js', excludes: ['underscore'] };
      var bowerRequireJS = new BowerRequireJS(options);
      bowerRequireJS.run(function(err) {
        if (err) {
          throw err;
        }

        var actual = jsonify(fs.readFileSync('tmp/global-config.js', 'utf-8'));
        var expected = jsonify(fs.readFileSync('test/fixtures/global-config-expected.js', 'utf-8'));
        actual.should.eql(expected);
        done();
      });
    });
  });

  describe('baseurl', function() {
    it('should return the expected result', function(done) {
      var options = { config: 'tmp/baseurl.js', excludes: ['underscore'], baseUrl: './' };
      var bowerRequireJS = new BowerRequireJS(options);
      bowerRequireJS.run(function(err) {
        if (err) {
          throw err;
        }

        var actual = jsonify(fs.readFileSync('tmp/baseurl.js', 'utf-8'));
        var expected = jsonify(fs.readFileSync('test/fixtures/baseurl-expected.js', 'utf-8'));
        actual.should.eql(expected);
        done();
      });
    });
  });

  describe('pathless-config', function() {
    it('should return the expected result', function(done) {
      var options = { config: 'tmp/pathless-config.js', excludes: ['underscore'] };
      var bowerRequireJS = new BowerRequireJS(options);
      bowerRequireJS.run(function(err) {
        if (err) {
          throw err;
        }

        var actual = jsonify(fs.readFileSync('tmp/pathless-config.js', 'utf-8'));
        var expected = jsonify(fs.readFileSync('test/fixtures/pathless-config-expected.js', 'utf-8'));
        actual.should.eql(expected);
        done();
      });
    });
  });
});
