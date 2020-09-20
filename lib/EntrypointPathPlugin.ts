/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Jason Anderson @diurnalist
*/
'use strict';

import { ChunkData, compilation, Compiler } from 'webpack';

const REGEXP_ENTRYPOINT          = /\[entrypoint\]/gi;
const REGEXP_ENTRYPOINT_FOR_TEST = new RegExp(REGEXP_ENTRYPOINT.source, 'i');

const withHashLength = (replacer, handlerFn) => {
    const fn = (match, hashLength, ...args) => {
        const length = hashLength && parseInt(hashLength, 10);
        if ( length && handlerFn ) {
            return handlerFn(length);
        }
        const hash = replacer(match, hashLength, ...args);
        return length ? hash.slice(0, length) : hash;
    };
    return fn;
};

const getReplacer = (value, allowEmpty?) => {
    const fn = (match, ...args) => {
        // last argument in replacer is the entire input string
        const input = args[ args.length - 1 ];
        if ( value === null || value === undefined ) {
            if ( !allowEmpty ) {
                throw new Error(
                    `Path variable ${match} not implemented in this context: ${input}`,
                );
            }
            return '';
        } else {
            return `${value}`;
        }
    };
    return fn;
};

const ChunkGroup = require('webpack/lib/ChunkGroup');


const getRootParent = (group, call = 0) => {
    let parents = group.getParents();
    if ( parents.length === 0 || call > 30 ) return group;
    return getRootParent(parents[ 0 ], call ++);
};

const NAME = 'EntrypointPathPlugin';

const contains = (str, needle) => {
    let exp = new RegExp(`(?:vendors~${needle}|${needle})\.`, 'g');
    return exp.test(str);
};

export default class EntrypointPathPlugin {
    /**
     *
     * @param {Compiler} compiler
     */
    apply(compiler: Compiler) {
        compiler.hooks.compilation.tap(NAME, (compilation: compilation.Compilation) => {
            let entries         = compilation.entries;
            const mainTemplate  = compilation.mainTemplate as any;
            let inChunk         = null;
            const getEntryPoint = (path, data: ChunkData) => {
                if ( !REGEXP_ENTRYPOINT_FOR_TEST.test(path) ) {
                    return path;
                }
                if ( !data.chunk ) {
                    return path;
                }
                let chunk = data.chunk;

                let chunkName  = chunk && (chunk.name || chunk.id);
                let entrypoint = compilation.entries[ 0 ].name;

                let a = { mainTemplate, compilation, inChunk };
                try {
                    if ( chunk.getNumberOfGroups && chunk.getNumberOfGroups() > 0 ) {
                        let chunkGroup = Array.from(data.chunk.groupsIterable)[ 0 ];
                        let parents    = chunkGroup.getParents();
                        if ( parents.length > 0 ) {
                            entrypoint = parents[ 0 ].name;
                        }
                    }

                    if ( chunk.hasEntryModule && chunk.hasEntryModule() ) {
                        entrypoint = chunk.entryModule.name;
                    } else if ( inChunk && inChunk.hasEntryModule && inChunk.hasEntryModule() ) {
                        entrypoint = inChunk.entryModule.name;
                        // } else if ( chunk.groupsIterable ) {
                        //     let groups = Array.from(chunk.groupsIterable);
                        //     if ( groups.length > 0 ) {
                        //         let group = groups[groups.length - 1];
                        //         if ( group instanceof ChunkGroup ) {
                        //             let rootParent = getRootParent(group);
                        //             entrypoint = rootParent.name || entrypoint;
                        //         }
                        //     }

                    } else {
                        // if ( contains(chunkName, 'core') || contains(chunk.contentHash.javascript, 'core') ) {
                        //     entrypoint = 'core';
                        // } else if ( contains(chunkName, 'phpdoc') || contains(chunk.contentHash.javascript, 'phpdoc') ) {
                        //     entrypoint = 'phpdoc';
                        // }
                    }

                    // return path.replace(REGEXP_ENTRYPOINT, entrypoint);
                } catch ( e ) {
                    console.error(e);
                    // return path;
                }
                return entrypoint;
            };

            const interceptCall      = (source, chunk, ...args) => {
                inChunk = chunk;
            };
            const interceptPrevChunk = (tap) => {
                let originalFn = tap.fn;
                tap.fn         = (source, chunk, ...args) => {
                    inChunk = chunk;
                    let res = originalFn(source, chunk, ...args);
                    inChunk = null;
                    return res;
                };
                return tap;
            };
            // mainTemplate.hooks.bootstrap.intercept({
            //     register: tap => interceptPrevChunk(tap)
            // });
            mainTemplate.hooks.localVars.intercept({
                // call: (...args) => interceptCall(...args),
                register: tap => interceptPrevChunk(tap),
            });
            mainTemplate.hooks.render.intercept({
                // call: (...args) => interceptCall(...args),
                register: tap => interceptPrevChunk(tap),
            });

            mainTemplate.hooks.assetPath.tap(NAME, (path, data) => {
                    if ( REGEXP_ENTRYPOINT_FOR_TEST.test(path) ) {
                        path = path.replace(REGEXP_ENTRYPOINT, getReplacer(getEntryPoint(path, data)));
                        // path = getEntryPoint(path, data);
                    }

                    return path;
                },
            );
            // );
            //
            // mainTemplate.hooks.globalHash.tap(
            //     'TemplatedPathPlugin',
            //     (chunk, paths) => {
            //         const outputOptions = mainTemplate.outputOptions;
            //         const publicPath = outputOptions.publicPath || '';
            //         const filename = outputOptions.filename || '';
            //         const chunkFilename =
            //                   outputOptions.chunkFilename || outputOptions.filename;
            //         if (
            //             REGEXP_HASH_FOR_TEST.test(publicPath) ||
            //             REGEXP_CHUNKHASH_FOR_TEST.test(publicPath) ||
            //             REGEXP_CONTENTHASH_FOR_TEST.test(publicPath) ||
            //             REGEXP_NAME_FOR_TEST.test(publicPath)
            //         )
            //             return true;
            //         if ( REGEXP_HASH_FOR_TEST.test(filename) ) return true;
            //         if ( REGEXP_HASH_FOR_TEST.test(chunkFilename) ) return true;
            //         if ( REGEXP_HASH_FOR_TEST.test(paths.join('|')) ) return true;
            //     }
            // );
            //
            // mainTemplate.hooks.hashForChunk.tap(
            //     'TemplatedPathPlugin',
            //     (hash, chunk) => {
            //         const outputOptions = mainTemplate.outputOptions;
            //         const chunkFilename =
            //                   outputOptions.chunkFilename || outputOptions.filename;
            //         if ( REGEXP_CHUNKHASH_FOR_TEST.test(chunkFilename) ) {
            //             hash.update(JSON.stringify(chunk.getChunkMaps(true).hash));
            //         }
            //         if ( REGEXP_CONTENTHASH_FOR_TEST.test(chunkFilename) ) {
            //             hash.update(
            //                 JSON.stringify(
            //                     chunk.getChunkMaps(true).contentHash.javascript || {}
            //                 )
            //             );
            //         }
            //         if ( REGEXP_NAME_FOR_TEST.test(chunkFilename) ) {
            //             hash.update(JSON.stringify(chunk.getChunkMaps(true).name));
            //         }
            //     }
            // );
        });
    }
}
