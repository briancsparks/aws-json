
/**
 *
 */

var _             = require('underscore');
var base          = require('./cf-base');
var Base          = base.Base;

// Our lib
var eip = {};

/**
 *  Eip
 *
 *      "Eip": {
 *        "Type": "AWS::EC2::EIP",
 *        "Properties": {}
 *      },
 */
var Eip = eip.Eip = function(name, cf) {
  var self = this;
  Base.call(this, cf, 'EC2::EIP', name);

  self.addProperty('Domain', 'vpc');
  self.addDependsOn("VPCGatewayAttachment");
};

eip.makeEip = function(name, cf) {
  return new Eip(name, cf);
}

_.each(eip, function(value, key) {
  exports[key] = value;
});




