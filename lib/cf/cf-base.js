
/**
 *  The base of all the simple cf objects.
 */

var _             = require('underscore');
var helpers       = require('../../helpers');

var _isnt         = helpers._isnt;

var base = {};

/**
 *  The base.
 *
 *    Base.call(this, cf, 'EC2::RouteTable', name);
 *
 */
var Base = base.Base = function(cf, type, name) {
  var self = this;

  self.cf = cf;

  // Our data -- this is what will be serailized to JSON
  self.data = {
    Type        : ['AWS', type].join('::'),
    Properties  : {
      //Tags      : []
    }
  };

  /**
   *  Add something to the Property attribute.
   *
   *  You want addPropertyId if you are adding a ref:, or ID
   */
  self.addProperty = function(propName, value) {
    self.data.Properties[propName] = value;
  };

  /**
   *  Add an Id.
   *
   *  Adds either the value (if is a string) or calls ref().
   */
  self.addPropertyId = function(propName, value_) {
    var value = value_;

    // If no value, no set
    if (_isnt(value)) {
      return;
    }

    // If it is an object, see if it has the ref() function
    if (_.isObject(value) && value.ref) {
      value = value.ref();
    }

    self.data.Properties[propName] = value;
  };

  /**
   *  Serialize to JSON.
   *
   *  Actually, we just return our data.
   */
  self.toJson = function() {
    return self.data;
  };

  /**
   *  Return our name for ref() calls.
   *
   *      {Ref: 'MyVpc'}
   */
  self.ref = function() {
    return {Ref:name};
  };

};

// Export
_.each(base, function(value, key) {
  exports[key] = value;
});


