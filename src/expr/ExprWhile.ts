import * as llvm from "llvmc";

import { Expr } from "./Expr";
import { Context } from "../scope/Context";
import { Scope } from "../scope/Scope";
import { Type } from "../type/Type";

export class ExprWhile extends Expr {
    private _cond: Expr;
    private _loop: Expr;
    private _else: Expr | null;

    constructor(ctx: Context, _cond: Expr, _loop: Expr, _else?: Expr | null) {
        super(ctx);

        this._cond = _cond;
        this._loop = _loop;
        this._else = _else || null;
    }

    validate(_scope: Scope) {
        const condScope = new Scope(_scope);
        this._cond.validate(condScope);

        const loopScope = new Scope(condScope);
        this._loop.validate(loopScope);

        if (this._else !== null) {
            const elseScope = new Scope(condScope);
            this._else.validate(elseScope);
        }

        this._type = this._loop.getType();
    }

    build(builder: llvm.Builder): llvm.Value {
        const llvmFunc = builder.getInsertBlock().getParent();

        const condBlock = this._ctx.appendBlockToFunction("while.cond", llvmFunc);
        const loopBlock = this._ctx.appendBlockToFunction("while.loop", llvmFunc);
        const elseBlock = this._ctx.appendBlockToFunction("while.else", llvmFunc);
        const endBlock = this._ctx.appendBlockToFunction("while.end", llvmFunc);

        // Jump to the condition block
        builder.createBr(condBlock);

        // Check condition
        builder.positionAtEnd(condBlock);
        this._cond.build(builder);
        builder.createCondBr(this._cond.getLLVM(), loopBlock, elseBlock);

        // Loop block
        builder.positionAtEnd(loopBlock);
        const loopValue = this._loop.build(builder);
        this._cond.build(builder);
        builder.createCondBr(this._cond.getLLVM(), loopBlock, endBlock);

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

        const phi = builder.createPhi(llvmType, "while.phi");
        phi.addIncoming([loopValue, elseValue], [loopBlock, elseBlock]);

        this._llvm = phi;
        return this._llvm;
    }
}
