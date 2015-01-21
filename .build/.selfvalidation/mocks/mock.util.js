var spying = require('sinon');
module.exports = function() {
  var utilMockTemplate = function() {
    return {};
  };

  this.utilMock = utilMockTemplate();

  this.withUnderscore = function(_) {
    this.utilMock["_"] = _;
    return this;
  };

  this.build = function() {
    return this.utilMock;
  };

  return this;
};
