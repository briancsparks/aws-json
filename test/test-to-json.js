
import test         from 'ava';
var    _          = require('underscore');
var    awsJson    = require('../aws-json');




test('parse.tags Tag', function(t) {
  var aws = {"Tags":[
    { "Key":"key", "Value": "value" }
  ]};

  t.deepEqual(awsJson.parse.tags(aws.Tags), {key:"value"});
});

test('parse.tags 2 Tags', function(t) {
  var aws = {"Tags":[
    { "Key":"key", "Value": "value" },
    { "Key":"key2", "Value": "value2" }
  ]};

  t.deepEqual(awsJson.parse.tags(aws.Tags), {key:"value", key2:"value2"});
});

test('parse.tags is tolerant of non-tags', function(t) {
  var aws = {"Tags":[
    { "Key":"key", "Value": "value" },
    { "Foo":"bar" }
  ]};

  t.deepEqual(awsJson.parse.tags(aws.Tags), {key:"value"});
});

test('parse.tags empty', function(t) {
  var aws = {"Tags":[]};

  t.deepEqual(awsJson.parse.tags(aws.Tags), {});
});

test('parse.tags is tolerant of non-array', function(t) {
  var aws = {"Tags":{}};

  t.deepEqual(awsJson.parse.tags(aws.Tags), {});
});

//  var aws = {"SecurityGroups": [
//    { "GroupName": "SecurityGroupDevOps",   "GroupId": "sg-01111112" },
//    { "GroupName": "SecurityGroupAdmin",    "GroupId": "sg-02222223" },
//    { "GroupName": "SecurityGroupTools",    "GroupId": "sg-03333334" },
//    { "GroupName": "SecurityGroupWebTier",  "GroupId": "sg-04444445" }
//  ]};

test('objectFromAwsArray works', function(t) {
  var aws = {"SecurityGroups": [
    { "GroupName": "SecurityGroupWebTier",  "GroupId": "sg-04444445" }
  ]};

  t.deepEqual(awsJson.parse.objectFromAwsArray(aws.SecurityGroups, 'GroupName'), {
    SecurityGroupWebTier: {
      GroupName : "SecurityGroupWebTier",
      GroupId   : "sg-04444445"
    }
  });
});

test('objectFromAwsArray works multiple', function(t) {
  var aws = {"SecurityGroups": [
    { "GroupName": "SecurityGroupDevOps",   "GroupId": "sg-01111112" },
    { "GroupName": "SecurityGroupAdmin",    "GroupId": "sg-02222223" },
    { "GroupName": "SecurityGroupTools",    "GroupId": "sg-03333334" },
    { "GroupName": "SecurityGroupWebTier",  "GroupId": "sg-04444445" }
  ]};

  t.deepEqual(awsJson.parse.objectFromAwsArray(aws.SecurityGroups, 'GroupName'), {
    SecurityGroupDevOps   : { "GroupName": "SecurityGroupDevOps",   "GroupId": "sg-01111112" },
    SecurityGroupAdmin    : { "GroupName": "SecurityGroupAdmin",    "GroupId": "sg-02222223" },
    SecurityGroupTools    : { "GroupName": "SecurityGroupTools",    "GroupId": "sg-03333334" },
    SecurityGroupWebTier  : { "GroupName": "SecurityGroupWebTier",  "GroupId": "sg-04444445" }
  });
});

test(function(t) {
  var aws = {"SecurityGroups": [
    { "GroupName": "SecurityGroupTools",    "GroupId": "sg-03333334" },
    { "XXoupName": "SecurityGroupWebTier",  "GroupId": "sg-04444445" }
  ]};

  t.deepEqual(awsJson.parse.objectFromAwsArray(aws.SecurityGroups, 'GroupName'), {
    SecurityGroupTools    : { "GroupName": "SecurityGroupTools",    "GroupId": "sg-03333334" }
  });
});

test('objectFromAwsArray handles wrong type', function(t) {
  var aws = {"SecurityGroups": [
    { "XroupName": "SecurityGroupDevOps",   "GroupId": "sg-01111112" },
    { "XroupName": "SecurityGroupAdmin",    "GroupId": "sg-02222223" },
    { "XroupName": "SecurityGroupTools",    "GroupId": "sg-03333334" },
    { "XroupName": "SecurityGroupWebTier",  "GroupId": "sg-04444445" }
  ]};

  t.deepEqual(awsJson.parse.objectFromAwsArray(aws.SecurityGroups, 'GroupName'), aws.SecurityGroups);
});

