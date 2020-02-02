export declare function arr<T>(items: T[]): Arr<T>;
export declare class Arr<T> extends Array<T> implements Array<T> {
    filter: (callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any) => this;
    constructor(...items: T[]);
    static make<T>(items?: T[]): Arr<T>;
    isEmpty(): boolean;
    isNotEmpty(): boolean;
    first(): T;
    last(): T;
    findBy(key: keyof T | string, value: any): T | undefined;
    where(key: keyof T | string, value: any): this;
    whereIn(key: keyof T | string, values: any[]): this;
    whereNotIn(key: keyof T | string, values: any[]): this;
    each(callbackfn: (value: T, index: number, array: T[]) => void): this;
    newInstance(...items: T[]): this;
    keyBy<K extends keyof T>(key: K | ((item: T) => string)): Record<string, T>;
    toMap(key: keyof T | string): Map<string, T>;
}
