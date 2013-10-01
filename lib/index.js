'use strict';
var events = require('events');
var path = require('path');
var fs = require('fs');
var util = require('util');
var requirejs = require('requirejs/bin/r.js');
var _ = require('lodash');
var Dependency = require('./dependency');

var BowerRequireJS = module.exports = function BowerRequireJS(args, opts) {
  events.EventEmitter.call(this);

  args = args || [];
  this.arguments = Array.isArray(args) ? args : args.split(' ');
  this.options = opts || {};

  this.config = this.options.config || './';
  this.configDir = path.dirname(this.config);
  this.filePath = this.config; // TODO: Redundant?
  this.file = fs.readFileSync(String(this.filePath), 'utf-8');

  this.excludes = this.options.excludes || [];
  this.baseUrl = this.options.baseUrl || this.configDir;
  this.dependencies = [];
};

util.inherits(BowerRequireJS, events.EventEmitter);


/**
 * Error handler taking `err` instance of Error.
 *
 * The `error` event is emitted with the error object, if no `error` listener
 * is registered, then we throw the error.
 *
 * @param {Object} err
 */

BowerRequireJS.prototype.error = function error(err) {
  err = err instanceof Error ? err : new Error(err);
  if (!this.emit('error', err)) {
    throw err;
  }

  return this;
};


BowerRequireJS.prototype.run = function run(done) {
  var self = this;

  require('bower').commands.list({ paths: true, relative: false })
    .on('end', function (data) {
      if (data) {
        // remove excludes and turn everything into a Dependency
        data = _.forOwn(data, function (val, key, obj) {
          if (self.excludes.indexOf(key) !== -1) {
            delete obj[key];
            return;
          }

          // if val is not an array convert it to one so we can
          // use the same process throughout
          if (!_.isArray(val)) {
            val = [val];
          }

          self.dependencies.push(new Dependency(key, val));
        });
      }


      var rjsConfig;
      requirejs.tools.useLib(function (require) {
        rjsConfig = require('transform').modifyConfig(self.file, function (config) {

          // iterate through Dependency collection and write
          // each to rjs config file
          var dependencyMap = {};
          self.dependencies.forEach(function(dependency) {
            _.each(dependency.getPaths(), function(dependencyPath) {
              var depName = dependencyPath.name;
              var depPath = path.relative(self.baseUrl, dependencyPath.path);
              // TODO
              // var depPath = normalizePath(depPath);
              dependencyMap[depName] = depPath;
            });
          });

          // If the original config defines paths, add the
          // bower component paths to it; otherwise, add a
          // paths map with the bower components.
          if (config.paths) {
            _.extend(config.paths, dependencyMap);
          } else {
            config.paths = dependencyMap;
          }

          return config;
        });

        fs.writeFileSync(self.filePath, rjsConfig, 'utf-8');

        if (typeof done === 'function') {
          done();
        }

        self.emit('end');
      });
    })
    .on('error', function(err) {
      self.error(err);
    });
};
