
const _                       = require('underscore');
const { qm }                  = require('quick-merge');

var   lib = {};

const apiResponse = lib.apiResponse = function(statusCode, body_, headers_) {
  const ok        = statusCode < 400;
  const headers   = headers_              || {};
  var   body      = body_                 || {};

  if (typeof body !== 'string') {
    body = qm(body, {ok});
    body = JSON.stringify(body);
  }

  var result = {
    statusCode,
    body,
  };

  // Add any headers
  if (_.keys(headers).length > 0) {
    result.headers = headers;
  }

  return result;
};


lib._200 = function(...args) { return apiResponse(200, ...args); }       // OK
lib._201 = function(...args) { return apiResponse(201, ...args); }       // Created
lib._202 = function(...args) { return apiResponse(202, ...args); }       // Accepted
lib._300 = function(...args) { return apiResponse(300, ...args); }       // Multiple Choices
lib._301 = function(...args) { return apiResponse(301, ...args); }       // Moved Permanently
lib._302 = function(...args) { return apiResponse(302, ...args); }       // Found
lib._304 = function(...args) { return apiResponse(303, ...args); }       // Not Modified
lib._400 = function(...args) { return apiResponse(400, ...args); }       // Bad Request
lib._401 = function(...args) { return apiResponse(401, ...args); }       // Unauthorized
lib._402 = function(...args) { return apiResponse(402, ...args); }       // Payment Required
lib._403 = function(...args) { return apiResponse(403, ...args); }       // Forbidden
lib._404 = function(...args) { return apiResponse(404, ...args); }       // Not Found
lib._499 = function(...args) { return apiResponse(499, ...args); }       // Client Closed Request
lib._500 = function(...args) { return apiResponse(500, ...args); }       // Internal Server Error
lib._502 = function(...args) { return apiResponse(502, ...args); }       // Bad Gateway
lib._503 = function(...args) { return apiResponse(503, ...args); }       // Service Unavailable
lib._504 = function(...args) { return apiResponse(504, ...args); }       // Gateway Timeout

_.each(lib, function(value, key) {
  exports[key] = value;
});

