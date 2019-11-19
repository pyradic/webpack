
export const map2object = <K extends string,V>(map:Map<K,V>) :Record<K,V> => Array.from(map.entries()).reduce((main, [key, value]) => ({...main, [key]: value}), {}) as any



export function JSONstringify(obj, replacer?, spaces?, cycleReplacer?) {
    return JSON.stringify(obj, getJSONStringifySerialize(replacer, cycleReplacer), spaces)
}

export function getJSONStringifySerialize(replacer, cycleReplacer) {
    var stack = [], keys = []

    if (cycleReplacer == null) cycleReplacer = function(key, value) {
        if (stack[0] === value) return "[Circular ~]"
        return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
    }

    return function(key, value) {
        if (stack.length > 0) {
            var thisPos = stack.indexOf(this)
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
            if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
        }
        else stack.push(value)

        return replacer == null ? value : replacer.call(this, key, value)
    }
}
