import * as llvm from "llvmc";

import { Expr } from "./Expr";
import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";

export class ExprConstFloat extends Expr {
    private _value: number;

    constructor(ctx: Context, value: number) {
        super(ctx);

        this._value = value;
        this._type = this._ctx.getTypeFloat32();
    }

    validate(_scope: Scope) {
        this._type = this._ctx.getTypeFloat32();
    }

    build(builder: llvm.Builder): llvm.Value {
        this._llvm = llvm.ConstFloat.create(this._value, this.getType().getLLVM());
        return this._llvm;
    }
}
