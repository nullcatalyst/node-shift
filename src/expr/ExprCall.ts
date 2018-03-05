import * as llvm from "llvmc";

import { Expr } from "./Expr";
import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";
import { Var } from "../scope/Var";
import { Type } from "../type/Type";

export class ExprCall extends Expr {
    private _call: Expr;
    private _args: Expr[];

    constructor(ctx: Context, call: Expr, args: Expr[]) {
        super(ctx);

        this._call = call;
        this._args = args;
    }

    validate(_scope: Scope) {
        this._call.validate(_scope);

        for (let arg of this._args) {
            arg.validate(_scope);
        }
    }

    build(builder: llvm.Builder): llvm.Value {
        const argValues = this._args.map((arg) => arg.build(builder));
        this._llvm = builder.createCall(this._call.build(builder), argValues);
        return this._llvm;
    }
}
