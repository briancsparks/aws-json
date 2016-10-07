
/**
 *
 */

var _             = require('underscore');
var base          = require('./cf-base');
var Base          = base.Base;

// Our lib
var sns = {};

/**
 *  Topic
 *
 */
var Topic = sns.Topic = function(name, cf, displayName) {
  var self = this;
  Base.call(this, cf, 'SNS::Topic', name);

  self.addProperty('TopicName', name);

  if (displayName) {
    self.addProperty('DisplayName', displayName);
  }

  self.addSubscription = function(protocol, endpoint) {
    self.addProperties('Subscription', {Endpoint: endpoint, Protocol: protocol});
  };
  cf.data.Resources[name] = self;
};

sns.makeTopic = function(name, cf, displayName) {
  return new Topic(name, cf, displayName);
}

/**
 *
 */
var TopicPolicy = sns.TopicPolicy = function(name, cf, topic, policy) {
  var self = this;
  Base.call(this, cf, 'SNS::TopicPolicy', name);


  self.addTopic = function(topic) {
    self.addPropertyIds('Topics', topic);
  };

  self.addProperty('PolicyDocument', policy);
  self.addTopic(topic);
  cf.data.Resources[name] = self;
};

sns.makeTopicPolicy = function(name, cf, topic, policy) {
  return new TopicPolicy(name, cf, topic, policy);
};

_.each(sns, function(value, key) {
  exports[key] = value;
});






