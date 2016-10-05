
/**
 *  IAM
 */

var _             = require('underscore');
var base          = require('./cf-base');
var helpers       = require('../../helpers');
var Base          = base.Base;

var toCamelCase   = helpers.toCamelCase;
var toCapitalCase = helpers.toCapitalCase;

// Our lib
var iam = {};

// Forward declarations
var ec2InstanceProfileAssumeRolePolicy, rootPolicy;

/**
 *  An instance-profile (aka instance-role) so ec2 instances can invoke AWS services.
 */
var InstanceProfile = iam.InstanceProfile = function(namespace, service, cf, policyDocument) {
  var self = this;

  var iRoleName       = [namespace, service, 'instance-role'].join('-');
  var cfRoleName      = toCapitalCase(iRoleName);

  Base.call(this, cf, 'IAM::InstanceProfile', cfRoleName);

  var role = cf.data.Resources[cfRoleName] = iam.makeRole(cfRoleName, cf, iRoleName, ec2InstanceProfileAssumeRolePolicy, "/");

  var iPoliciesName       = [namespace, service, 'instance-policies'].join('-');
  var cfPoliciesName      = toCapitalCase(iPoliciesName);
  cf.data.Resources[cfPoliciesName] = iam.makePolicy(cfPoliciesName, cf, iPoliciesName, policyDocument || rootPolicy, role);

  self.addProperty('Path', '/');
  self.addPropertyIds('Roles', [role]);

  var profileName = cfRoleName.replace('InstanceRole', 'InstanceProfile');
  cf.data.Resources[profileName] = self;
};

iam.makeInstanceProfile = function(namespace, service, cf, policyDocument) {
  return new InstanceProfile(namespace, service, cf, policyDocument);
}

/**
 *  A role.
 */
var Role = iam.Role = function(name, cf, iRoleName, doc, path) {
  var self = this;
  Base.call(this, cf, 'IAM::Role', name);

  self.addProperty('RoleName', iRoleName);

  self.policyDocument = function(doc, path) {
    self.addProperty('AssumeRolePolicyDocument', doc);
    self.addProperty('Path', path || '/');
  };

  if (doc) {
    self.policyDocument(doc, path);
  }
};

iam.makeRole = function(name, cf, roleName, doc, path) {
  return new Role(name, cf, roleName, doc, path);
}

/**
 *  A policy.
 */
var Policy = iam.Policy = function(name, cf, policyName, policyDocument, role) {
  var self = this;
  Base.call(this, cf, 'IAM::Policy', name);

  self.addProperty('PolicyName', policyName);
  self.addProperty('PolicyDocument', policyDocument);

  self.addPropertyIds('Roles', [role]);
};

iam.makePolicy = function(name, cf, policyName, policyDocument, role) {
  return new Policy(name, cf, policyName, policyDocument, role);
}

// Create a special Role for EC2 instance-profiles
ec2InstanceProfileAssumeRolePolicy = {
  Version   : "2012-10-17",
  Statement : [{
    Effect  : "Allow",
    Principal : {
      Service : ["ec2.amazonaws.com"]
    },
    Action    : ["sts:AssumeRole"]
  }]
};

// Create a special Policy that allows everything
rootPolicy = {
  Version : "2012-10-17",
  Statement : [{
    Effect    : "Allow",
    Action    : "*",
    Resource  : "*"
  }]
};

_.each(iam, function(value, key) {
  exports[key] = value;
});





