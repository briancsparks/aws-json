
import test         from 'ava';
var    _          = require('underscore');
var    awsJson    = require('../aws-json');

var    AwsJson    = awsJson.AwsJson;

test('AwsJson holds multiple', function(t) {
  var awsSG = {"SecurityGroups": [
    { "GroupName": "SecurityGroupDevOps",   "GroupId": "sg-01111112" },
    { "GroupName": "SecurityGroupAdmin",    "GroupId": "sg-02222223" },
    { "GroupName": "SecurityGroupTools",    "GroupId": "sg-03333334" },
    { "GroupName": "SecurityGroupWebTier",  "GroupId": "sg-04444445" }
  ]};

  var awsBDM = {"BlockDeviceMappings": [
    {
      "DeviceName": "/dev/sda1",
      "Ebs": {
        "Status": "attached",
        "DeleteOnTermination": true,
        "VolumeId": "vol-12345678",
        "AttachTime": "2015-06-08T16:55:48.000Z"
      }
    }
  ]};

  var awsJson = new AwsJson(awsBDM);
  awsJson.add(awsSG);

  t.deepEqual(JSON.parse(awsJson.stringify()), {
    BlockDeviceMappings: {
      "/dev/sda1": {
        "DeviceName": "/dev/sda1",
        "Ebs": {
          "Status": "attached",
          "DeleteOnTermination": true,
          "VolumeId": "vol-12345678",
          "AttachTime": "2015-06-08T16:55:48.000Z"
        }
      }
    },
    SecurityGroups: {
      SecurityGroupDevOps   : { "GroupName": "SecurityGroupDevOps",   "GroupId": "sg-01111112" },
      SecurityGroupAdmin    : { "GroupName": "SecurityGroupAdmin",    "GroupId": "sg-02222223" },
      SecurityGroupTools    : { "GroupName": "SecurityGroupTools",    "GroupId": "sg-03333334" },
      SecurityGroupWebTier  : { "GroupName": "SecurityGroupWebTier",  "GroupId": "sg-04444445" }
    }
  });
});



