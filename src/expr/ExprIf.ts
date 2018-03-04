import * as llvm from "llvmc";

import { Context } from "../scope/Context";
import { Expr } from "./Expr";
import { Type } from "../type/Type";
import { Scope } from "../scope/Scope";

export class ExprIf extends Expr {
    private _cond: Expr;
    private _then: Expr;
    private _else: Expr | null;

    constructor(ctx: Context, _cond: Expr, _then: Expr, _else: Expr | null) {
        super(ctx);

        this._cond = _cond;
        this._then = _then;
        this._else = _else;
    }

    validate(_scope: Scope) {
        const condScope = new Scope(_scope);
        this._cond.validate(condScope);

        const thenScope = new Scope(condScope);
        this._then.validate(thenScope);

        if (this._else !== null) {
            const elseScope = new Scope(condScope);
            this._else.validate(elseScope);
        }

        this._type = this._then.getType();
    }

    build(builder: llvm.Builder): llvm.Value {
        this._cond.build(builder);

        const llvmFunc = builder.getInsertBlock().getParent();
        const thenBlock = this._ctx.appendBlockToFunction("if.then", llvmFunc);
        const elseBlock = this._ctx.appendBlockToFunction("if.else", llvmFunc);
        const endBlock = this._ctx.appendBlockToFunction("if.end", llvmFunc);

        // Check condition
        builder.createCondBr(this._cond.getLLVM(), thenBlock, elseBlock);

        // Then block
        builder.positionAtEnd(thenBlock);
        const thenValue = this._then.build(builder);
        builder.createBr(endBlock);

        // Else block
        let elseValue: llvm.Value;
        const llvmType = this.getType().getLLVM();
        builder.positionAtEnd(elseBlock);
        if (this._else !== null) {
            elseValue = this._else.build(builder);
        } else {
            elseValue = llvm.Value.getUndef(llvmType);
        }
        builder.createBr(endBlock);

        // End block
        builder.positionAtEnd(endBlock);
        const phi = builder.createPhi(llvmType, "if.phi");
        phi.addIncoming([thenValue, elseValue], [thenBlock, elseBlock]);

        this._llvm = phi;
        return this._llvm;
    }
}
