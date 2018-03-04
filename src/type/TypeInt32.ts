import * as llvm from "llvmc";

import { OpBin } from "./OpBin";
import { Type } from "./Type";
import { Context } from "../scope/Context";
import { Expr } from "../expr/Expr";

export class TypeInt32 extends Type {
    constructor(ctx: Context) {
        super(ctx);

        this._llvm = ctx.createLLVMInt32Type();
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
        if (expr.getType() === this._ctx.getTypeFloat32()) {
            return builder.createFPToSI(expr.getLLVM(), this.getLLVM());
        }

        throw new Error();
    }

    buildBinOp(builder: llvm.Builder, op: OpBin, lhs: Expr, rhs: Expr): llvm.Value {
        switch (op) {
            case OpBin.Add: return builder.createAdd(lhs.getLLVM(), rhs.getLLVM());
            case OpBin.Sub: return builder.createSub(lhs.getLLVM(), rhs.getLLVM());
            case OpBin.Mul: return builder.createMul(lhs.getLLVM(), rhs.getLLVM());
            case OpBin.Div: return builder.createSDiv(lhs.getLLVM(), rhs.getLLVM());
            case OpBin.Rem: return builder.createSRem(lhs.getLLVM(), rhs.getLLVM());

            // case OpBin.Lt: return builder.buildICmpSLT(lhs.getLLVM(), rhs.getLLVM(), "");
            // case OpBin.Gt: return builder.buildICmpSGT(lhs.getLLVM(), rhs.getLLVM(), "");
            // case OpBin.Eq: return builder.buildICmpEQ(lhs.getLLVM(), rhs.getLLVM(), "");
            // case OpBin.Ne: return builder.buildICmpNE(lhs.getLLVM(), rhs.getLLVM(), "");
            // case OpBin.Le: return builder.buildICmpSLE(lhs.getLLVM(), rhs.getLLVM(), "");
            // case OpBin.Ge: return builder.buildICmpSGE(lhs.getLLVM(), rhs.getLLVM(), "");

            default: throw new Error();
        }
    }
}
