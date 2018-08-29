
/**
 *
 */
const sg                      = require('sgsg');
const _                       = sg._;
const util                    = require('util');

const test                    = require('ava');

const cfYaml                  = require('./cf');

const sub1 = `
Outputs:
  FooBarApi:
    Description: The best FooBar API Evah.
    Value: !Sub "https://\${ServerlessRestApi}.execute-api.\${AWS::Region}.amazonaws.com/Prod/hello/"
`;

const sub1Json = {
  Outputs: {
    FooBarApi: {
      Description: "The best FooBar API Evah.",
      Value: {
        "Fn::Sub": "https://\${ServerlessRestApi}.execute-api.\${AWS::Region}.amazonaws.com/Prod/hello/"
      }
    }
  }
};

// Normal, sync
test('Simple Sub works', t => {
  const value   = cfYaml.load(sub1);

  const json    = podify(value);
  t.deepEqual(json, sub1Json);
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

