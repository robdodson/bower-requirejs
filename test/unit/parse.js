/* jshint expr: true */
/* global describe:true, it:true */

'use strict';
var should = require('should');
var parse = require('../../lib/parse');
var deps = require('./fixtures/deps');

describe('parse', function () {
  it('should return a paths object with a single path', function () {
    var actual = parse(deps.jquery, 'jquery', './');
    var expected = { paths: { jquery: 'tmp/bower_components/jquery/jquery' }};
    actual.should.eql(expected);
  });

  it('should return paths by filename if there are multiple js files', function () {
    var actual = parse(deps.handlebars, 'handlebars', './');
    var expected = {
      paths: {
        'handlebars': 'tmp/bower_components/handlebars/handlebars',
        'handlebars.runtime': 'tmp/bower_components/handlebars/handlebars.runtime'
      }
    };
    actual.should.eql(expected);
  });

  it('should ignore non-JavaScript files', function () {
    var actual = parse(deps.withCSS, 'withCSS', './');
    var expected = { paths: { withCSS: 'tmp/bower_components/withCSS/withCSS' }};
    actual.should.eql(expected);
  });
});
