import * as llvm from "llvmc";

import { Expr } from "./Expr";
import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";
import { Var } from "../scope/Var";
import { Type } from "../type/Type";
import { TypeFunc } from "../type/TypeFunc";

export class ExprDeclFunc extends Expr {
    private _name: string;
    private _var: Var | null;
    private _exprs: Expr[];

    constructor(ctx: Context, name: string, type: TypeFunc, exprs: Expr[]) {
        super(ctx);

        this._name = name;
        this._var = null;
        this._type = type;
        this._exprs = exprs;
    }

    getVar(): Var {
        if (this._var === null) {
            throw new Error();
        }

        return this._var;
    }

    getType(): TypeFunc {
        return super.getType() as TypeFunc;
    }

    validate(_scope: Scope) {
        this._var = _scope.createVar(this._ctx, this._name, this._type);

        const scope = new Scope(_scope);
        for (let expr of this._exprs) {
            expr.validate(scope);
        }
    }

    build(builder: llvm.Builder): llvm.Value {
        const llvmFunc = this._ctx.createFunction(this._name, this.getType());
        this._var.build(builder, llvmFunc);

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
