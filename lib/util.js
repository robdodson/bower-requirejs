'use strict';

var chalk = require('chalk');
var slash = require('slash');
var _ = require('lodash');

// Object to be exported
var util = module.exports = {};

// Logging colors
util.warn = chalk.black.bgYellow;

// Coerce something to an Array.
util.toArray = Function.call.bind(Array.prototype.slice);

// What "kind" is a value?
var kindsOf = {};
'Number String Boolean Function RegExp Array Date Error'.split(' ').forEach(function(k) {
  kindsOf['[object ' + k + ']'] = k.toLowerCase();
});
util.kindOf = function kindOf(value) {
  // Null or undefined.
  if (value === null || value === undefined) { return String(value); }
  // Everything else.
  return kindsOf[kindsOf.toString.call(value)] || 'object';
};

// Fixup slashes in file paths for windows
util.normalizePath = function normalizePath(str) {
  return process.platform === 'win32' ? slash(str) : str;
};

// Remove '.' separated extensions from library/file names
// ex: filterName('typeahead.js', 'js') returns 'typeahead'
// ex: filterName('foo.min.js', 'js, 'min') returns 'foo'
util.filterName = function filterName() {
  var slice = Array.prototype.slice;
  var oldName = arguments[0];
  var newName = _.difference(oldName.split('.'), slice.call(arguments, 1));

  // Re-attach any leftover pieces
  // ex: handlebars.runtime.js becomes handlebars.runtime
  if (newName.length > 1) {
    newName = newName.join('.');
  } else {
    newName = newName[0];
  }

  if (newName !== oldName) {
    console.log(util.warn('WARN'), 'Renaming ' + oldName + ' to ' + newName + '\n');
  }

  return newName;
};
