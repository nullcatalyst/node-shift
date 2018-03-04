import * as llvm from "llvmc";

import { Expr } from "./Expr";
import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";

export class ExprConstInt extends Expr {
    private _value: number;

    constructor(ctx: Context, value: number) {
        super(ctx);

        this._value = value;
        this._type = this._ctx.getTypeInt32();
    }

    validate(_scope: Scope) {
        this._type = this._ctx.getTypeInt32();
    }

    build(builder: llvm.Builder) {
        this._llvm = llvm.ConstInt.create(this._value, this.getType().getLLVM());
        return this._llvm;
    }
}
