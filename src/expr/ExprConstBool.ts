import * as llvm from "llvmc";

import { Expr } from "./Expr";
import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";

export class ExprConstBool extends Expr {
    private _value: boolean;

    constructor(ctx: Context, value: boolean) {
        super(ctx);

        this._value = value;
    }

    validate(_scope: Scope) {
        this._type = this._ctx.getTypeBool();
    }

    build(builder: llvm.Builder): llvm.Value {
        this._llvm = this._value ? llvm.ConstInt.createTrue() : llvm.ConstInt.createFalse();
        return this._llvm;
    }
}
