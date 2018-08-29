
/**
 *
 */
const sg                      = require('sgsg');
const _                       = sg._;

const test                    = require('ava');

const cfYaml                  = require('./cf');

const getatt1 = `
Outputs:
  FooBarFunction:
    Description: FooBar API ARN.
    Value: !GetAtt FooBarFunction.b.c.Arn
`;

const getatt1Json = {
  Outputs: {
    FooBarFunction: {
      Description: "FooBar API ARN.",
      Value: {
        "Fn::GetAtt": ["FooBarFunction", "b", "c", "Arn"]
      }
    }
  }
};


// Normal, sync
test('Simple GetAtt works', t => {
  const json = podify(cfYaml.load(getatt1));
  t.deepEqual(json, getatt1Json);
});

function podify(x) {
  return JSON.parse(JSON.stringify(x));
}


// Unconditional:
// t.pass('[message]');
// t.fail('[message]');
//
// Assertions:
// t.truthy(data, '[message]');
// t.falsy(data, '[message]');
// t.true(data, '[message]');
// t.false(data, '[message]');
// t.is(data, expected, '[message]');
// t.not(data, expected, '[message]');
// t.deepEqual(data, expected, '[message]');
// t.notDeepEqual(data, expected, '[message]');
// t.throws(function|promise, [error, '[message]']);
// t.notThrows(function|promise, '[message]');
// t.regex(data, regex, '[message]');
// t.notRegex(data, regex, '[message]');
// t.ifError(error, '[message]');         /* assert that error is falsy */
//
// t.skip.is(foo(), 5);
