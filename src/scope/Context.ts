import * as llvm from "llvmc";

import { Scope } from "./Scope";
import { MultiMap } from "../util/MultiMap";
import { Type } from "../type/Type";
import { TypeVoid } from "../type/TypeVoid";
import { TypeBool } from "../type/TypeBool";
import { TypeInt32 } from "../type/TypeInt32";
import { TypeFloat32 } from "../type/TypeFloat32";
import { TypeFunc } from "../type/TypeFunc";
import { Expr } from "../expr/Expr";

export class Context {
    private _ctx: llvm.Context;
    private _mod: llvm.Module;
    private _bld: llvm.Builder;
    private _exe: llvm.ExecutionEngine | null;

    private _types: { [name: string]: Type };
    private _typeFuncs: MultiMap<Type[], TypeFunc>;
    private _typeVoid: TypeVoid;
    private _typeBool: TypeBool;
    private _typeInt32: TypeInt32;
    private _typeFloat32: TypeFloat32;

    private _exprs: Expr[];

    constructor(name: string) {
        this._ctx = llvm.Context.create();
        this._mod = llvm.Module.create(name, this._ctx);
        this._bld = llvm.Builder.create(this._ctx);
        this._exe = null;

        this._types = {};
        this._typeFuncs = new MultiMap();
        this._exprs = [];

        this._typeVoid = new TypeVoid(this);
        this._typeBool = new TypeBool(this);
        this._typeInt32 = new TypeInt32(this);
        this._typeFloat32 = new TypeFloat32(this);

        this._types["Bool"] = this._typeBool;
        this._types["Int32"] = this._typeInt32;
        this._types["Float32"] = this._typeFloat32;
    }

    free(): void {
        // Free the builder
        this._bld.free();
        this._bld = null;

        // Free the executable engine
        if (this._exe !== null) {
            this._exe.free();
            this._exe = null;
        }

        // Free the module
        this._mod.free();
        this._mod = null;

        // Dereference the context
        this._ctx = null;
    }

    createLLVMVoidType(): llvm.Type { return llvm.VoidType.create(this._ctx); }
    createLLVMInt1Type(): llvm.Type { return llvm.IntType.createInt1(this._ctx); }
    createLLVMInt8Type(): llvm.Type { return llvm.IntType.createInt8(this._ctx); }
    createLLVMInt16Type(): llvm.Type { return llvm.IntType.createInt16(this._ctx); }
    createLLVMInt32Type(): llvm.Type { return llvm.IntType.createInt32(this._ctx); }
    createLLVMInt64Type(): llvm.Type { return llvm.IntType.createInt64(this._ctx); }
    createLLVMFloat32Type(): llvm.Type { return llvm.FloatType.createFloat(this._ctx); }
    createLLVMFloat64Type(): llvm.Type { return llvm.FloatType.createDouble(this._ctx); }

    getTypeByName(name: string) { return this._types[name]; }

    getTypeVoid() { return this._typeVoid; }
    getTypeBool() { return this._typeBool; }
    getTypeInt32() { return this._typeInt32; }
    getTypeFloat32() { return this._typeFloat32; }

    getTypeFunc(retType: Type, argTypes: Type[]): TypeFunc {
        const list = [retType, ...argTypes];
        let type = this._typeFuncs.get(list);
        if (!type) {
            type = new TypeFunc(this, retType, argTypes);
            this._typeFuncs.set(list, type);
        }
        return type;
    }

    findFunction(name: string): llvm.Function | null { return this._mod.getFunction(name) || null; }
    createFunction(name: string, type: TypeFunc): llvm.Function { return this._mod.addFunction(name, type.getLLVM()); }
    appendBlockToFunction(name: string, func: llvm.Function): llvm.BasicBlock { return func.appendBasicBlock(name, this._ctx); }

    getExprs(): Expr[] {
        return this._exprs.slice();
    }

    pushExpr(expr: Expr): void {
        this._exprs.push(expr);
    }

    initTarget(): this {
        llvm.linkInMCJIT();
        llvm.linkInInterpreter();
        llvm.initX86Target();

        // Get the target triple and data layout for the default target (i.e., the
        // target for the current host machine).
        let targetTriple = llvm.TargetMachine.getDefaultTargetTriple();
        let target = llvm.Target.getFromTriple(targetTriple);
        let targetMachine = llvm.TargetMachine.create(target, targetTriple);
        let dataLayout = targetMachine.createDataLayout();

        // Set the target triple and data layout for the module.
        this._mod.setTarget(targetTriple);
        this._mod.setDataLayout(dataLayout.toString());

        return this;
    }

    validate(): this {
        const scope = new Scope(null, true);
        for (let expr of this._exprs) {
            expr.validate(scope);
        }

        return this;
    }

    build(): this {
        const builder = llvm.Builder.create(this._ctx);
        for (let expr of this._exprs) {
            expr.build(builder);
        }

        return this;
    }

    optimize(): this {
        const fpass = llvm.FunctionPassManager.create(this._mod)
            .addPromoteMemoryToRegisterPass()
            .addInstructionCombiningPass()
            .addReassociatePass()
            .addGVNPass()
            .addCFGSimplificationPass();

        fpass.initialize();
        for (let func of this._mod.functions()) {
            fpass.run(func);
        }
        fpass.finalize();
        fpass.free();

        const mpass = llvm.ModulePassManager.create()
            .addConstantMergePass()
            .addFunctionInliningPass()
            .addGlobalDCEPass();

        mpass.run(this._mod);
        mpass.free();

        return this;
    }

    run(funcName: string, ...args: llvm.GenericValue[]): llvm.GenericValue {
        if (this._exe === null) {
            this._exe = llvm.ExecutionEngine.create(this._mod);
        }

        return this._exe.run(this.findFunction(funcName), args);
    }

    print() {
        return this._mod.toString();
    }

    writeBitcodeToFile(fileName: string) {
        this._mod.writeBitcodeToFile(fileName);
    }
}
