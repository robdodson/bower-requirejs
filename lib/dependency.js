'use strict';

var file = require('./file');
var util = require('./util');
var path = require('path');
var _ = require('lodash');

var Dependency = module.exports = function Dependency(name, filepath) {
  this._name = name;
  this._path = filepath;

  if (this._path.length === 1 && file.isDir(this._path[0])) {
    this._path = this.expandDir(this._path[0]);
  }

  this._path = this.filterForJS(this._path);
};

// if there's no main attribute in the bower.json file look for
// a top level .js file. if we don't find one, or if we find too many,
// continue to use the original value.
Dependency.prototype.expandDir = function expandDir(dir) {
  // put all top level js files into an array
  var main = file.expand({ cwd: dir }, '*.js', '!*.min.js');

  // if we find any Gruntfiles, remove them and log a warning.
  if (_.contains(main, 'grunt.js') || _.contains(main, 'Gruntfile.js')) {
    console.log(util.warn('WARN'), 'Ignoring Gruntfile in ' + this._name);
    console.log('You should inform the author to ignore this file in their bower.json\n');
    main = _.without(main, 'grunt.js', 'Gruntfile.js');
  }

  // look for a primary .js file based on the project name
  // ex: backbone.js inside backbone dir
  if (_.contains(main, path.basename(dir) + '.js')) {
    main = [path.basename(dir) + '.js'];
  }

  // look for a primary .js file based on the project name minus 'js'
  // ex: require.js inside requirejs dir
  if (_.contains(main, path.basename(dir).replace(/js$/, '') + '.js')) {
    main = [path.basename(dir).replace(/js$/, '') + '.js'];
  }

  // TODO: look in package.json for main?

  if (main.length === 1) {
    main = path.join(dir, main[0]);
  } else {
    main = dir;
  }

  return [main];
};

// iterate through the main array and filter it down
// to only .js files
Dependency.prototype.filterForJS = function filterForJS(val) {
  var jsfiles = _.filter(val, function(inval) {
    return path.extname(inval) === '.js';
  });

  return jsfiles;
};

Dependency.prototype.getPaths = function getPath() {
  var response = [];

  if (this._path.length > 1) {
    _.forEach(this._path, function (jspath) {
      // strip out any .js file extensions to make
      // requirejs happy
      jspath = file.removeExtensions(jspath);

      // clean up path names. for instance 'handlebars.js' would
      // become 'handlebars' and 'handlebars.runtime.js' would become
      // 'handlebars.runtime'
      var jsname = util.filterName(path.basename(jspath), 'js', 'min');
      response.push({ name: jsname, path: jspath });
    });
  } else {
    var depName = util.filterName(this._name, 'js', 'min');
    var depPath = file.removeExtensions(this._path[0]);
    response.push({ name: depName, path: depPath });
  }

  return response;
};
