
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

  self.name = name;
  self.cf   = cf;

  // Our data -- this is what will be serailized to JSON
  self.data = {
    Type        : ['AWS', type].join('::'),
    Properties  : {
      //Tags      : []
    }
  };

  self.setTag = function(key, value) {
    self.data.Properties.Tags = self.data.Properties.Tags || [];

    // First, remove the item with the key, if it is here
    self.data.Properties.Tags = _.filter(self.data.Properties.Tags, function(tagValue, tagKey) {
      return tagKey !== key;
    });

    self.data.Properties.Tags.push({Key:key, Value:value});
  };

  /**
   *  Add something to the Property attribute.
   *
   *  You want addPropertyId if you are adding a ref:, or ID
   */
  self.addProperty = function(propName, value) {
    return (self.data.Properties[propName] = value);
  };

  /**
   *  Add multiple properties.
   *
   */
  self.addProperties = function(propName, values_) {
    var values = values_;

    // If no value, no set
    if (_isnt(values)) {
      return;
    }

    if (!_.isArray(values)) {
      return self.addProperties(propName, [values]);
    }

    self.data.Properties[propName] = self.data.Properties[propName] || [];
    _.each(values, function(value) {
      self.data.Properties[propName].push(value);
    });

    return self.data.Properties[propName];
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
    if (_.isObject(value) && value.ref && _.isFunction(value.ref)) {
      value = value.ref();
    }

    return (self.data.Properties[propName] = value);
  };

  /**
   *  Add multiple Ids.
   *
   *  Adds either the value (if is a string) or calls ref().
   */
  self.addPropertyIds = function(propName, values_) {
    var values = values_;

    // If no value, no set
    if (_isnt(values)) {
      return;
    }

    if (!_.isArray(values)) {
      return self.addPropertyIds(propName, [values]);
    }

    // If it is an object, see if it has the ref() function
    values = _.map(values, function(value) {
      if (_.isObject(value) && value.ref && _.isFunction(value.ref)) { return value.ref(); }
      return value;
    });

    self.data.Properties[propName] = self.data.Properties[propName] || [];
    _.each(values, function(value) {
      self.data.Properties[propName].push(value);
    });

    return self.data.Properties[propName];
  };

  /**
   *  Add something to the DependsOn attribute.
   *
   */
  self.addDependsOn = function(name) {
    if (!self.data.DependsOn) {
      self.data.DependsOn = name;
      return;
    }

    /* otherwise */
    if (!_.isArray(self.data.DependsOn)) {
      self.data.DependsOn = [self.data.DependsOn];
    }

    self.data.DependsOn.push(name);
  };

  /**
   *
   */
  self.output = function(name, value_, description) {
    var value = value_;

    // If no value, no set
    if (_isnt(value)) { return; }

    // If it is an object, see if it has the ref() function
    if (_.isObject(value) && value.ref && _.isFunction(value.ref)) {
      value = value.ref();
    }

    self.cf.data.Outputs[name] = {
      Value       : value,
      Description : description || ''
    };
  };

  /**
   *  Make a Fn::GetAtt for one of our values.
   */
  self.getAtt = function(attrName) {
    return {"Fn::GetAtt":[self.name, attrName]};
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
    return {Ref:self.name};
  };

};

// Export
_.each(base, function(value, key) {
  exports[key] = value;
});


