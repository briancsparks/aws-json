
var _             = require('underscore');
var base          = require('./cf-base');

var internetGateway = {};

var InternetGateway = internetGateway.InternetGateway = function(name, cf) {
  var self = this;

  base.Base.call(this, cf, 'EC2::InternetGateway', name);
};

internetGateway.makeInternetGateway = function(name, cf) {
  return new InternetGateway(name, cf);
}

var VpcGatewayAttachment = internetGateway.VpcGatewayAttachment = function(name, cf, vpc, ig) {
  var self = this;

  base.Base.call(this, cf, 'EC2::VPCGatewayAttachment', name);

  self.addProperty('VpcId', vpc.ref());
  self.addProperty('InternetGatewayId', ig.ref());
};

internetGateway.makeVpcGatewayAttachment = function(name, cf, vpc, ig) {
  return new VpcGatewayAttachment(name, cf, vpc, ig);
}

_.each(internetGateway, function(value, key) {
  exports[key] = value;
});



