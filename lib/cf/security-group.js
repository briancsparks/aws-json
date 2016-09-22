
var _             = require('underscore');
var base          = require('./cf-base');

var securityGroup = {};

var SecurityGroup = securityGroup.SecurityGroup = function(name, cf, vpc) {
  var self = this;

  base.Base.call(this, cf, 'EC2::SecurityGroup', name);
  self.addProperty('VpcId', vpc.ref());

  self.groupDescription = function(description) {
    return self.addProperty('GroupDescription', description);
  };

  self.ingress = function(proto, from, to, cidr) {
    var propName = "SecurityGroupIngress";
    self.data.Properties[propName] = self.data.Properties[propName] || [];
    self.data.Properties[propName].push({
      IpProtocol  : proto,
      FromPort    : from,
      ToPort      : to,
      CidrIp      : cidr
    });
  };
};

securityGroup.makeSecurityGroup = function(name, cf, vpc) {
  return new SecurityGroup(name, cf, vpc);
}

_.each(securityGroup, function(value, key) {
  exports[key] = value;
});




