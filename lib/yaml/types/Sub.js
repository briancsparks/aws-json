
// See https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html

//
//
//
//  !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello/"
//
//  !Sub
//    - www.${fqdn}
//    - { fqdn: 'booya.net' }
//

const yaml                    = require('js-yaml');

const {
  addTo
}                             = require('./utils');

const SubYamlType = new yaml.Type('!Sub', {
  kind: 'scalar',

  // Must return true if we can handle this data
  resolve: function(data) {
    return SubOk(data);
  },

  construct: function(data) {
    return new Sub(data);
  },

  instanceOf: Sub,

  represent: function(sub) {
    return `${sub.string}`;
  }
});


module.exports.Sub          = Sub;
module.exports.yamlType     = SubYamlType;

function Sub(str) {
  var self        = {};
  self.klass      = 'Sub';

  addTo(self, SubOk(str));

  this["Fn::Sub"] = str;
}

function SubOk(str) {
  const match = str.match(/([$][{]([^}]+)[}])/);
  if (!match)     { return false; }

  return {
    string:     str,
    vars:       [match[2]]
  }
}
