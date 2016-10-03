
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

/**
 *    Returns the string ip address into a Number.
 *
 *    For use with subnet masks.
 */
var ipNumber = helpers.ipNumber = function(ip_) {
    var ip = ip_.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if(ip) {
        return (+ip[1]<<24) + (+ip[2]<<16) + (+ip[3]<<8) + (+ip[4]);
    }
    // else ... ?
    return 0;
};

var dottedIp = helpers.dottedIp = function(n) {
  return [n >> 24, (n & 0xffffff) >> 16, (n & 0xffff) >> 8, n & 0xff].join('.');
};

helpers.nextIp = function(ip) {
  return dottedIp(ipNumber(ip) + 1);
};

var ipMask = helpers.ipMask = function(maskSize) {
  return -1 << (32 - maskSize);
};

var firstIpInCidrBlock = helpers.firstIpInCidrBlock = function(cidr) {
  var parts       = cidr.split('/');
  var minNumber   = ipNumber(parts[0]) & ipMask(parts[1]);
  return dottedIp(minNumber);
};

var lastIpInCidrBlock = helpers.lastIpInCidrBlock = function(cidr) {
  var parts       = cidr.split('/');
  var maxNumber   = ipNumber(parts[0]) | ~ipMask(parts[1]);
  return dottedIp(maxNumber);
};

helpers.nextCidrBlockOfSize = function(cidrBlock_, newNumBits) {
  var cidrBlock   = cidrBlock_.replace(/\/[0-9]+$/g, '/'+newNumBits);
  var last        = lastIpInCidrBlock(cidrBlock);
  var firstOfNext = ipNumber(last) + 1;

  return dottedIp(firstOfNext)+'/'+newNumBits;
};

_.each(helpers, function(value, key) {
  exports[key] = value;
});

