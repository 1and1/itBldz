export default class Arguments {
    /**
     * Polyfill https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
     */
    private static endsWith(searchString: string, position: number = undefined) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    }

    public static getConfigArgument(value: string, defaultExtension: string = ".json"): string {
        if (Arguments.endsWith(".json"))
            return value;
        if (Arguments.endsWith(".yml"))
            return value;
        return value + defaultExtension;
    }
}