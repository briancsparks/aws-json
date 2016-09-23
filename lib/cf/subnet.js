
var _             = require('underscore');
var base          = require('./cf-base');

var subnet = {};

var Subnet = subnet.Subnet = function(name, letter, cf, vpc, routeTable) {
  var self = this;

  base.Base.call(this, cf, 'EC2::Subnet', name);
  self.addProperty('VpcId', vpc.ref());

  self.cidrBlock = function(o2, o3, count) {
    self.cidr = vpc.mkSubnetCidrBlock(o2, o3, count);
    return self.addProperty('CidrBlock', self.cidr);
  };

  self.cidrBlock2 = function(cidr) {
    self.cidr = vpc.mkSubnetCidrBlock2(cidr);
    return self.addProperty('CidrBlock', self.cidr);
  };

  self.mapPublicIpOnLaunch = function(value) {
    if (arguments.length === 0) { value = true; }
    return self.addProperty('MapPublicIpOnLaunch', !!value);
  };

  self.az = function(letter) {
    return self.addProperty('AvailabilityZone', vpc.az(letter));
  };

  self.az(letter);

  var assocName = name+'RouteTableAssociation';
  cf.data.Resources[assocName] = subnet.makeSubnetRouteTableAssociation(assocName, cf, self, routeTable);
};

subnet.makeSubnet = function(name, letter, cf, vpc, routeTable) {
  return new Subnet(name, letter, cf, vpc, routeTable);
}

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



