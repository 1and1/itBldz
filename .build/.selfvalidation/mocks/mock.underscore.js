var spying = require('sinon');
module.exports = function() {
  var _MockTemplate = function() {
    return {};
  };

  this._Mock = _MockTemplate();

  this.withExtend = function() {
    this._Mock["extend"] = spying.spy();
    return this;
  };

  this.build = function() {
    return this._Mock;
  };

  return this;
};
