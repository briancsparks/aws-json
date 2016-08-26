
var _         = require('underscore');

exports.parse = {};

var parseTags = exports.parse.tags = function(tags) {
  return _.reduce(tags, function(m, tag) {
    if (!tag.Key || !tag.Value) { return m; }

    m[tag.Key] = tag.Value;
    m[tag.Key.replace(/[^a-zA-Z_0-9]+/g, '_')] = tag.Value;

    return m;
  }, {});
};

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

var fix = {};

var mkReservations = function() {
  return function(arr) {
    return objectFromAwsArray(arr, 'ReservationId');
  };
};

var mkFixer = function(keyName) {
  return function(arr) {
    return objectFromAwsArray(arr, keyName);
  };
};

fix.Reservations        = mkReservations();
fix.Instances           = mkFixer('InstanceId');
fix.SecurityGroups      = mkFixer('GroupName');
fix.Groups              = mkFixer('GroupName');
fix.NetworkInterfaces   = mkFixer('NetworkInterfaceId');

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

exports.AwsJson = function(awsJson) {
  var self = this;
  var orig = JSON.parse(JSON.stringify(awsJson));       // Deep copy
  var json = {};

  self.jsObject = function() {
    return json;
  };

  self.stringify = function() {
    return JSON.stringify(self.jsObject());
  };

  self.parse = function() {
    json = parseItem(orig);
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

