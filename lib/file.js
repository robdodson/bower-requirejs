'use strict';

var utils = require('./utils');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var slice = Array.prototype.slice;

var file = module.exports = {};

// Process specified wildcard glob patterns or filenames against a
// callback, excluding and uniquing files in the result set.
function processPatterns(patterns, fn) {
  // Filepaths to return.
  var result = [];
  // Iterate over flattened patterns array.
  _.flatten(patterns).forEach(function(pattern) {
    // If the first character is ! it should be omitted
    var exclusion = pattern.indexOf('!') === 0;
    // If the pattern is an exclusion, remove the !
    if (exclusion) { pattern = pattern.slice(1); }
    // Find all matching files for this pattern.
    var matches = fn(pattern);
    if (exclusion) {
      // If an exclusion, remove matching files.
      result = _.difference(result, matches);
    } else {
      // Otherwise add matching files.
      result = _.union(result, matches);
    }
  });
  return result;
}

// Return an array of all file paths that match the given wildcard patterns.
file.expand = function expand() {
  var args = utils.toArray(arguments);
  // If the first argument is an options object, save those options to pass
  // into the file.glob.sync method.
  var options = utils.kindOf(args[0]) === 'object' ? args.shift() : {};
  // Use the first argument if it's an Array, otherwise convert the arguments
  // object to an array and use that.
  var patterns = Array.isArray(args[0]) ? args[0] : args;
  // Return empty set if there are no patterns or filepaths.
  if (patterns.length === 0) { return []; }
  // Return all matching filepaths.
  var matches = processPatterns(patterns, function(pattern) {
    // Find all matching files for this pattern.
    return glob.sync(pattern, options);
  });
  // Filter result set?
  if (options.filter) {
    matches = matches.filter(function(filepath) {
      filepath = path.join(options.cwd || '', filepath);
      try {
        if (typeof options.filter === 'function') {
          return options.filter(filepath);
        } else {
          // If the file is of the right type and exists, this should work.
          return fs.statSync(filepath)[options.filter]();
        }
      } catch(e) {
        // Otherwise, it's probably not the right type.
        return false;
      }
    });
  }
  return matches;
};

// True if the file path exists.
file.exists = function exists() {
  var filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
};

// True if the path is a directory.
file.isDir = function isDir() {
  var filepath = path.join.apply(path, arguments);
  return file.exists(filepath) && fs.statSync(filepath).isDirectory();
};

// Remove extensions from file paths but ignore folders
file.removeExtension = function removeExtension(filepath, extension) {
  var newPath;
  if (extension[0] !== '.') {
    extension = '.'.concat(extension);
  }
  newPath = path.join(path.dirname(filepath), path.basename(filepath, extension));
  return newPath;
};

// Remove '.' separated extensions from library/file names
// ex: filterName('typeahead.js', 'js') returns 'typeahead'
// ex: filterName('foo.min.js', 'js, 'min') returns 'foo'
file.filterName = function filterName() {
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
    console.log(utils.warn('WARN'), 'Renaming ' + oldName + ' to ' + newName + '\n');
  }

  return newName;
};
