
var _             = require('underscore');
var helpers       = {};

/**
 *  Sets sub-sub-key of object.
 *
 *  setOn(x, 'foo.bar.baz', 42)
 *
 *  x = {foo:{bar:{baz:42}}}
 *
 *  Does not set the sub-object if value is undefined. This allows:
 *
 *      // if abc is not set on  options, x.foo.bar.baz does not get set
 *      setOn(x, 'foo.bar.baz', options.abc);
 */
var setOn = helpers.setOn = function(x, keys_, value) {
  if (_.isUndefined(value)) { return; }

  var keys = keys_.split('.'), key;
  var owner = x;

  while (keys.length > 1) {
    key = keys.shift();
    owner[key] = owner[key] || {};
    owner = owner[key];
  }

  if ((key = keys.shift())) {
    owner[key] = value;
    return owner[key];
  }

  return;
};

var capitalizeFirstLetter = helpers.capitalizeFirstLetter = function(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 *  Returns the camel-case version of the string.
 *
 *  instance_type --> instanceType
 *  instance-type --> instanceType
 */
var toCamelCase = helpers.toCamelCase = function(key) {
  var parts = _.chain(key.split('.')).map(function(x) { return x.split(/[-_]/g); }).flatten().value();
  var result  = parts.shift();

  _.each(parts, function(s) {
    result += capitalizeFirstLetter(s);
  });

  return result;
};

helpers._isnt = function(x) {
  return _.isNull(x) || _.isUndefined(x);
};

_.each(helpers, function(value, key) {
  exports[key] = value;
});

