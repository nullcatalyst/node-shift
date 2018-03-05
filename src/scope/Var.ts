import * as llvm from "llvmc";

import { Context } from "./Context";
import { Type } from "../type/Type";

export class Var {
    private _ctx: Context;
    private _name: string;
    private _type: Type;
    private _llvm: llvm.Value | null;

    constructor(mod: Context, name: string, type: Type, global: boolean = false) {
        this._ctx = mod;
        this._name = name;
        this._type = type;
        this._llvm = null;
    }

    getName(): string {
        return this._name;
    }

    getType(): Type {
        return this._type;
    }

    getLLVM(): llvm.Value {
        if (this._llvm === null) {
            throw new Error();
        }

        return this._llvm;
    }

    validate() {
        /// TODO: validate
    }

    build(builder: llvm.Builder, llvmValue?: llvm.Value): llvm.Value {
        if (this._llvm === null) {
            if (llvmValue) {
                this._llvm = llvmValue;
            } else {
                this._llvm = builder.createAlloca(this._type.getLLVM(), this._name);
            }
        }

        return this._llvm;
    }
}
