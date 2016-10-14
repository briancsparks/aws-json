
var _                   = require('underscore');
var base                = require('./cf-base');
var route               = require('./route');
var internetGateway     = require('./internet-gateway');
var natGateway          = require('./nat-gateway');
var eip                 = require('./eip');
var subnet              = require('./subnet');
var securityGroup       = require('./security-group');
var peeringConnection   = require('./peering-connection');
var endpoint            = require('./endpoint-to-s3');
var Base                = base.Base;

var vpc = {};

var Vpc = vpc.Vpc = function(name, region, cf) {
  var self = this;
  Base.call(self, cf, 'EC2::VPC', name);

  self.region         = region;
  self.publicSubnets  = {};

  self.enableDnsSupport = function(value) {
    if (arguments.length === 0) { value = true; }
    return self.addProperty('EnableDnsSupport', !!value);
  };

  self.enableDnsHostnames = function(value) {
    if (arguments.length === 0) { value = true; }
    return self.addProperty('EnableDnsHostnames', !!value);
  };

  self.cidrBlock = function(cidr) {
    if (_.isNumber(cidr)) { cidr = [10, cidr, 0, '0/16'].join('.'); }
    self.cidr = cidr;
    self.classB = self.cidr.split('.')[1];
    return self.addProperty('CidrBlock', self.cidr);
  };

  self.mkSubnetCidrBlock = function(cidr) {
    var octets       = (self.cidr || '').split(/[^0-9]/);
    var subnetOctets = (cidr || '').split(/[^0-9]/);

    if (octets.length < 5 || subnetOctets.length < 5) {
      console.error(cidr+' is not a cidr block');
      return;
    }

    return [octets[0], octets[1], subnetOctets[2], subnetOctets[3]].join('.')+'/'+subnetOctets[4];
  };

  self.az = function(letter) {
    return region + letter;
  };

  self.initialize = function() {
    self.internetGateway  = cf.data.Resources.InternetGateway   = internetGateway.makeInternetGateway('InternetGateway', cf);
    self.vpcGateway       = cf.data.Resources.VpcGateway        = internetGateway.makeVpcGatewayAttachment('VpcGateway', cf, self, self.internetGateway);
  };

  self.publicSubnet = function(name, zoneLetter) {

    var zone = self.az(zoneLetter);
    self.publicSubnets[zone] = cf.data.Resources[name]        = subnet.makePublicSubnet(name, zoneLetter, cf, self);

    return cf.data.Resources[name];
  };

  self.privateSubnet = function(name, zoneLetter, options) {
    cf.data.Resources[name]                                   = subnet.makePrivateSubnet(name, zoneLetter, cf, self, options);
    return cf.data.Resources[name];
  };

  self.findPublicSubnet = function(zone) {
    return self.publicSubnets[zone];
  };

  self.securityGroup = function(name) {
    cf.data.Resources[name] = securityGroup.makeSecurityGroup(name, cf, self);
    return cf.data.Resources[name];
  };

  self.peeringConnection = function(peerClassB, peerVpcId, peerRouteTableId) {
    // vpc55And0PeeringConnection
    var peeringName     = 'vpc'+self.classB+'And'+peerClassB+'PeeringConnection';
    var theConnection   = cf.data.Resources[peeringName] = peeringConnection.makePeeringConnection(peeringName, cf, self, peerVpcId);

    // PeeringRoute55To0
    var publicSubnet = self.findPublicSubnet(self.az('a'));
    var name  = 'PeeringRoute'+self.classB+'To'+peerClassB;
    var peer  = cf.data.Resources[name] = route.makeRoute(name, cf, self.publicRouteTable, {peeringConnection: theConnection});

    peer.destinationCidrBlock([10, peerClassB, 0, '0/16'].join('.'));

    // PeeringRoute0To55
    name  = 'PeeringRoute'+peerClassB+'To'+self.classB;
    peer  = cf.data.Resources[name] = route.makeRoute(name, cf, peerRouteTableId, {peeringConnection: theConnection});

    peer.destinationCidrBlock([10, self.classB, 0, '0/16'].join('.'));

    return theConnection;
  };

  self.peerRoute = function(name, routeTableId, peeringConnection, cidrBlock) {
    var peering = cf.data.Resources[name] = route.makeRoute(name, cf, routeTableId, {peeringConnection: peeringConnection});

    peering.destinationCidrBlock(cidrBlock);

    return peering;
  };

  self.s3Endpoint = function(routeTables) {
    return endpoint.makeS3Endpoint("S3Endpoint", cf, self, routeTables);
  };

  self.each = function(serviceName, callback) {
    _.each(cf.data.Resources, function(resource, name) {
      //console.error(name, resource.data.Type);
      if (resource.data.Type === serviceName) {
        return callback(resource, name);
      }
    });
  };

  cf.data.Resources[name] = self;

  self.output("VPC", self, "The VPC Id");
  self.output("VpcCidrBlock", self.getAtt("CidrBlock"), "The VPC CIDR block");
};

vpc.make = function(name, region, cf) {
  return new Vpc(name, region, cf);
}

_.each(vpc, function(value, key) {
  exports[key] = value;
});

