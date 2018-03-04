export class MultiMap<Key extends any[], Value> extends Map<any, any> {
    has(key: Key): boolean {
        if (key.length > 1) {
            let subMap = super.get(key[0]);

            if (subMap === undefined) {
                return false;
            } else {
                return subMap.has(key.slice(1));
            }
        } else {
            return super.has(key[0]);
        }
    }

    get(key: Key): Value | undefined {
        if (key.length > 1) {
            let subMap = super.get(key[0]);

            if (subMap === undefined) {
                return undefined;
            } else {
                return subMap.get(key.slice(1));
            }
        } else {
            super.get(key[0]);
        }
    }

    set(key: Key, value: Value): this {
        if (key.length > 1) {
            let subMap = super.get(key[0]);

            if (subMap === undefined) {
                subMap = new MultiMap();
                super.set(key[0], subMap);
            }

            subMap.set(key.slice(1), value);
        } else {
            super.set(key[0], value);
        }

        return this;
    }

    delete(key: Key): boolean {
        if (key.length > 1) {
            let subMap = super.get(key[0]);

            if (subMap === undefined) {
                return false;
            } else {
                return subMap.delete(key.slice(1));
            }
        } else {
            return super.delete(key[0]);
        }
    }

    forEach(callback: (value: Value, key: Key, map: this) => void, thisArg?: any): void {
        throw new Error("unsupported");
    }
}
