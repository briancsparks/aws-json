
/**
 *
 */

var _             = require('underscore');
var base          = require('./cf-base');
var Base          = base.Base;

// Our lib
var internetGateway = {};

/**
 *  InternetGateway
 *
 *      "InternetGateway": {
 *        "Type": "AWS::EC2::InternetGateway",
 *        "Properties": {}
 *      },
 */
var InternetGateway = internetGateway.InternetGateway = function(name, cf) {
  var self = this;
  Base.call(this, cf, 'EC2::InternetGateway', name);
};

internetGateway.makeInternetGateway = function(name, cf) {
  return new InternetGateway(name, cf);
}

/**
 *  VpcGatewayAttachment.
 *
 *      "VGWA41MWC": {
 *        "Type": "AWS::EC2::VPCGatewayAttachment",
 *        "Properties": {
 *          "InternetGatewayId": { "Ref": "InternetGateway" },
 *          "VpcId": { "Ref": "VPC" }
 *        }
 *      },
 */
var VpcGatewayAttachment = internetGateway.VpcGatewayAttachment = function(name, cf, vpc, ig) {
  var self = this;
  Base.call(self, cf, 'EC2::VPCGatewayAttachment', name);

  self.addPropertyId('VpcId',             vpc);
  self.addPropertyId('InternetGatewayId', ig);
};

internetGateway.makeVpcGatewayAttachment = function(name, cf, vpc, ig) {
  return new VpcGatewayAttachment(name, cf, vpc, ig);
}

_.each(internetGateway, function(value, key) {
  exports[key] = value;
});



