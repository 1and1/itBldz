module.exports = function () {
    this.find = function (object, search, onFound) {
        if (!object) return;
        
        if (typeof object !== "object") return;

        if (!search || search.constructor !== Array) {
            search = [search];
        }
        
        if (!onFound || typeof onFound !== "function") onFound = function () { };
        
        var result = {}, match = false;
        Object.keys(object).forEach(function (property) {
            
            search.forEach(function (query) {
                if (query === property) {
                    match = true;
                    result[query] = object[property];
                }
            });
            
            this.find(object[property], search, onFound);            
        });

        if (match) onFound(result);
    };

    return this;
};