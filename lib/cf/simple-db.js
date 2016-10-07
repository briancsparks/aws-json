
/**
 *
 */

var _             = require('underscore');
var base          = require('./cf-base');
var Base          = base.Base;

// Our lib
var simpleDb = {};

/**
 *  simpleDb
 *
 */
var SimpleDb = simpleDb.SimpleDb = function(name, cf, description) {
  var self = this;
  Base.call(this, cf, 'SDB::Domain', name);

  self.addProperty('Description', description);
  cf.data.Resources[name] = self;
};

simpleDb.makeSimpleDb = function(name, cf, description) {
  return new SimpleDb(name, cf, description);
}

_.each(simpleDb, function(value, key) {
  exports[key] = value;
});





