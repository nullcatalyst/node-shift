import * as llvm from "llvmc";

import { Context } from "./Context";
import { Var } from "./Var";
import { Type } from "../type/Type";

export class Scope {
    private _parent: Scope | null;
    private _global: boolean;
    private _vars: { [name: string]: Var };

    constructor(parent?: Scope | null, global: boolean = false) {
        this._parent = parent || null;
        this._global = global || false;
        this._vars = {};
    }

    validate() {
        for (let name in this._vars) {
            this._vars[name].validate();
        }
    }

    createVar(ctx: Context, name: string, type: Type): Var {
        const _var = new Var(ctx, name, type, this._global);
        this._vars[name] = _var;
        return _var;
    }

    getVarByName(name: string): Var | null {
        if (name in this._vars) {
            return this._vars[name];
        } else if (this._parent !== null) {
            return this._parent.getVarByName(name);
        } else {
            return null;
        }
    }
}
