'use strict';
var path = require('path');
var _ = require('lodash');
var file = require('./file');
var primary = require('./primary');

/**
 * Parse bower dependency down to one or more primary
 * js files.
 */

module.exports = function(dep, name, baseUrl) {

  /**
   * Parse dependency
   */

  function dependency() {
    if (isDir()) {
      // Look for top level js, otherwise
      // bail out.
      dep = primary(name, dep);
      if (!dep) {
        return false;
      }
    }

    if (isMultiple()) {
      dep = filter(dep);
    }

    if (!_.isArray(dep)) {
      dep = [dep];
    }

    return {
      paths: paths()
    };
  }

  /**
   * If the dependency is a directory
   */

  function isDir() {
    return _.isString(dep) && file.isDir(dep);
  }

  /**
   * If there are multiple files in the dependency
   */

  function isMultiple() {
    return _.isArray(dep) && dep.length > 1;
  }

  /**
   * Filter an Array down to only js files
   */

  function filter(arr) {
    var jsfiles = _.filter(arr, function(val) {
      return path.extname(val) === '.js';
    });

    return jsfiles;
  }

  /**
   * Find all paths associated with this dependency.
   */

  function paths() {
    var dependencies = {};
    var resolve = resolver(dependencies);
    _.each(dep, resolve);
    return dependencies;
  }

  /**
   * Disambiguate a dependency path if a dependency was
   * not explicitly listed in bower.json's main array
   * Some dependencies have multiple paths because there is more
   * than one .js file in bower.json's main attribute.
   */

  function resolver(dependencies) {
    return function(val, index, arr) {
      if (arr.length > 1) {
        _.extend(dependencies, dependencyByFilename(val));
      } else {
        _.extend(dependencies, dependencyByComponentName(name, val));
      }
    };
  }

  /**
   * Create dependency based off of filename
   */

  function dependencyByFilename(val) {
    var dep = {};
    var name = file.filterName(path.basename(val), 'js', 'min');
    var filepath = relative(file.removeExtension(val, 'js'));
    dep[name] = filepath;
    return dep;
  }

  /**
   * Create dependency based off of component name
   */

  function dependencyByComponentName(componentName, val) {
    var dep = {};
    var name = file.filterName(componentName, 'js', 'min');
    var filepath = relative(file.removeExtension(val, 'js'));
    dep[name] = filepath;
    return dep;
  }

  /**
   * Generate a relative path name using the baseUrl. If
   * baseUrl was not defined then it will just use the dir
   * that contains the rjs config file.
   */

  function relative(filepath) {
    return path.relative(baseUrl, filepath);
  }

  return dependency();
};
