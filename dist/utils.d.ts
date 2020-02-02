export declare const map2object: <K extends string, V>(map: Map<K, V>) => Record<K, V>;
export declare function JSONstringify(obj: any, replacer?: any, spaces?: any, cycleReplacer?: any): string;
export declare function getJSONStringifySerialize(replacer: any, cycleReplacer: any): (key: any, value: any) => any;
