
var _                   = require('underscore');
var base                = require('./cf-base');
var route               = require('./route');
var internetGateway     = require('./internet-gateway');
var subnet              = require('./subnet');
var securityGroup       = require('./security-group');
var peeringConnection   = require('./peering-connection');
var Base                = base.Base;

var vpc = {};

var Vpc = vpc.Vpc = function(name, region, cf) {
  var self = this;
  Base.call(self, cf, 'EC2::VPC', name);

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

  self.mkSubnetCidrBlock = function(o2, o3, count) {
    var parts     = self.cidr.split('/');
    var ip        = parts[0];
    var bits      = parts[1];
    var octets    = ip.split('.');

    return [octets[0], octets[1], o2, o3].join('.') + '/' + count;
  };

  self.az = function(letter) {
    return region + letter;
  };

  self.internetGateway  = cf.data.Resources.InternetGateway   = internetGateway.makeInternetGateway('InternetGateway', cf);
  self.vpcGateway       = cf.data.Resources.VpcGateway        = internetGateway.makeVpcGatewayAttachment('VpcGateway', cf, self, self.internetGateway);
  self.publicRouteTable = cf.data.Resources.PublicRouteTable  = route.makeRouteTable('PublicRouteTable', cf, self);
  self.publicRoute      = cf.data.Resources.PublicRoute       = route.makeRoute('PublicRoute', cf, self.publicRouteTable, self.internetGateway);

  self.publicRoute.destinationCidrBlock('0.0.0.0/0');

  self.subnet = function(name, letter) {
    cf.data.Resources[name] = subnet.makeSubnet(name, letter, cf, self, self.publicRouteTable);
    return cf.data.Resources[name];
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
    var name  = 'PeeringRoute'+self.classB+'To'+peerClassB;
    var peer  = cf.data.Resources[name] = route.makeRoute(name, cf, self.publicRouteTable, null, theConnection);

    peer.destinationCidrBlock([10, peerClassB, 0, '0/16'].join('.'));

    // PeeringRoute0To55
    name  = 'PeeringRoute'+peerClassB+'To'+self.classB;
    peer  = cf.data.Resources[name] = route.makeRoute(name, cf, peerRouteTableId, null, theConnection);

    peer.destinationCidrBlock([10, self.classB, 0, '0/16'].join('.'));

    return cf.data.Resources[name];
  };
};

vpc.make = function(name, region, cf) {
  return new Vpc(name, region, cf);
}

_.each(vpc, function(value, key) {
  exports[key] = value;
});

