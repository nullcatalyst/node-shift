import * as llvm from "llvmc";

import { Context } from "../scope/Context";
import { Type } from "./Type";
import { OpBin } from "./OpBin";
import { Expr } from "../expr/Expr";

export class TypeVoid extends Type {
    constructor(ctx: Context) {
        super(ctx);

        this._llvm = ctx.createLLVMVoidType();
    }
}
