
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

  self.addProperty('VpcId', vpc.ref());
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
var Route = route.Route = function(name, cf, routeTable, internetGateway, peeringConnection) {
  var self = this;
  Base.call(self, cf, 'EC2::Route', name);

  self.addPropertyId('RouteTableId', routeTable);
  self.addPropertyId('GatewayId', internetGateway);
  self.addPropertyId('VpcPeeringConnectionId', peeringConnection);

  self.destinationCidrBlock = function(cidr) {
    self.addProperty('DestinationCidrBlock', cidr);
  };

};

route.makeRoute = function(name, cf, routeTable, internetGateway, peeringConnectionId) {
  return new Route(name, cf, routeTable, internetGateway, peeringConnectionId);
}

_.each(route, function(value, key) {
  exports[key] = value;
});


