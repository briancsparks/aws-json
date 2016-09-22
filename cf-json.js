
/**
 *
 */

var _             = require('underscore');
var vpc           = require('./lib/cf/vpc');
var subnet        = require('./lib/cf/subnet');
var helpers       = require('./helpers');

var cf            = {};

var capitalizeFirstLetter = helpers.capitalizeFirstLetter;

var CloudFormationJson = cf.CloudFormationJson = function(options_) {
  var self    = this;
  var options = options_ || {};

  options.namespace = options.namespace || 'jsaws';

  self.data = {
    AWSTemplateFormatVersion: "2010-09-09",

    Description : capitalizeFirstLetter(options.namespace+"NetApp"),
    Mappings    : {},
    Parameters  : {},
    Resources   : {},
    Outputs     : {}
  };

  self.toJson = function(a, b) {
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

    if (arguments.length === 2) {
      return JSON.stringify(result, a, b);
    }

    /* otherwise */
    return JSON.stringify(result);
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
    namespace : 'mario',
    classB    : 21
  };

  var classB = options.classB || 21;

  var cf = new CloudFormationJson(options);
  var vpc = cf.vpc();

  vpc.cidrBlock(options.classB);
  vpc.enableDnsSupport();
  vpc.enableDnsHostnames();

  var subnetA = vpc.subnet('SubnetA', 'a');

  subnetA.cidrBlock(0, 0, 20);
  subnetA.mapPublicIpOnLaunch();

  var sgWide = vpc.securityGroup('sgWide');

  sgWide.groupDescription('For wide use');
  sgWide.ingress(-1, -1, -1, '10.0.0.0/8');
  sgWide.ingress('tcp', 22, 22, '0.0.0.0/0');

  vpc.peeringConnection(0,  'vpc-523f3137', 'rtb-364fa452');
  vpc.peeringConnection(97, 'vpc-c1b4a6a5', 'rtb-d0fc77b7');

  console.log(cf.toJson(null, 2));
}

