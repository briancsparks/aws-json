
/**
 *
 */

var _             = require('underscore');
var base          = require('./cf-base');
var Base          = base.Base;

// Our lib
var natGateway = {};

/**
 *  NatGateway
 *
 *      "NatGateway": {
 *        "Type": "AWS::EC2::NatGateway",
 *        "Properties": {}
 *      },
 */
var NatGateway = natGateway.NatGateway = function(name, cf, subnet, eip) {
  var self = this;
  Base.call(this, cf, 'EC2::NatGateway', name);

  self.addDependsOn('VpcGateway');
  self.addPropertyId('SubnetId', subnet);
  self.addProperty('AllocationId', {"Fn::GetAtt": [eip.name, "AllocationId"]});
};

natGateway.makeNatGateway = function(name, cf, subnet, eip) {
  return new NatGateway(name, cf, subnet, eip);
}

_.each(natGateway, function(value, key) {
  exports[key] = value;
});




