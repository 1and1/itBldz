module.exports = function (json) {
    'use strict';
    var me = {};

    me.withPropertyForSpecifiedLevels = function (optionsToDecorate, property, value) {
        value = value || true;
        Object.keys(optionsToDecorate).forEach(function (option) {
            var todepth = function (currentNode, remainingLevels) {
                if (remainingLevels < 1 || !currentNode) return currentNode;
                remainingLevels--;

                Object.keys(currentNode).forEach(function (item) {
                    currentNode[item] = todepth(currentNode[item], remainingLevels);
                    currentNode[item][property] = value;
                });
                
                return currentNode;
            };
            
            if (json[option]) {
                json[option] = todepth(json[option], optionsToDecorate[option]);
            }
        });
        
        return me;
    };
    
    me.create = function () {
        return json;
    };
    
    return me;
};