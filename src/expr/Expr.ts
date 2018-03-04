import * as llvm from "llvmc";

import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";
import { Type } from "../type/Type";

export class Expr {
    protected _ctx: Context;
    protected _type: Type | null;
    protected _llvm: llvm.Value | null;

    constructor(ctx: Context) {
        this._ctx = ctx;
        this._type = null;
        this._llvm = null;
    }

    getType(): Type {
        if (!this._type) {
            throw new Error(`no type ${Object.getPrototypeOf(this).constructor.name}`);
        }

        return this._type;
    }

    getLLVM(): llvm.Value {
        if (!this._llvm) {
            throw new Error(`no llvm value ${Object.getPrototypeOf(this).constructor.name}`);
        }

        return this._llvm;
    }

    validate(scope: Scope) {
        throw new Error(`unimplemented ${Object.getPrototypeOf(this).constructor.name}#validate`);
    }

    build(builder: llvm.Builder): llvm.Value {
        throw new Error(`unimplemented ${Object.getPrototypeOf(this).constructor.name}#build`);
    }
}
