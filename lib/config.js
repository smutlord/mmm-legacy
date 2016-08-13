/**
 * Main config module
 *
 * @name config
 */

'use strict';

// Globally needed modules
var _ = require('lodash');
var log = require('./logger');

// "Constants"
var ENV_FILE = 'env.yaml';
var ENV_PREFIX = 'MMM_';

/*
 * Define the default config object
 */
var getDefaultConfig = function() {

  // Get helpers
  var os = require('os');
  var path = require('path');

  // Define common things
  var homeDir = os.homedir();
  var confDir = path.join(homeDir, '.mmm');
  var srcRoot = path.resolve(__dirname, '..');
  var envFiles = [
    path.resolve(srcRoot, ENV_FILE),
    path.join(confDir, ENV_FILE)
  ];

  // Build the default config object
  var config = {
    srcRoot: srcRoot,
    home: homeDir,
    confDir: confDir,
    envFiles: envFiles,
  };

  // Log things
  log.verbose('Default config', config);

  // Return default config
  return config;

};

/*
 * Merge in envFile if it exists
 */
var mergeEnvFile = function(file) {

  // Load needed modules
  var fs = require('fs-extra');
  var yaml = require('js-yaml');

  // Merge in file if it exists
  if (fs.existsSync(file)) {

    // Get file data
    var data = yaml.safeLoad(fs.readFileSync(file));

    // Log it
    log.info('Found env.yaml config at %s with ', file, data);

    // Return
    return yaml.safeLoad(fs.readFileSync(file));

  }

  // Return emptiness
  return {};

};

/*
 * Merge in env vars if they exists
 */
var mergeEnvVars = function() {

  // Start an object of our env
  var envConfig = {};

  // Build object of MMM_ envvars
  _.forEach(process.env, function(value, key) {
    if (_.includes(key, ENV_PREFIX)) {

      // Log it
      log.info('Overriding config with %s=%s', key, value);

      // Add to our config object
      envConfig[_.camelCase(_.trimStart(key, ENV_PREFIX))] = value;

    }
  });

  // Return our findings
  return envConfig;

};

/*
 * Helper method to load our config
 */
var loadConfig = _.memoize(function() {

  // Start with a default config
  var config = getDefaultConfig();

  // Check to see if we have an env.yaml file and merge that in
  _.forEach(config.envFiles, function(file) {
    config = _.merge(config, mergeEnvFile(file));
  });

  // Check for ENV values and merge those in as well
  config = _.merge(config, mergeEnvVars());

  // Log final config
  log.info('Finished with config', config);

  // Return our config
  return config;

});

/*
 * A function that retuns our config object
 */
module.exports = function() {
  return loadConfig();
};