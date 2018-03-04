import * as llvm from "llvmc";

import { OpBin } from "./OpBin";
import { Type } from "./Type";
import { Context } from "../scope/Context";
import { Expr } from "../expr/Expr";

export class TypeNullable extends Type {
    constructor(ctx: Context) {
        super(ctx);
    }
}
