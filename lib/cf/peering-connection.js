
var _             = require('underscore');
var base          = require('./cf-base');

var peeringConnection = {};

var PeeringConnection = peeringConnection.PeeringConnection = function(name, cf, vpc, peerId) {
  var self = this;

  base.Base.call(this, cf, 'EC2::VPCPeeringConnection', name);

  self.addProperty('VpcId', vpc.ref());
  self.addProperty('PeerVpcId', peerId);
};

peeringConnection.makePeeringConnection = function(name, cf, vpc, peerId) {
  return new PeeringConnection(name, cf, vpc, peerId);
}

_.each(peeringConnection, function(value, key) {
  exports[key] = value;
});



