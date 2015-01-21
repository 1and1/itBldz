module.exports = (function () {
    this.setupTaskAlias = function (config, context, tasks) {
        if (typeof tasks === "string") {
            tasks = [tasks];
        }

        tasks.forEach(function (task) {
            config[this.getAlias(context, task)] = config[task];
            delete config[task];
        });

        return config;
    };
    
    this.getAlias = function (context, task) {
        return context + "->" + task;
    };

    return this;
})();