import * as llvm from "llvmc";

import { Expr } from "./Expr";
import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";
import { Var } from "../scope/Var";
import { Type } from "../type/Type";

export class ExprVar extends Expr {
    private _name: string;
    private _var: Var | null;

    constructor(ctx: Context, name: string) {
        super(ctx);

        this._name = name;
        this._var = null;
    }

    getVar(): Var {
        if (this._var === null) {
            throw new Error();
        }

        return this._var;
    }

    validate(_scope: Scope) {
        this._var = _scope.getVarByName(this._name);

        if (this._var !== null) {
            this._type = this._var.getType();
        } else {
            throw new Error(`var "${this._name}" does not exist`);
        }
    }

    build(builder: llvm.Builder): llvm.Value {
        this._llvm = builder.createLoad(this.getVar().getLLVM());
        return this._llvm;
    }
}
