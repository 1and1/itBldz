export default class Arguments {
    public static getConfigArgument(value : string, defaultExtension : string = ".json") : string {
        if (value.endsWith(".json"))
            return value;
        if (value.endsWith(".yml"))
            return value;
        return value + defaultExtension;
    }
}