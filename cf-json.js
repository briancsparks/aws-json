
/**
 *
 */

var _             = require('underscore');
var vpc           = require('./lib/cf/vpc');
var helpers       = require('./helpers');
var libIam        = require('./lib/cf/iam');
var subnet        = require('./lib/cf/subnet');
var libSimpleDb   = require('./lib/cf/simple-db');
var libSns        = require('./lib/cf/topic');
var libSqs        = require('./lib/cf/queue');

var libCf         = {};

var toCapitalCase = helpers.toCapitalCase;
var capitalizeFirstLetter = helpers.capitalizeFirstLetter;

var CloudFormationJson = libCf.CloudFormationJson = function(options_) {
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

    var localVpc = vpc.make(name, region, self);
    localVpc.initialize();
    return localVpc;
  };

  self.iam          = function() { return libIam; };
  self.simpleDb     = function() { return libSimpleDb; };
  self.sns          = function() { return libSns; };
  self.sqs          = function() { return libSqs; };
};

libCf.testIam = function(argv, context, callback) {

  var cf              = new CloudFormationJson(argv);
  var iam             = cf.iam();

  var namespace       = argv.namespace;
  var service         = argv.service;

  var iRoleName       = [namespace, service, 'instance-role'].join('-');
  var cfRoleName      = toCapitalCase(iRoleName);

  iam.makeInstanceProfile(namespace, service, cf);

  console.log(cf.toJson(null, 2));
};

libCf.testSimpleDb = function(argv, context, callback) {

  var cf              = new CloudFormationJson(argv);
  var simpleDb        = cf.simpleDb();

  var name            = argv.name;
  var description     = argv.description;

  simpleDb.makeSimpleDb(name, cf, description);
  console.log(cf.toJson(null, 2));
};

libCf.testSns = function(argv, context, callback) {

  var cf              = new CloudFormationJson(argv);
  var sns             = cf.sns();

  var name            = argv.name;
  var displayName     = argv.displayName;

  var topic           = sns.makeTopic(name, cf, displayName);
  var policy          = sns.makeTopicPolicy(name+'Policy', cf, topic, {policy: 'document'});

  topic.addSubscription('protocol', 'endpopint');

  console.log(cf.toJson(null, 2));
};

libCf.testSqs = function(argv, context, callback) {

  var cf              = new CloudFormationJson(argv);
  var sqs             = cf.sqs();

  var name            = argv.name;

  var queue           = sqs.makeQueue(name, cf);
  var policy          = sqs.makeQueuePolicy(name+'Policy', cf, queue, {policy: 'document'});

  console.log(cf.toJson(null, 2));
};

libCf.main = function(argv, context, callback) {

  var i, letter;

  var region          = argv.region             || argv.r                 || 'us-east-1';
  var cidrBlock       = argv.cidr_block         || argv.cidr              || '10.199.0.0/16';
  var numBitsPublic   = argv.num_bits_public    || argv.public_size       || 24;
  var numBitsPrivate  = argv.num_bits_private   || argv.private_size      || 20;
  var numBitsPrivate2 = argv.num_bits_private2  || argv.private2_size     || 23;
  var numAzs          = argv.num_azs            || argv.num_az            || 4;
  var numSubnetsPerAz = argv.num_subnets_per_az || argv.num_subnets       || 3;

  if (argv.classb && !(argv.cidr_block || argv.cidr)) {
    cidrBlock         = '10.999.0.0/16'.replace('999', argv.classb);
  }

  var cf              = new CloudFormationJson(argv);
  var vpc             = cf.vpc();

  vpc.cidrBlock(cidrBlock);
  vpc.enableDnsSupport();
  vpc.enableDnsHostnames();

  vpc.s3Endpoint();

  cidrBlock = cidrBlock.replace(/\/[0-9]+$/g, '/'+numBitsPublic);

  // Create the public subnets
  var letters = zoneLettersPerRegion(region);
  for (i = 0; i < numAzs && letters.length > 0; i += 1) {

    // Public subnet
    letter = letters.shift();

    var subnetPublic = vpc.publicSubnet('SubnetPublic'+letter.toUpperCase(), letter);

    subnetPublic.cidrBlock(cidrBlock);
    subnetPublic.mapPublicIpOnLaunch();

    // If we have more public subnets to create, bump the cidr
    if (i < numAzs && letters.length > 0) {
      cidrBlock = helpers.nextCidrBlockOfSize(cidrBlock, numBitsPublic);
    }
  }

  // Create the first private subnet
  if (numSubnetsPerAz > 1) {
    letters = zoneLettersPerRegion(region);
    for (i = 0; i < numAzs && letters.length > 0; i += 1) {

      // Public subnet
      letter = letters.shift();

      // Private subnet one
      var subnetPrivate = vpc.privateSubnet('SubnetPrivate'+letter.toUpperCase(), letter);

      cidrBlock   = helpers.nextCidrBlockOfSize(cidrBlock, numBitsPrivate);
      subnetPrivate.cidrBlock(cidrBlock);
      subnetPrivate.mapPublicIpOnLaunch(false);
    }
  }

  // Create the second private subnet
  if (numSubnetsPerAz > 2) {
    letters = zoneLettersPerRegion(region);
    for (i = 0; i < numAzs && letters.length > 0; i += 1) {

      // Public subnet
      letter = letters.shift();

      // Private subnet two
      var subnetPrivate2 = vpc.privateSubnet('SubnetPrivate'+letter.toUpperCase()+'2', letter);

      cidrBlock   = helpers.nextCidrBlockOfSize(cidrBlock, numBitsPrivate2);
      subnetPrivate2.cidrBlock(cidrBlock);
      subnetPrivate2.mapPublicIpOnLaunch(false);
    }
  }

  var sgWide = vpc.securityGroup('sgWide');

  sgWide.groupDescription('For wide use');
  sgWide.ingress(-1, -1, -1, '10.0.0.0/8');
  sgWide.ingress('tcp', 22, 22, '0.0.0.0/0');

  vpc.peeringConnection(0,  'vpc-00000000', 'rtb-00000000');
  vpc.peeringConnection(97, 'vpc-97979797', 'rtb-97979797');

  console.log(cf.toJson(null, 2));
};

_.each(libCf, function(value, key) {
  exports[key] = value;
});

function zoneLettersPerRegion(region) {

  if (region === "ap-south-1")             { return ['a', 'b']; }
  if (region === "eu-west-1")              { return ['a', 'b', 'c']; }
  if (region === "ap-southeast-1")         { return ['a', 'b']; }
  if (region === "ap-southeast-2")         { return ['a', 'b', 'c']; }
  if (region === "eu-central-1")           { return ['a', 'b']; }
  if (region === "ap-northeast-2")         { return ['a', 'c']; }
  if (region === "ap-northeast-1")         { return ['a', 'c']; }
  if (region === "us-east-1")              { return ['a', 'b', 'd', 'e']; }
  if (region === "sa-east-1")              { return ['a', 'b', 'c']; }
  if (region === "us-west-1")              { return ['a', 'b']; }
  if (region === "us-west-2")              { return ['a', 'b', 'c']; }

  // Unknown region. Most have a and b
  return ['a', 'b'];
}

