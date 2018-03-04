import * as llvm from "llvmc";

import { Context } from "../scope/Context";
import { Expr } from "./Expr";
import { Type } from "../type/Type";
import { TypeFunc } from "../type/TypeFunc";
import { Scope } from "../scope/Scope";

export class ExprDeclFunc extends Expr {
    private _name: string;
    private _exprs: Expr[];

    constructor(ctx: Context, name: string, type: TypeFunc, exprs: Expr[]) {
        super(ctx);

        this._name = name;
        this._type = type;
        this._exprs = exprs;
    }

    getType(): TypeFunc {
        return super.getType() as TypeFunc;
    }

    validate(_scope: Scope) {
        const scope = new Scope();
        for (let expr of this._exprs) {
            expr.validate(scope);
        }
    }

    build(builder: llvm.Builder): llvm.Value {
        const llvmFunc = this._ctx.createFunction(this._name, this.getType());

        const entryBlock = llvmFunc.appendBasicBlock("entry");
        builder.positionAtEnd(entryBlock);

        let result: llvm.Value | null = null;
        for (let expr of this._exprs) {
            expr.build(builder);
            result = expr.getLLVM();
        }

        if (result == null) {
            builder.createRetVoid();
        } else {
            builder.createRet(result);
        }

        this._llvm = llvmFunc;
        return this._llvm;
    }
}
