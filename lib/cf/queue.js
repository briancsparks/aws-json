
/**
 *
 */

var _             = require('underscore');
var base          = require('./cf-base');
var Base          = base.Base;

// Our lib
var sqs = {};

/**
 *  Queue
 *
 *  TODO: Add other properties
 *
 */
var Queue = sqs.Queue = function(name, cf) {
  var self = this;
  Base.call(this, cf, 'SQS::Queue', name);

  self.addProperty('QueueName', name);
  cf.data.Resources[name] = self;
};

sqs.makeQueue = function(name, cf) {
  return new Queue(name, cf);
}

/**
 *
 */
var QueuePolicy = sqs.QueuePolicy = function(name, cf, queue, policy) {
  var self = this;
  Base.call(this, cf, 'SQS::QueuePolicy', name);


  self.addQueue = function(queue) {
    self.addPropertyIds('Queues', queue);
  };

  self.addProperty('PolicyDocument', policy);
  self.addQueue(queue);
  cf.data.Resources[name] = self;
};

sqs.makeQueuePolicy = function(name, cf, queue, policy) {
  return new QueuePolicy(name, cf, queue, policy);
};

_.each(sqs, function(value, key) {
  exports[key] = value;
});







