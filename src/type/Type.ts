import * as llvm from "llvmc";

import { OpBin } from "./OpBin";
import { Context } from "../scope/Context";
import { Expr } from "../expr/Expr";

export class Type {
    protected _ctx: Context;
    protected _llvm: llvm.Type | null;

    constructor(ctx: Context) {
        this._ctx = ctx;
        this._llvm = null;
    }

    getLLVM() {
        if (!this._llvm) {
            throw new Error();
        }

        return this._llvm;
    }

    isCallable(): boolean { return false; }

    getBinOpType(op: OpBin, rhsType: Type): Type { throw new Error(); }

    buildCastFrom(builder: llvm.Builder, lhs: Expr): llvm.Value { throw new Error(); }
    buildBinOp(builder: llvm.Builder, op: OpBin, lhs: Expr, rhs: Expr): llvm.Value { throw new Error(); }
}
