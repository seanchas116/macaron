import Expression, {
  IdentifierExpression,
  LiteralExpression,
  FunctionCallExpression,
  AssignmentExpression,
  ReturnExpression,
  MemberAccessExpression,
  OperatorAccessExpression,
  IfExpression,
} from "../typing/Expression";

import {NativeOperator, MethodOperator} from "../typing/Operator";

import FunctionExpression from "../typing/expression/FunctionExpression";
import FunctionBodyExpression from "../typing/expression/FunctionBodyExpression";
import ClassExpression from "../typing/expression/ClassExpression";

import AssignType from "../typing/AssignType";
import Identifier from "../typing/Identifier";

export default
class CodeEmitter {

  prependings: string[] = [];

  constructor(public indentationWidth = 2, public indentationLevel = 0) {
  }

  get indentation() {
    return " ".repeat(this.indentationWidth * this.indentationLevel);
  }

  addPrepending(line: string) {
    this.prependings.push(`${this.indentation}${line};\n`);
  }

  emitTopLevelExpressions(expressions: Expression[]) {
    return expressions
      .map(e => this.emitTopLevelExpression(e))
      .join("");
  }

  emitTopLevelExpression(expr: Expression) {
    const line = this.emitExpression(expr, true);
    const result = [...this.prependings, `${this.indentation}${line};\n`].join("");
    this.prependings = [];
    return result;
  }

  emitExpression(expr: Expression, topLevel = false): string {
    if (expr instanceof IdentifierExpression) {
      return this.emitIdentifier(expr);
    }
    else if (expr instanceof LiteralExpression) {
      return this.emitLiteral(expr);
    }
    else if (expr instanceof FunctionExpression) {
      return this.emitFunction(expr);
    }
    else if (expr instanceof FunctionCallExpression) {
      return this.emitFunctionCall(expr);
    }
    else if (expr instanceof AssignmentExpression) {
      return this.emitAssignment(expr);
    }
    else if (expr instanceof ReturnExpression) {
      return this.emitReturn(expr);
    }
    else if (expr instanceof ClassExpression) {
      return this.emitClass(expr);
    }
    else if (expr instanceof MemberAccessExpression) {
      return this.emitMemberAccess(expr);
    }
    else if (expr instanceof FunctionBodyExpression) {
      return this.emitFunctionBody(expr);
    }
    else if (expr instanceof IfExpression) {
      return this.emitIf(expr, topLevel);
    }
    else {
      throw new Error(`Not supported expression: ${expr.constructor.name}`);
    }
  }

  emitIdentifier(expr: IdentifierExpression) {
    return expr.name.name;
  }

  emitLiteral(expr: LiteralExpression) {
    if (typeof expr.value === "string") {
      return JSON.stringify(expr.value);
    }
    else {
      return String(expr.value);
    }
  }

  emitFunction(expr: FunctionExpression) {
    const params = expr.parameters
      .map(p => p.name)
      .join(", ");

    const body = this.emitFunctionBody(expr.body);

    return `(${params}) => {\n${body}\n}`;
  }

  emitClassMember(expr: Expression) {
    if (expr instanceof FunctionExpression) {
      return this.emitClassMethod(expr);
    } else {
      throw new Error(`Not supported expression: ${expr.constructor.name}`);
    }
  }

  emitClassMethod(expr: FunctionExpression) {
    const params = expr.parameters
      .map(p => p.name)
      .join(", ");

    const body = this.emitFunctionBody(expr.body);

    return `${expr.name.name}(${params}) {\n${body}\n}`;
  }

  emitClass(expr: ClassExpression) {
    const emitter = this.indented();
    const body = expr.members
      .map(member => member.get())
      .map(member => emitter.emitClassMember(member))
      .join("\n");

    return `class ${expr.name.name} {\n${body}\n}`;
  }

  emitFunctionCall(expr: FunctionCallExpression) {
    const args = expr.arguments.map(expr => this.emitExpression(expr)).join(", ");
    const funcExpr = expr.function;

    if (funcExpr instanceof OperatorAccessExpression) {
      if (expr.isNewCall) {
        throw new Error("operator cannot be called as constructor");
      }

      const operator = funcExpr.operator;
      const obj = this.emitExpression(funcExpr.object);

      if (operator instanceof MethodOperator) {
        return `${obj}.${operator.methodName}(${args})`;
      } else if (operator instanceof NativeOperator) {
        if (expr.arguments.length === 0) {
          return `${operator.nativeOperatorName}${obj}`;
        } else {
          return `${obj} ${operator.nativeOperatorName} ${args}`;
        }
      } else {
        throw new Error(`Unknown Operator class: ${operator.constructor.name}`);
      }
    } else {
      const func = this.emitExpression(funcExpr);

      if (expr.isNewCall) {
        return `new ${func}(${args})`;
      } else {
        return `${func}(${args})`;
      }
    }
  }

  emitAssignment(expr: AssignmentExpression) {
    // TODO: AssignmentExpression must be top-level

    const value = this.emitExpression(expr.value);
    const name = expr.assignable.name;

    switch (expr.assignType) {
    case AssignType.Variable:
      return `let ${name} = ${value}`;
    case AssignType.Constant:
      return `const ${name} = ${value}`;
    default:
      return `${name} = ${value}`;
    }
  }

  emitReturn(expr: ReturnExpression) {
    return `return ${this.emitExpression(expr.expression)}`;
  }

  emitMemberAccess(expr: MemberAccessExpression) {
    const obj = this.emitExpression(expr.object);
    return `${obj}.${expr.member.name}`;
  }

  emitFunctionBody(expr: FunctionBodyExpression) {
    return this.emitBlock(expr.expressions);
  }

  emitIf(expr: IfExpression, topLevel: boolean) {
    const cond = this.emitExpression(expr.condition);

    if (topLevel) {
      const ifTrue = this.emitBlock(expr.ifTrue);
      if (expr.ifFalse.length > 0) {
        const ifFalse = this.emitBlock(expr.ifFalse);
        return `if (${cond}) ${ifTrue} else ${ifFalse}`;
      }
      else {
        return `if (${cond}) ${ifTrue}`;
      }
    }
    else {
      this.addPrepending(`var ${expr.tempVarName}`);
      const ifTrue = this.emitBlockWithAssign(expr.ifTrue, expr.tempVarName);
      if (expr.ifFalse.length > 0) {
        const ifFalse = this.emitBlockWithAssign(expr.ifFalse, expr.tempVarName);
        this.addPrepending(`if (${cond}) ${ifTrue} else ${ifFalse}`);
      }
      else {
        this.addPrepending(`if (${cond}) ${ifTrue}`);
      }
      return expr.tempVarName;
    }
  }

  emitBlock(exprs: Expression[]) {
    const body = this.indented().emitTopLevelExpressions(exprs);
    return `{\n${body}\n}`;
  }

  emitBlockWithAssign(exprs: Expression[], varName: string) {
    if (exprs.length === 0) {
      return this.emitBlock([]);
    }
    const last = exprs[exprs.length - 1];
    const emittingExprs = [
      ...exprs.slice(0, exprs.length - 1),
      new AssignmentExpression(
        last.location,
        AssignType.Assign,
        new Identifier(varName, last.location),
        last
      )
    ];
    return this.emitBlock(emittingExprs);
  }

  indented() {
    return new CodeEmitter(this.indentationWidth, this.indentationLevel + 1);
  }
}
