export declare class DependencySorter {
    /**
     * @var array
     */
    protected items: any;
    /**
     * @var array
     */
    protected dependencies: any;
    /**
     * @var array
     */
    protected dependsOn: any;
    /**
     * @var array
     */
    protected missing: any;
    /**
     * @var array
     */
    protected circular: any;
    /**
     * @var array
     */
    protected hits: any;
    /**
     * @var array
     */
    protected sorted: any;
    constructor();
    add(items: {
        [name: string]: string | string[];
    }): void;
    addItem(name: string, deps?: string | string[]): void;
    setItem(name: string, deps: string[]): void;
    sort(): string[];
    protected satisfied(name: string): boolean;
    /**
     * setSorted
     *
     * @param item
     */
    protected setSorted(item: any): void;
    protected exists(item: any): boolean;
    /**
     * removeDependents
     *
     * @param item
     */
    protected removeDependents(item: any): void;
    /**
     * setCircular
     *
     * @param item
     * @param item2
     */
    protected setCircular(item: any, item2: any): void;
    /**
     * setMissing
     *
     * @param item
     * @param item2
     */
    protected setMissing(item: any, item2: any): void;
    /**
     * setFound
     *
     * @param item
     * @param item2
     */
    protected setFound(item: any, item2: any): void;
    /**
     * isSorted
     *
     * @param item
     * @return bool
     */
    protected isSorted(item: string): boolean;
    requiredBy(item: string): boolean;
    isDependent(item: string, item2: string): boolean;
    hasDependents(item: any): boolean;
    hasMissing(item: any): boolean;
    isMissing(dep: string): boolean;
    hasCircular(item: string): boolean;
    isCircular(dep: any): boolean;
    /**
     * getDependents
     *
     * @param item
     * @return mixed
     */
    getDependents(item: any): string[];
    getMissing(str?: any): string[];
    getCircular(str?: any): any;
    getHits(str?: any): any;
}
