import * as llvm from "llvmc";

import { Expr } from "./Expr";
import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";
import { Type } from "../type/Type";
import { TypeFunc } from "../type/TypeFunc";

export class ExprCast extends Expr {
    private _expr: Expr;

    constructor(ctx: Context, expr: Expr, type: Type) {
        super(ctx);

        this._expr = expr;
        this._type = type;
    }

    validate(_scope: Scope) {
        this._expr.validate(_scope);
    }

    build(builder: llvm.Builder): llvm.Value {
        this._expr.build(builder);
        this._llvm = this.getType().buildCastFrom(builder, this._expr);
        return this._llvm;
    }
}
