#!/usr/bin/env node
'use strict';
var nopt = require('nopt');
var path = require('path');

var opts = nopt({
  config: path,
  excludes: Array,
  baseurl: path
}, {
  c: '--config',
  e: '--excludes',
  b: '--baseurl'
});

var args = opts.argv.remain;

require('../lib')(args, opts);
