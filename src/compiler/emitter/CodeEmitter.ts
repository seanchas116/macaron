import Expression, {
  IdentifierExpression,
  LiteralExpression,
  FunctionCallExpression,
  AssignmentExpression,
  NewVariableExpression,
  ReturnExpression,
  MemberAccessExpression,
  OperatorAccessExpression,
  IfExpression,
  GenericsExpression,
  GenericsCallExpression,
  LazyExpression
} from "../typing/Expression";

import AssignableExpression, {
  IdentifierAssignableExpression
} from "../typing/AssignableExpression";

import TypeExpression from "../typing/TypeExpression";

import {NativeOperator, MethodOperator} from "../typing/Operator";

import FunctionExpression from "../typing/expression/FunctionExpression";
import FunctionBodyExpression from "../typing/expression/FunctionBodyExpression";
import ClassExpression from "../typing/expression/ClassExpression";

import {Constness} from "../typing/Member";
import Identifier from "../typing/Identifier";

export default
class CodeEmitter {

  prependings: string[] = [];

  constructor(public indentationWidth = 2, public indentationLevel = 0) {
  }

  emitTopLevelExpressions(expressions: Expression[]) {
    return expressions
      .map(e => this.emitTopLevelExpression(e))
      .join("");
  }

  get indentation() {
    return " ".repeat(this.indentationWidth * this.indentationLevel);
  }

  emitTopLevelExpression(expr: Expression) {
    const line = this.emitExpression(expr, true);
    const result = [...this.prependings, line]
      .map(line => `${this.indentation}${line};\n`)
      .join("");
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
    else if (expr instanceof NewVariableExpression) {
      return this.emitNewVariable(expr);
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
    else if (expr instanceof GenericsExpression) {
      return this.emitExpression(expr.expression);
    }
    else if (expr instanceof GenericsCallExpression) {
      return this.emitExpression(expr.value);
    }
    else if (expr instanceof LazyExpression) {
      return this.emitExpression(expr.value);
    }
    else {
      return "";
    }
  }

  emitAssignable(expr: AssignableExpression): string {
    if (expr instanceof IdentifierAssignableExpression) {
      return this.emitIdentifierAssignable(expr);
    }
    else {
      throw new Error(`Not supported Expression: ${expr.constructor.name}`);
    }
  }

  emitIdentifierAssignable(expr: IdentifierAssignableExpression) {
    return expr.name.name;
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
      .map(p => this.emitAssignable(p))
      .join(", ");

    const body = this.emitFunctionBody(expr.body);

    return `(${params}) => {\n${body}\n}`;
  }

  emitClassMemberIndented(expr: Expression) {
    return this.indentation + this.emitClassMember(expr);
  }

  emitClassMember(expr: Expression): string {
    if (expr instanceof FunctionExpression) {
      return this.emitClassMethod(expr);
    } else if (expr instanceof LazyExpression) {
      return this.emitClassMember(expr.value);
    } else {
      throw new Error(`Not supported expression: ${expr.constructor.name}`);
    }
  }

  emitClassMethod(expr: FunctionExpression) {
    const params = expr.parameters
      .map(p => this.emitAssignable(p))
      .join(", ");

    const body = this.emitFunctionBody(expr.body);

    return `${expr.name.name}(${params}) ${body}`;
  }

  emitClass(expr: ClassExpression) {
    const emitter = this.indented();
    const body = expr.members
      .map(member => emitter.emitClassMemberIndented(member))
      .join("\n");
    let superclass = "";
    if (expr.superExpression) {
      superclass = " extends " + this.emitExpression(expr.superValueExpression);
    }

    return `class ${expr.name.name}${superclass} {\n${body}\n${this.indentation}}`;
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
    const value = this.emitExpression(expr.value);
    const name = this.emitAssignable(expr.assignable);

    return `${name} = ${value}`;
  }

  emitNewVariable(expr: NewVariableExpression) {
    const value = this.emitExpression(expr.value);
    const name = this.emitAssignable(expr.assignable);

    this.prependings.push(`let ${name}`);
    return `${name} = ${value}`;
  }

  emitReturn(expr: ReturnExpression) {
    return `return ${this.emitExpression(expr.expression)}`;
  }

  emitMemberAccess(expr: MemberAccessExpression) {
    const obj = this.emitExpression(expr.object);
    return `${obj}.${expr.member.name}`;
  }

  emitFunctionBody(expr: FunctionBodyExpression) {
    return this.emitBlockWithReturn(expr.expressions);
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
      this.prependings.push(`var ${expr.tempVarName}`);
      const ifTrue = this.emitBlockWithAssign(expr.ifTrue, expr.tempVarName);
      if (expr.ifFalse.length > 0) {
        const ifFalse = this.emitBlockWithAssign(expr.ifFalse, expr.tempVarName);
        this.prependings.push(`if (${cond}) ${ifTrue} else ${ifFalse}`);
      }
      else {
        this.prependings.push(`if (${cond}) ${ifTrue}`);
      }
      return expr.tempVarName;
    }
  }

  emitBlock(exprs: Expression[]) {
    const body = this.indented().emitTopLevelExpressions(exprs);
    return `{\n${body}\n${this.indentation}}`;
  }

  emitBlockWithAssign(exprs: Expression[], varName: string) {
    if (exprs.length === 0) {
      return this.emitBlock([]);
    }
    const len = exprs.length;
    const last = exprs[len - 1];
    const emittingExprs = [
      ...exprs.slice(0, len - 1),
      new AssignmentExpression(
        last.range,
        new IdentifierAssignableExpression(last.range, new Identifier(varName, last.range), null),
        last
      )
    ];
    return this.emitBlock(emittingExprs);
  }

  emitBlockWithReturn(exprs: Expression[]) {
    if (exprs.length === 0) {
      return this.emitBlock([]);
    }
    const len = exprs.length;
    const last = exprs[len - 1];
    const emittingExprs = [
      ...exprs.slice(0, len - 1),
      new ReturnExpression(last.range, last)
    ];
    return this.emitBlock(emittingExprs);
  }

  indented() {
    return new CodeEmitter(this.indentationWidth, this.indentationLevel + 1);
  }
}
