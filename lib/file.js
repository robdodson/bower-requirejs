'use strict';

var util = require('./util');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');

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
  var args = util.toArray(arguments);
  // If the first argument is an options object, save those options to pass
  // into the file.glob.sync method.
  var options = util.kindOf(args[0]) === 'object' ? args.shift() : {};
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
file.removeExtensions = function removeExtensions(filepath) {
  var newPath;
  if (this.isDir(filepath)) {
    // TODO: Move this warning
    console.log(util.warn('WARN'), filepath + ' does not specify a .js file in main');
    newPath = filepath;
  } else {
    newPath = path.join(path.dirname(filepath), path.basename(filepath, '.js'));
  }
  return newPath;
};
