
var _         = require('underscore');

exports.parse = {};

/**
 *  Parse AWS Tags.
 *
 *    {"Tags":[
 *      { "Key":"key", "Value": "value" },
 *      { "Key":"key2", "Value": "value2" }
 *    ]}
 *
 *    becomes:
 *
 *    {
 *      key:"value",
 *      key2:"value2"
 *    }
 */
var parseTags = exports.parse.tags = function(tags) {
  return _.reduce(tags, function(m, tag) {
    if (!tag.Key || !tag.Value) { return m; }

    m[tag.Key] = tag.Value;
    m[tag.Key.replace(/[^a-zA-Z_0-9]+/g, '_')] = tag.Value;

    return m;
  }, {});
};

/**
 *  Create a normal JS object from an AWS array.
 *
 *  AWS will many times use an array of objects, were the JS convention would be
 *  an object. These arrays have an entry that should be used as the key.
 *
 */
var objectFromAwsArray = exports.parse.objectFromAwsArray = function(arr, keyName) {
  var result = _.reduce(arr, function(m, item) {
    if (!item[keyName]) { return m; }

    m[item[keyName]] = item;
    return m;
  }, {});

  if (_.keys(result).length === 0) {
    return arr;
  }

  return result;
}

/**
 *  Create a function like objectFromAwsArray, but specific for Reservations.
 */
var mkReservations = function() {
  return function(arr) {
    return objectFromAwsArray(arr, 'ReservationId');
  };
};

/**
 *  A function creating function like objectFromAwsArray, but for the named key.
 */
var mkFixer = function(keyName) {
  return function(arr) {
    return objectFromAwsArray(arr, keyName);
  };
};

/**
 *  A bunch of fixers.
 */
var fix = {};
fix.Reservations              = mkReservations();
fix.Instances                 = mkFixer('InstanceId');
fix.SecurityGroups            = mkFixer('GroupName');
fix.Groups                    = mkFixer('GroupName');
fix.NetworkInterfaces         = mkFixer('NetworkInterfaceId');
fix.BlockDeviceMappings       = mkFixer('DeviceName');

/**
 *  Parse an object that we know is an AWS object.
 */
var parseObject = function(item) {
  var result = {};

  _.each(item, function(value, key) {
    if (fix[key]) {
      result[key] = parseItem(fix[key](value));
    } else if (key === 'Tags') {
      result[key] = parseTags(value);
    } else {
      result[key] = parseItem(value);
    }
  });

  return result;
};

/**
 *  Parse an item - it might be an Array, an Object, or a POD.
 */
var parseItem = function(item) {
  var result;

  if (_.isArray(item)) {
    result = [];
    _.each(item, function(value) {
      result.push(parseItem(value));
    });
    return result;
  }

  /* otherwise */
  if (_.isObject(item)) {
    return parseObject(item);
  }

  /* otherwise -- just a normal (non-compound) item */
  return item;
};

/**
 *  Parses JSON that was returned from one of the Describe* AWS APIs.
 */
exports.AwsJson = function(awsJson) {
  var self = this;
  var orig = JSON.parse(JSON.stringify(awsJson));       // Deep copy
  var json = {};

  self.jsObject = function() {
    return json;
  };

  self.stringify = function() {
    return JSON.stringify(self.jsObject(), null, 2);
  };

  self.parse = function() {
    json = parseItem(orig);
  };

  self.add = function(awsJson_) {
    var newJson = parseItem(awsJson_);
    _.extend(json, newJson);
  };

  return self.parse();
};


if (__filename === process.argv[1]) {
  (function() {
    var spawn = require('child_process').spawn;

    var di     = spawn('aws', ['ec2', 'describe-instances']);
    var stdout = '';
    var stderr = '';

    di.stdout.setEncoding('utf8');
    di.stderr.setEncoding('utf8');

    di.stdout.on('data', function(chunk) {
      stdout += chunk;
    });

    di.stderr.on('data', function(chunk) {
      stderr += chunk;
    });

    di.on('exit', function(exitCode) {
      if (exitCode !== 0) {
        console.error('describe-instances failed with: '+exitCode);
        console.error(stderr);
        process.exit(exitCode);
        return;
      }

      /* otherwise */
      var aws  = JSON.parse(stdout);
      var json = new exports.AwsJson(aws);

      console.log(json.stringify());
    });
  }());
}

