import * as llvm from "llvmc";

import { Type } from "./Type";
import { Context } from "../scope/Context";
import { Expr } from "../expr/Expr";

export class TypeFunc extends Type {
    constructor(ctx: Context, retType: Type, argTypes: Type[]) {
        super(ctx);

        this._llvm = llvm.FunctionType.create(retType.getLLVM(), argTypes.map((type) => type.getLLVM()), false);
    }

    getLLVM(): llvm.FunctionType {
        if (!this._llvm) {
            throw new Error();
        }

        return this._llvm as llvm.FunctionType;
    }
}
