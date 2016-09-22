
var _             = require('underscore');

var base = {};

var Base = base.Base = function(cf_, type, name) {
  var self = this;

  self.cf = cf_;

  self.data = {
    Type        : ['AWS', type].join('::'),
    Properties  : {
//      Tags      : []
    }
  };

  self.addProperty = function(propName, value) {
    self.data.Properties[propName] = value;
  };

  self.toJson = function() {
    return self.data;
  };

  self.ref = function() {
    return {Ref:name};
  };

};

_.each(base, function(value, key) {
  exports[key] = value;
});


