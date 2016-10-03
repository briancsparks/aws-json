
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

    // Do a little fixup -- put endpoints last
    var saved = {};
    self.data.Resources = _.reduce(self.data.Resources, function(m, value, key) {

      if (value.data.Type === 'AWS::EC2::VPCEndpoint')      { saved[key]  = value; }
      else                                                  { m[key]      = value; }

      return m;
    }, {});

    self.data.Resources = _.reduce(saved, function(m, value, key) {
      m[key] = value;
      return m;
    }, self.data.Resources);

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
    classB    : 22
  };

  var classB          = options.classB            || 22;
  var numBitsPublic   = options.num_bits_public   || 24;
  var numBitsPrivate  = options.num_bits_private  || 20;
  var numBitsPrivate2 = options.num_bits_private2 || 23;

  var cidrBlock       = '10.999.0.0/16'.replace('999', classB);

  var cf              = new CloudFormationJson(options);
  var vpc             = cf.vpc();

  vpc.cidrBlock(cidrBlock);
  vpc.enableDnsSupport();
  vpc.enableDnsHostnames();

  vpc.s3Endpoint();

  // Public subnet 'A'
  var subnetPublicA = vpc.publicSubnet('SubnetPublicA', 'a');

  cidrBlock = cidrBlock.replace(/\/[0-9]+$/g, '/'+numBitsPublic);
  subnetPublicA.cidrBlock(cidrBlock);
  subnetPublicA.mapPublicIpOnLaunch();

  var subnetPrivateA = vpc.privateSubnet('subnetPrivateA', 'a');

  cidrBlock = helpers.nextCidrBlockOfSize(cidrBlock, numBitsPrivate);
  subnetPrivateA.cidrBlock(cidrBlock);
  subnetPrivateA.mapPublicIpOnLaunch(false);

  var subnetPrivateA2 = vpc.privateSubnet('subnetPrivateA2', 'a');

  cidrBlock = helpers.nextCidrBlockOfSize(cidrBlock, numBitsPrivate2);
  subnetPrivateA2.cidrBlock(cidrBlock);
  subnetPrivateA2.mapPublicIpOnLaunch(false);

  var sgWide = vpc.securityGroup('sgWide');

  sgWide.groupDescription('For wide use');
  sgWide.ingress(-1, -1, -1, '10.0.0.0/8');
  sgWide.ingress('tcp', 22, 22, '0.0.0.0/0');

  vpc.peeringConnection(0,  'vpc-523f3137', 'rtb-364fa452');
  vpc.peeringConnection(97, 'vpc-c1b4a6a5', 'rtb-d0fc77b7');

  console.log(cf.toJson(null, 2));
}

