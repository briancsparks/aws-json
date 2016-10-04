
var _             = require('underscore');
var base          = require('./cf-base');
var route         = require('./route');
var eip           = require('./eip');
var natGateway    = require('./nat-gateway');

var subnet = {};

/**
 *  Base for subnet class.
 */
var BaseSubnet = function(name, zoneLetter, cf, vpc, routeTable) {
  var self = this;

  self.isPublic         = false;

  base.Base.call(this, cf, 'EC2::Subnet', name);
  self.addProperty('VpcId', vpc.ref());

  self.zone = self.addProperty('AvailabilityZone', vpc.az(zoneLetter));

  self.cidrBlock = function(cidr) {
    self.cidr = vpc.mkSubnetCidrBlock(cidr);
    return self.addProperty('CidrBlock', self.cidr);
  };

  self.mapPublicIpOnLaunch = function(value) {
    if (arguments.length === 0) { value = true; }
    return self.addProperty('MapPublicIpOnLaunch', !!value);
  };

  var assocName = name+'RouteTableAssociation';
  cf.data.Resources[assocName] = subnet.makeSubnetRouteTableAssociation(assocName, cf, self, routeTable);
};

/**
 *  PublicSubnet
 */
var PublicSubnet = subnet.PublicSubnet = function(name, zoneLetter, cf, vpc) {
  var self = this;

  if (!vpc.publicRouteTable) {
    vpc.publicRouteTable = cf.data.Resources.PublicRouteTable       = route.makeRouteTable('PublicRouteTable', cf, vpc);

    self.isPublic         = true;
    vpc.publicRoute       = cf.data.Resources.PublicRoute           = route.makeRoute('PublicRoute', cf, vpc.publicRouteTable, {internetGateway: vpc.internetGateway});
    vpc.publicRoute.destinationCidrBlock('0.0.0.0/0');
  }

  BaseSubnet.call(this, name, zoneLetter, cf, vpc, vpc.publicRouteTable);

  self.ensureNatGateway = function() {
    var publicName  = name;
    var natEip      = cf.data.Resources[publicName+'NatEip']       = eip.makeEip(publicName+'NatEip', cf);
    var natGw       = cf.data.Resources[publicName+'NatGateway']   = natGateway.makeNatGateway(publicName+'NatGateway', cf, self, natEip);
//    var natRoute    = cf.data.Resources[publicName+'NatRoute']     = route.makeRoute(publicName+'natRoute', cf, vpc.publicRouteTable, {natGateway: natGw});

//    natRoute.destinationCidrBlock('0.0.0.0/0');
    self.natGateway = natGw;
  };
};

subnet.makePublicSubnet = function(name, zoneLetter, cf, vpc) {
  return new PublicSubnet(name, zoneLetter, cf, vpc);
};

/**
 *  PrivateSubnet
 */
var PrivateSubnet = subnet.PrivateSubnet = function(name, zoneLetter, cf, vpc) {
  var self = this;

  // If our associated public subnet needs a NAT, do it
  var publicSubnet = vpc.findPublicSubnet(vpc.az(zoneLetter));
  if (!publicSubnet) {
    console.error("Must create a public subnet in the right zone before creating private subnets.");
    return;
  }

  /* otherwise */
  publicSubnet.ensureNatGateway();

  var rtName                = name+'RouteTable';
  var routeName             = name+'PublicRoute';
  self.routeTable           = cf.data.Resources[rtName]       = route.makeRouteTable(rtName, cf, vpc);
  self.publicRoute          = cf.data.Resources[routeName]    = route.makeRoute(routeName, cf, self.routeTable, {natGateway: publicSubnet.natGateway});

  BaseSubnet.call(this, name, zoneLetter, cf, vpc, self.routeTable);
  self.publicRoute.destinationCidrBlock('0.0.0.0/0');
};

subnet.makePrivateSubnet = function(name, zoneLetter, cf, vpc) {
  return new PrivateSubnet(name, zoneLetter, cf, vpc);
};

var SubnetRouteTableAssociation = subnet.SubnetRouteTableAssociation = function(name, cf, subnet, routeTable) {
  var self = this;

  base.Base.call(this, cf, 'EC2::SubnetRouteTableAssociation', name);
  self.addProperty('SubnetId', subnet.ref());
  self.addProperty('RouteTableId', routeTable.ref());
};

subnet.makeSubnetRouteTableAssociation = function(name, cf, subnet, routeTable) {
  return new SubnetRouteTableAssociation(name, cf, subnet, routeTable);
}

_.each(subnet, function(value, key) {
  exports[key] = value;
});



