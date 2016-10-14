
/**
 *  Routes and RouteTables.
 */

var _             = require('underscore');
var base          = require('./cf-base');
var Base          = base.Base;

// Our library
var route = {};

/**
 *  RouteTable.
 *
 *     "PublicRouteTable": {
 *       "Type": "AWS::EC2::RouteTable",
 *       "Properties": {
 *         "VpcId": { "Ref": "VPC" }
 *       },
 *       "DependsOn": []
 *     },
 */
var RouteTable = route.RouteTable = function(name, cf, vpc) {
  var self = this;
  Base.call(self, cf, 'EC2::RouteTable', name);

  self.addPropertyId('VpcId', vpc);

  // Find all of the endpoints, and add ourselves
  vpc.each('AWS::EC2::VPCEndpoint', function(service, serviceName) {
    if (_.isFunction(service.addRouteTable)) {
      service.addRouteTable(self);
    }
  });
};

route.makeRouteTable = function(name, cf, vpc) {
  return new RouteTable(name, cf, vpc);
}

/**
 *  Route.
 *
 *    "PublicRoute": {
 *      "Type": "AWS::EC2::Route",
 *      "Properties": {
 *        "DestinationCidrBlock": "0.0.0.0/0",
 *        "RouteTableId": { "Ref": "PublicRouteTable" },
 *        "GatewayId": { "Ref": "InternetGateway" }
 *      },
 *      "DependsOn": ["InternetGateway", "VGWA41MWC"]
 *    }
 *
 *    "PeeringRoute55To0": {
 *      "Type": "AWS::EC2::Route",
 *      "Properties": {
 *        "DestinationCidrBlock": "10.0.0.0/16",
 *        "RouteTableId": "rtb-12345",
 *        "VpcPeeringConnectionId": { "Ref": "vpc55And0PeeringConnection" }
 *      }
 *    }
 */
var Route = route.Route = function(name, cf, routeTable, options_ /*internetGateway, peeringConnection*/) {
  var self = this;
  Base.call(self, cf, 'EC2::Route', name);

  var options = options_ || {};

  self.addPropertyId('RouteTableId',            routeTable);
  self.addPropertyId('GatewayId',               options.internetGateway);
  self.addPropertyId('NatGatewayId',            options.natGateway);
  self.addPropertyId('VpcPeeringConnectionId',  options.peeringConnection);

  self.destinationCidrBlock = function(cidr) {
    self.addProperty('DestinationCidrBlock', cidr);
  };

  cf.data.Resources[name] = self;
};

route.makeRoute = function(name, cf, routeTable, options /*internetGateway, peeringConnection*/) {
  return new Route(name, cf, routeTable, options);
}

_.each(route, function(value, key) {
  exports[key] = value;
});


