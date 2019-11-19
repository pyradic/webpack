import { Arr } from './Arr';
import { Entrypoint } from './interfaces';
import { Addon } from './Addon';


export class EntrypointArray extends Arr<Entrypoint> {
    development() { return this.filter(e => e.env === undefined || e.env === 'development')}

    production() { return this.filter(e => e.env === undefined || e.env === 'production')}

    testing() { return this.filter(e => e.env === undefined || e.env === 'testing')}

    env(env: Entrypoint['env'], strict: boolean = false) {
        return this.filter(e => {
            if ( strict ) {
                return e.env === env
            }
            return e.env === undefined || e.env === env
        })
    }

    main() {return this.find(e => e.suffix === undefined)}

    suffixed() {return this.filter(e => e.suffix !== undefined)}

    findSuffixed(addon: Addon, entryName) {return this.find(entry => addon.exportName + entry.suffix === entryName) }
}
