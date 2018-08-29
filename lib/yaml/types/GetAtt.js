
const yaml                    = require('js-yaml');

const {
  addTo
}                             = require('./utils');

const GetAttYamlType = new yaml.Type('!GetAtt', {
  kind: 'scalar',

  // Must return true if we can handle this data
  resolve: function(data) {
    return GetAttOk(data);
  },

  construct: function(data) {
    return new GetAtt(data);
  },

  instanceOf: GetAtt,

  represent: function(getatt) {
    return `${getatt.name}::${getatt.attrName}`;
  }
});

module.exports.GetAtt       = GetAtt;
module.exports.yamlType     = GetAttYamlType;

function GetAtt(longName) {
  var self        = {};
  self.klass      = 'GetAtt';

  addTo(self, GetAttOk(longName));

  this["Fn::GetAtt"] = [self.name, ...self.rest];
}

function GetAttOk(data) {
  const parts = data.split('.');
  if (parts.length < 2)     { return false; }

  return {
    name:       parts.shift(),
    rest:       parts
  }
}
