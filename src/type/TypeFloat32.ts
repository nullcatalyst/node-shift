import * as llvm from "llvmc";

import { OpBin } from "./OpBin";
import { Type } from "./Type";
import { Context } from "../scope/Context";
import { Expr } from "../expr/Expr";

export class TypeFloat32 extends Type {
    constructor(ctx: Context) {
        super(ctx);

        this._llvm = ctx.createLLVMFloat32Type();
    }

    getBinOpType(op: OpBin, rhsType: Type): Type {
        switch (op) {
            case OpBin.Add: return this;
            case OpBin.Sub: return this;
            case OpBin.Mul: return this;
            case OpBin.Div: return this;
            case OpBin.Rem: return this;

            case OpBin.Lt: return this._ctx.getTypeBool();
            case OpBin.Gt: return this._ctx.getTypeBool();
            case OpBin.Eq: return this._ctx.getTypeBool();
            case OpBin.Ne: return this._ctx.getTypeBool();
            case OpBin.Le: return this._ctx.getTypeBool();
            case OpBin.Ge: return this._ctx.getTypeBool();

            default: throw new Error();
        }
    }

    buildCastFrom(builder: llvm.Builder, expr: Expr): llvm.Value {
        if (expr.getType() === this._ctx.getTypeInt32()) {
            return builder.createSIToFP(expr.getLLVM(), this.getLLVM());
        }

        throw new Error();
    }

    buildBinOp(builder: llvm.Builder, op: OpBin, lhs: Expr, rhs: Expr): llvm.Value {
        switch (op) {
            case OpBin.Add: return builder.createFAdd(lhs.getLLVM(), rhs.getLLVM());
            case OpBin.Sub: return builder.createFSub(lhs.getLLVM(), rhs.getLLVM());
            case OpBin.Mul: return builder.createFMul(lhs.getLLVM(), rhs.getLLVM());
            case OpBin.Div: return builder.createFDiv(lhs.getLLVM(), rhs.getLLVM());
            case OpBin.Rem: return builder.createFRem(lhs.getLLVM(), rhs.getLLVM());

            // case OpBin.Lt: return builder.buildFCmpOLT(lhs.getLLVM(), rhs.getLLVM(), "");
            // case OpBin.Gt: return builder.buildFCmpOGT(lhs.getLLVM(), rhs.getLLVM(), "");
            // case OpBin.Eq: return builder.buildFCmpOEQ(lhs.getLLVM(), rhs.getLLVM(), "");
            // case OpBin.Ne: return builder.buildFCmpONE(lhs.getLLVM(), rhs.getLLVM(), "");
            // case OpBin.Le: return builder.buildFCmpOLE(lhs.getLLVM(), rhs.getLLVM(), "");
            // case OpBin.Ge: return builder.buildFCmpOGE(lhs.getLLVM(), rhs.getLLVM(), "");

            default: throw new Error();
        }
    }
}
