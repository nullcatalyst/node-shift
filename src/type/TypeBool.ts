import * as llvm from "llvmc";

import { Type } from "./Type";
import { OpBin } from "./OpBin";
import { Context } from "../scope/Context";
import { Expr } from "../expr/Expr";

export class TypeBool extends Type {
    constructor(ctx: Context) {
        super(ctx);

        this._llvm = ctx.createLLVMInt1Type();
    }

    getBinOpType(op: OpBin, rhsType: Type): Type {
        switch (op) {
            case OpBin.And: return this;
            case OpBin.Or:  return this;
            case OpBin.Xor: return this;
            default: throw new Error();
        }
    }

    buildCastFrom(builder: llvm.Builder, expr: Expr): llvm.Value {
        throw new Error();
    }

    buildBinOp(builder: llvm.Builder, op: OpBin, lhs: Expr, rhs: Expr): llvm.Value {
        switch (op) {
            case OpBin.And: return builder.createAnd(lhs.getLLVM(), rhs.getLLVM());
            case OpBin.Or:  return builder.createOr(lhs.getLLVM(), rhs.getLLVM());
            case OpBin.Xor: return builder.createXor(lhs.getLLVM(), rhs.getLLVM());
            default: throw new Error();
        }
    }
}
