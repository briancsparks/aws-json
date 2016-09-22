
/**
 *
 */

var _             = require('underscore');
var vpc           = require('./lib/cf/vpc');
var subnet        = require('./lib/cf/subnet');

var cf            = {};

var CloudFormationJson = cf.CloudFormationJson = function(options_) {
  var self    = this;
  var options = options_ || {};

  options.namespace = options.namespace || 'jsaws';

  self.data = {
    AWSTemplateFormatVersion: "2010-09-09",

    Description : "MarioNetApp",
    Mappings    : {},
    Parameters  : {},
    Resources   : {},
    Outputs     : {}
  };

  self.toJson = function() {
    var result = {};

    _.each(self.data, function(value, key) {
      if (!_.isObject(value)) { result[key] = value; return; }

      result[key] = {};
      _.each(value, function(cfObject, name) {
        if (cfObject.toJson) {
          result[key][name] = cfObject.toJson();
        } else {
          result[key][name] = JSON.parse(JSON.stringify(cfObject));
        }
      });
    });

    return JSON.stringify(result, null, 2);
  }

  self.vpc = function(name_, region_) {
    var name    = name_   || 'VPC';
    var region  = region_ || 'us-east-1';

    self.data.Resources[name] = vpc.make(name, region, self);
    return self.data.Resources[name];
  };
};

_.each(cf, function(value, key) {
  exports[key] = value;
});

if (process.argv[1] === __filename) {
  var options = {
    namespace : 'mario'
  };

  var cf = new CloudFormationJson(options);
  var vpc = cf.vpc();

  vpc.cidrBlock(20);
  vpc.enableDnsSupport();
  vpc.enableDnsHostnames();

  var subnetA = vpc.subnet('SubnetA', 'a');

  subnetA.cidrBlock(0, 0, 20);
  subnetA.mapPublicIpOnLaunch();

  var sgWide = vpc.securityGroup('sgWide');

  sgWide.ingress(-1, -1, -1, '10.0.0.0/8');
  sgWide.ingress('tcp', 22, 22, '0.0.0.0/0');

  console.log(cf.toJson());
}

