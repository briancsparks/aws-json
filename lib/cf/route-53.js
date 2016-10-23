
/**
 *
 */

var _             = require('underscore');
var base          = require('./cf-base');
var Base          = base.Base;

// Our lib
var route53 = {};

/**
 *  RecordSetGroup
 *
 */
var RecordSetGroup = route53.RecordSetGroup = function(name, cf, hostedZone, comment) {
  var self = this;
  Base.call(this, cf, 'Route53::RecordSetGroup', name);

  if (hostedZone.indexOf('.') !== -1)   { self.addProperty2('HostedZoneName', hostedZone+'.'); }
  else                                  { self.addProperty2('HostedZoneId', hostedZone); }

  self.addProperty2('Comment', comment);

  self.addRecordSets = self.addRecordSet = function(recordSets) {
    if ('rs' in recordSets) { return self.addRecordSets(recordSets.rs); }

    return self.addProperties('RecordSets', recordSets);
  };

  cf.data.Resources[name] = self;
};

route53.makeRecordSetGroup = function(name, cf, hostedZone, comment) {
  return new RecordSetGroup(name, cf, hostedZone, comment);
}

route53.RecordSet = function(name, options) {
  var self    = this;
  self.rs     = {};

  var resourceRecord;

  // Guess if A or CNAME
  if ('A' in options) {
    self.rs.Type    = 'A';
    resourceRecord  = options.A;
    delete options.A;
  } else if ('CNAME' in options) {
    self.rs.Type    = 'CNAME';
    resourceRecord  = options.CNAME;
    delete options.CNAME;
  }

  if (_.isObject(resourceRecord) && resourceRecord.ref && _.isFunction(resourceRecord.ref)) {
    resourceRecord = resourceRecord.ref();
  }

  self.rs.Name              = name;
  self.rs.TTL               = 900;
  self.rs.ResourceRecords   = [resourceRecord];

};

_.each(route53, function(value, key) {
  exports[key] = value;
});






