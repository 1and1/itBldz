var spying = require('sinon');
module.exports = {
    store : {},
    on : function (obj, field, onAccess) {
        this.store[obj] = this.store[obj] || {};
        this.store[obj][field] = obj[field];
        obj[field] = onAccess || spying.spy();
        return obj;
    },
    off : function (obj, field) {
        obj[field] = this.store[obj][field];
    } 
}