import { get } from 'lodash'

export function arr<T>(items: T[]) {
    return new Arr<T>(...items);
}

export class Arr<T> extends Array<T> implements Array<T> {
    filter: (callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any) => this


    constructor(...items: T[]) {
        super(...items);
        Object.setPrototypeOf(this, new.target.prototype);
    }

    static make<T>(items: T[] = []) { return new (this)(...items); }

    isEmpty() { return this.length === 0}

    isNotEmpty() { return this.length > 0}

    first() { return this[ 0 ]; }

    last() { return this[ this.length - 1 ]; }

    findBy(key: keyof T | string, value: any): T | undefined { return this.find(item => get(item, key) === value); }

    where(key: keyof T | string, value: any): this { return this.filter(item => get(item, key) === value); }

    whereIn(key: keyof T | string, values: any[]): this {return this.filter(item => values.includes(get(item, key)) === true); }

    whereNotIn(key: keyof T | string, values: any[]): this {return this.filter(item => values.includes(get(item, key)) === false); }

    each(callbackfn: (value: T, index: number, array: T[]) => void) {
        this.forEach(callbackfn);
        return this;
    }

    newInstance(...items: T[]): this {
        let Class    = this.constructor as any;
        let instance = new Class(...items);
        return instance as this;
    }

    keyBy<K extends keyof T>(key: K | ((item: T) => string)): Record<string, T> {
        let cb: ((item: T) => string) = key as any;
        if ( typeof key === 'string' ) {
            cb = item => item[ key as any ];
        }
        let result = {};
        this.forEach(item => {
            let key       = cb(item);
            result[ key ] = item;
        });
        return result as any;
    }

    toMap(key: keyof T | string): Map<string, T> {
        const map = new Map();
        this.forEach(item => map.set(get(item, key), item))
        return map;
    }
}
