import * as llvm from "llvmc";

import { Context } from "../scope/Context";
import { Expr } from "./Expr";
import { Type } from "../type/Type";
import { Scope } from "../scope/Scope";
import { Var } from "../scope/Var";

export class ExprDeclVar extends Expr {
    private _name: string;
    private _value: Expr;
    private _var: Var | null;

    constructor(ctx: Context, name: string, value: Expr) {
        super(ctx);

        this._name = name;
        this._value = value;
        this._var = null;
    }

    getVar(): Var {
        if (this._var === null) {
            throw new Error();
        }

        return this._var;
    }

    validate(_scope: Scope) {
        if (_scope.getVarByName(this._name)) {
            throw new Error(`var "${this._name}" already exists`);
        }

        this._value.validate(_scope);
        this._type = this._value.getType();
        this._var = _scope.createVar(this._ctx, this._name, this._type);
    }

    build(builder: llvm.Builder): llvm.Value {
        this._type = this._value.getType();

        const _var = this.getVar();
        builder.createStore(this._value.build(builder), _var.build(builder));
        this._llvm = builder.createLoad(_var.getLLVM());
        return this._llvm;
    }
}
