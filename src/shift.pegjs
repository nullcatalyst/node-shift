// ============= //
// Shift Grammar //
// ============= //

{
    function lBinOp(lhs, [rhs, ...rest], operators) {
        const value = operators[rhs[1]](lhs, rhs[3]);

        if (rest.length > 0) {
            return lBinOp(value, rest, operators);
        } else {
            return value;
        }
    }

    const _ctx = new Context("shift");
}

Program
    = program:ExprList {
        program.forEach((expr) => _ctx.pushExpr(expr));
        return _ctx;
    }

ExprList
    = _ head:Expr tail:(_ Expr)* _ {
        const list = [head];
        tail.forEach(([,expr]) => list.push(expr));
        return list
    }
    / _ { return []; }

Expr
    = expr:ExprCast { return expr; }
    / KeywordVar _ name:Id _ "=" _ expr:ExprCast { return new ExprDeclVar(_ctx, name, expr); }

ExprCast
    = expr:ExprLogic _ KeywordAs _ type:Type { return new ExprCast(_ctx, expr, type); }
    / expr:ExprLogic

ExprLogic
    = head:ExprCmp tail:(_ (KeywordAnd / KeywordOr / KeywordXor) _ ExprCmp)+ {
        return lBinOp(head, tail, {
            "and": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.And, lhs, rhs),
            "or":  (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Or,  lhs, rhs),
            "xor": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Xor, lhs, rhs),
        });
    }
    / ExprCmp

ExprCmp
    = head:ExprAdd tail:(_ ("<" / ">" / "==" / "!=" / "<=" / ">=") _ ExprAdd)+ {
        return lBinOp(head, tail, {
            "<":  (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Lt, lhs, rhs),
            ">":  (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Gt, lhs, rhs),
            "==": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Eq, lhs, rhs),
            "!=": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Ne, lhs, rhs),
            "<=": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Le, lhs, rhs),
            ">=": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Ge, lhs, rhs),
        });
    }
    / ExprAdd

ExprAdd
    = head:ExprMul tail:(_ ("+" / "-") _ ExprMul)+ {
        return lBinOp(head, tail, {
            "+": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Add, lhs, rhs),
            "-": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Sub, lhs, rhs),
        });
    }
    / ExprMul

ExprMul
    = head:ExprAtom tail:(_ ("*" / "/" / "%") _ ExprAtom)+ {
        return lBinOp(head, tail, {
            "*": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Mul, lhs, rhs),
            "/": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Div, lhs, rhs),
            "%": (lhs, rhs) => new ExprOpBin(_ctx, OpBin.Rem, lhs, rhs),
        });
    }
    / ExprAtom

ExprAtom
    = "(" _ expr:Expr _ ")" { return expr; }
    / value:Bool            { return new ExprConstBool(_ctx, value); }
    / value:Int             { return new ExprConstInt(_ctx, value); }
    / value:Float           { return new ExprConstFloat(_ctx, value); }
    / !Keyword name:Id      { return new ExprVar(_ctx, name); }
    / DeclFunc
    / ExprBlock
    / ExprIf
    / ExprWhile

ExprIf
    = KeywordIf _ _cond:Expr _ _then:ExprBlock _else:(_ KeywordElse _ ExprBlock) { return new ExprIf(_ctx, _cond, _then, _else ? _else[3] : null); }

ExprWhile
    = KeywordWhile _ _cond:Expr _ _loop:ExprBlock _else:(_ KeywordElse _ ExprBlock) { return new ExprWhile(_ctx, _cond, _loop, _else ? _else[3] : null); }

ExprBlock
    = "{" exprs:ExprList "}" { return new ExprBlock(_ctx, exprs); }

DeclFunc
    = KeywordFunction name:(__ Id)? _ "(" _ ")" _ retType:(":" _ Type _)? "{" body:ExprList "}" {
        name = name ? name[1] : "";
        retType = retType ? retType[2] : _ctx.getTypeVoid();
        return new ExprDeclFunc(_ctx, name, _ctx.getTypeFunc(retType, []), body);
    }

DeclFuncArg
    = name:Id _ ":" _ type:Type { return new ExprDeclVar(_ctx, name, type); }

Id "identifier"
    = !Keyword [_a-z]i [_a-z0-9]i* { return text(); }

Int "integer"
    = [0-9]+ !"." { return parseInt(text(), 10); }

Float "float"
    = [0-9]+ "." [0-9]+ { return parseFloat(text()); }

Bool
    = KeywordTrue { return true; }
    / KeywordFalse { return false; }

Type
    = type:Id { return _ctx.getTypeByName(type); }

Keyword
    = KeywordIf
    / KeywordElse
    / KeywordWhile
    / KeywordBreak
    / KeywordContinue
    / KeywordFunction
    / KeywordReturn
    / KeywordVar
    / KeywordConst
    / KeywordAs
    / KeywordTrue
    / KeywordFalse
    / KeywordNot
    / KeywordAnd
    / KeywordOr
    / KeywordXor

KeywordIf       = "if"       !Id { return text(); }
KeywordElse     = "else"     !Id { return text(); }
KeywordWhile    = "while"    !Id { return text(); }
KeywordBreak    = "break"    !Id { return text(); }
KeywordContinue = "continue" !Id { return text(); }
KeywordFunction = "function" !Id { return text(); }
KeywordReturn   = "return"   !Id { return text(); }
KeywordVar      = "var"      !Id { return text(); }
KeywordConst    = "const"    !Id { return text(); }
KeywordAs       = "as"       !Id { return text(); }
KeywordTrue     = "true"     !Id { return text(); }
KeywordFalse    = "false"    !Id { return text(); }
KeywordNot      = "not"      !Id { return text(); }
KeywordAnd      = "and"      !Id { return text(); }
KeywordOr       = "or"       !Id { return text(); }
KeywordXor      = "xor"      !Id { return text(); }

__ "whitespace" = [ \t\n\r]+
_  "whitespace" = [ \t\n\r]*
