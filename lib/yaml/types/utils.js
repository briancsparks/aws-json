

module.exports.addTo = function(self, obj) {
  if (!self || !obj)  { return self; }

  const keys = Object.keys(obj);
  const len  = keys.length;

  var key;
  for (var i = 0; i < len; ++i) {
    key = keys[i];
    self[key] = obj[key];
  }

  return self;
};
