

const _                       = require('underscore');
const sls                     = require('./serverless-cf');

var   lib = {};




_.each(lib, function(value, key) {
  exports[key] = value;
});

_.each(sls, function(value, key) {
  exports[key] = value;
});

