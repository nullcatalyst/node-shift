import * as llvm from "llvmc";

import { Expr } from "./Expr";
import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";
import { Type } from "../type/Type";

export class ExprBlock extends Expr {
    private _exprs: Expr[];

    constructor(ctx: Context, exprs: Expr[]) {
        super(ctx);

        this._exprs = exprs;
    }

    validate(_scope: Scope) {
        const blockScope = new Scope(_scope)
        for (let expr of this._exprs) {
            expr.validate(blockScope);
            this._type = expr.getType();
        }
    }

    build(builder: llvm.Builder): llvm.Value {
        let result: llvm.Value | null = null;
        for (let expr of this._exprs) {
            expr.build(builder);
            result = expr.getLLVM();
        }

        this._llvm = result!;
        return this._llvm;
    }
}
