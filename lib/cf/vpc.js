
var _                   = require('underscore');
var base                = require('./cf-base');
var route               = require('./route');
var internetGateway     = require('./internet-gateway');
var subnet              = require('./subnet');
var securityGroup       = require('./security-group');

var vpc = {};

var Vpc = vpc.Vpc = function(name, region, cf) {
  var self = this;

  base.Base.call(this, cf, 'EC2::VPC', name);

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

  self.subnet = function(name, letter) {
    cf.data.Resources[name] = subnet.makeSubnet(name, letter, cf, self, self.publicRouteTable);
    return cf.data.Resources[name];
  };

  self.securityGroup = function(name) {
    cf.data.Resources[name] = securityGroup.makeSecurityGroup(name, cf, self);
    return cf.data.Resources[name];
  };

  cf.data.Resources.InternetGateway   = self.internetGateway  = internetGateway.makeInternetGateway('InternetGateway', cf);
  cf.data.Resources.VpcGateway        = self.vpcGateway       = internetGateway.makeVpcGatewayAttachment('VpcGateway', cf, self, self.internetGateway);
  cf.data.Resources.PublicRouteTable  = self.publicRouteTable = route.makeRouteTable('PublicRouteTable', cf, self);
  cf.data.Resources.PublicRoute       = self.publicRoute      = route.makeRoute('PublicRoute', cf, self.publicRouteTable, self.internetGateway);
};

vpc.make = function(name, region, cf) {
  return new Vpc(name, region, cf);
}

_.each(vpc, function(value, key) {
  exports[key] = value;
});

