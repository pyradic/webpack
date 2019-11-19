
export class DependencySorter {

    /**
     * @var array
     */
    protected items: any = [];

    /**
     * @var array
     */
    protected dependencies: any = {};

    /**
     * @var array
     */
    protected dependsOn: any = {};

    /**
     * @var array
     */
    protected missing: any = {};

    /**
     * @var array
     */
    protected circular: any = {};

    /**
     * @var array
     */
    protected hits: any = {};

    /**
     * @var array
     */
    protected sorted: any = {};


    constructor() {

    }

    public add(items: { [name: string]: string | string[] }) {
        Object.keys(items).forEach((name: string) => {
            this.addItem(name, items[ name ]);
        });
    }

    public addItem(name: string, deps?: string | string[]) {
        if ( typeof deps === 'undefined' ) {
            deps = deps || [];
        }
        else if ( typeof deps === 'string' ) {
            deps = (<string> deps).toString().split(/,\s?/)
        }
        this.setItem(name, <string[]> deps);
    }

    public setItem(name: string, deps: string[]) {
        this.items.push(name);
        deps.forEach((dep: string) => {
            this.items.push(dep);

            if ( ! this.dependsOn[ dep ] ) {
                this.dependsOn[ dep ] = {};
            }

            this.dependsOn[ dep ][ name ] = name;

            this.hits[ dep ] = 0;
        });

        // uniq
        this.items                = this.items.filter((x, i, a) => a.indexOf(x) == i)
        this.dependencies[ name ] = deps;
        this.hits[ name ]         = 0;
    }


    public sort(): string[] {
        this.sorted             = [];
        var hasChanged: boolean = true;
        while ( this.sorted.length < this.items.length && hasChanged ) {
            hasChanged = false;

            Object.keys(this.dependencies).forEach((item: string) => {
                if ( this.satisfied(item) ) {
                    this.setSorted(item);
                    this.removeDependents(item);
                    hasChanged = true;
                }
                this.hits[ item ] ++;
            });
        }

        return this.sorted;
    }


    protected satisfied(name: string) {
        var pass: boolean = true;

        this.getDependents(name).forEach((dep: string) => {
            if ( this.isSorted(dep) ) {
                return;
            }

            if ( ! this.exists(name) ) {
                this.setMissing(name, dep);
                if ( pass ) {
                    pass = false;
                }
            }
            if ( this.hasDependents(dep) ) {
                if ( pass ) {
                    pass = false;
                }
            }
            else {
                this.setFound(name, dep);
            }
            if ( this.isDependent(name, dep) ) {
                this.setCircular(name, dep);
                if ( pass ) {
                    pass = false;
                }

            }
        });

        return pass;
    }


    /**
     * setSorted
     *
     * @param item
     */
    protected setSorted(item) {
        this.sorted.push(item);
    }

    protected exists(item): boolean {
        return this.items.indexOf(item) !== - 1;
    }

    /**
     * removeDependents
     *
     * @param item
     */
    protected removeDependents(item) {
        delete this.dependencies[ item ];
    }

    /**
     * setCircular
     *
     * @param item
     * @param item2
     */
    protected setCircular(item, item2) {
        this.circular[ item ]          = this.circular[ item ] || {};
        this.circular[ item ][ item2 ] = item2;
    }

    /**
     * setMissing
     *
     * @param item
     * @param item2
     */
    protected setMissing(item, item2) {
        this.missing[ item ]          = this.missing[ item ] || {};
        this.missing[ item ][ item2 ] = item2;
    }

    /**
     * setFound
     *
     * @param item
     * @param item2
     */
    protected setFound(item, item2) {
        if ( typeof this.missing[ item ] !== 'undefined' ) {
            delete this.missing[ item ][ item2 ];
            if ( Object.keys(this.missing[ item ]).length > 0 ) {
                delete this.missing[ item ];
            }
        }
    }

    /**
     * isSorted
     *
     * @param item
     * @return bool
     */
    protected isSorted(item: string): boolean {
        return typeof this.sorted[ item ] !== 'undefined';
    }

    public requiredBy(item: string): boolean {
        return typeof this.dependsOn[ item ] !== 'undefined' ? this.dependsOn[ item ] : [];
    }


    public isDependent(item: string, item2: string): boolean {
        return typeof this.dependsOn[ item ] !== 'undefined' && typeof this.dependsOn[ item ][ item2 ] !== 'undefined';
    }

    public hasDependents(item): boolean {
        return typeof this.dependencies[ item ] !== 'undefined';
    }

    public hasMissing(item): boolean {
        return typeof this.missing[ item ] !== 'undefined';
    }


    public isMissing(dep: string): boolean {
        var missing: boolean = false;
        Object.keys(this.missing).forEach((item: string) => {
            var deps: string[] = this.missing[ item ];
            if ( deps.indexOf(dep) !== - 1 ) {
                missing = true;
            }
        });

        return missing;
    }

    public hasCircular(item: string): boolean {
        return typeof this.circular[ item ] !== 'undefined';
    }

    public isCircular(dep) {
        var circular: boolean = false;
        Object.keys(this.circular).forEach((item: string) => {
            var deps: string[] = this.circular[ item ];
            if ( deps.indexOf(dep) !== - 1 ) {
                circular = true;
            }
        });

        return circular;

    }

    /**
     * getDependents
     *
     * @param item
     * @return mixed
     */
    public getDependents(item): string[] {
        return this.dependencies[ item ];
    }


    public getMissing(str?: any): string[] {
        if ( typeof str === 'string' ) {
            return this.missing[ str ];
        }

        return this.missing;
    }


    public getCircular(str?: any) {
        if ( typeof str === 'string' ) {
            return this.circular[ str ];
        }

        return this.circular;
    }

    public getHits(str?: any) {
        if ( typeof str === 'string' ) {
            return this.hits[ str ];
        }

        return this.hits;
    }

}
