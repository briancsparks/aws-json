
var _             = require('underscore');
var base          = require('./cf-base');

var peeringConnection = {};

var PeeringConnection = peeringConnection.PeeringConnection = function(name, cf, vpc, peerVpcId) {
  var self = this;

  base.Base.call(this, cf, 'EC2::VPCPeeringConnection', name);

  self.addPropertyId('VpcId', vpc);
  self.addPropertyId('PeerVpcId', peerVpcId);

  cf.data.Resources[name] = self;
};

peeringConnection.makePeeringConnection = function(name, cf, vpc, peerVpcId) {
  return new PeeringConnection(name, cf, vpc, peerVpcId);
}

_.each(peeringConnection, function(value, key) {
  exports[key] = value;
});



