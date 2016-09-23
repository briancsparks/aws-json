
/**
 *
 */

var _             = require('underscore');
var base          = require('./cf-base');
var Base          = base.Base;

// Our lib
var endpoint = {};

var S3Endpoint = endpoint.S3Endpoint = function(name, cf, vpc, routeTables) {
  var self = this;
  Base.call(this, cf, 'EC2::VPCEndpoint', name);

  self.addPropertyId('VpcId',           vpc);
  self.addPropertyIds('RouteTableIds',  routeTables);

  self.addProperty('ServiceName',       'com.amazonaws.'+vpc.region+'.s3');
};

endpoint.makeS3Endpoint = function(name, cf, vpc, routeTables) {
  return new S3Endpoint(name, cf, vpc, routeTables);
}

_.each(endpoint, function(value, key) {
  exports[key] = value;
});




