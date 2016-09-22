
var _             = require('underscore');
var base          = require('./cf-base');

var route = {};

var RouteTable = route.RouteTable = function(name, cf, vpc) {
  var self = this;

  base.Base.call(this, cf, 'EC2::RouteTable', name);
  self.addProperty('VpcId', vpc.ref());
};

route.makeRouteTable = function(name, cf, vpc) {
  return new RouteTable(name, cf, vpc);
}

var Route = route.Route = function(name, cf, routeTable, internetGateway) {
  var self = this;

  base.Base.call(this, cf, 'EC2::Route', name);
  self.addProperty('DestinationCidrBlock', '0.0.0.0/0');
  self.addProperty('RouteTableId', routeTable.ref());
  self.addProperty('GatewayId', internetGateway.ref());
};

route.makeRoute = function(name, cf, routeTable, internetGateway) {
  return new Route(name, cf, routeTable, internetGateway);
}

_.each(route, function(value, key) {
  exports[key] = value;
});


