
const yaml                    = require('js-yaml');

const GetAtt                  = require('./types/GetAtt');
const Sub                     = require('./types/Sub');

const SCHEMA  = yaml.Schema.create([GetAtt.yamlType, Sub.yamlType]);

module.exports.load = function(yamlStr) {
  const loaded = yaml.load(yamlStr, { schema: SCHEMA });
  return loaded;
};

const dump = module.exports.dump = function(json) {
  if (typeof json === 'string')   { return dump(JSON.parse(json)); }

  const dumped = yaml.dump(json);
  return dumped;
};

module.exports.SCHEMA = SCHEMA;
