import * as llvm from "llvmc";

import { Expr } from "./Expr";
import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";
import { OpBin } from "../type/OpBin";

export class ExprOpBin extends Expr {
    private _op: OpBin;
    private _lhs: Expr;
    private _rhs: Expr;

    constructor(ctx: Context, op: OpBin, lhs: Expr, rhs: Expr) {
        super(ctx);

        this._op = op;
        this._lhs = lhs;
        this._rhs = rhs;
    }

    validate(_scope: Scope) {
        this._lhs.validate(_scope);
        this._rhs.validate(_scope);
        this._type = this._lhs.getType().getBinOpType(this._op, this._rhs.getType());
    }

    build(builder: llvm.Builder): llvm.Value {
        this._lhs.build(builder);
        this._rhs.build(builder);
        this._llvm = this._lhs.getType().buildBinOp(builder, this._op, this._lhs, this._rhs);
        return this._llvm;
    }
}
