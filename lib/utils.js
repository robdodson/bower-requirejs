'use strict';

var chalk = require('chalk');
var slash = require('slash');

// Object to be exported
var utils = module.exports = {};

// Logging colors
utils.warn = chalk.black.bgYellow;

// Coerce something to an Array.
utils.toArray = Function.call.bind(Array.prototype.slice);

// What "kind" is a value?
var kindsOf = {};
'Number String Boolean Function RegExp Array Date Error'.split(' ').forEach(function(k) {
  kindsOf['[object ' + k + ']'] = k.toLowerCase();
});
utils.kindOf = function kindOf(value) {
  // Null or undefined.
  if (value === null || value === undefined) { return String(value); }
  // Everything else.
  return kindsOf[kindsOf.toString.call(value)] || 'object';
};

// Fixup slashes in file paths for windows
utils.normalizePath = function normalizePath(str) {
  return process.platform === 'win32' ? slash(str) : str;
};
