import {
  ExpressionAST,
  AssignmentAST,
  UnaryAST,
  BinaryAST,
  IdentifierAST,
  NumberAST,
  StringAST,
  ParameterAST,
  FunctionAST,
  FunctionCallAST,
  ClassAST,
  MemberAccessAST,
} from "../parser/AST";

import Expression, {
  LiteralExpression,
  IdentifierExpression,
  AssignmentExpression,
  FunctionCallExpression,
  ReturnExpression,
  MemberAccessExpression,
  OperatorAccessExpression,
} from "./Expression";
import FunctionExpression from "./expression/FunctionExpression";
import ClassExpression from "./expression/ClassExpression";

import AssignType from "./AssignType";
import Identifier from "./Identifier";
import Environment from "./Environment";
import Type from "./Type";
import {ExpressionThunk, TypeThunk} from "./Thunk";
import {voidType} from "./nativeTypes";

import CompilationError from "../common/CompilationError";
import SourceLocation from "../common/SourceLocation";
import ErrorInfo from "../common/ErrorInfo";

export default
class TypeEvaluator {

  constructor(public environment: Environment) {
  }

  evaluateExpressions(asts: ExpressionAST[]) {
    const expressions: ExpressionThunk[] = [];
    const errors: ErrorInfo[] = [];

    for (const ast of asts) {
      try {
        expressions.push(this.evaluate(ast));
      }
      catch (error) {
        if (error instanceof CompilationError) {
          errors.push(...error.infos);
        }
        else {
          throw error;
        }
      }
    }

    if (errors.length > 0) {
      throw new CompilationError(errors);
    }

    return expressions;
  }

  private evaluateImpl(ast: ExpressionAST): Expression|ExpressionThunk {
    if (ast instanceof AssignmentAST) {
      return this.evaluateAssignment(ast);
    }
    else if (ast instanceof UnaryAST) {
      return this.evaluateUnary(ast);
    }
    else if (ast instanceof BinaryAST) {
      return this.evaluateBinary(ast);
    }
    else if (ast instanceof IdentifierAST) {
      return this.evaluateIdentifier(ast);
    }
    else if (ast instanceof NumberAST) {
      return this.evalauteNumber(ast);
    }
    else if (ast instanceof StringAST) {
      return this.evaluateString(ast);
    }
    else if (ast instanceof FunctionAST) {
      return this.evaluateFunction(ast);
    }
    else if (ast instanceof FunctionCallAST) {
      return this.evaluateFunctionCall(ast);
    }
    else if (ast instanceof ClassAST) {
      return this.evaluateClass(ast);
    }
    else if (ast instanceof MemberAccessAST) {
      return this.evaluateMemberAccess(ast);
    }
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluate(ast: ExpressionAST) {
    return ExpressionThunk.resolve(this.evaluateImpl(ast));
  }

  evaluateAssignment(ast: AssignmentAST) {
    const varName = ast.left.name;
    const right = this.evaluate(ast.right).get();
    const type = (() => {
      switch (ast.declaration) {
      case "let":
        return AssignType.Constant;
      case "var":
        return AssignType.Variable;
      default:
        return AssignType.Assign;
      }
    })();
    this.environment.assignVariable(type, ast.left, right.type);
    return new AssignmentExpression(ast.location, type, ast.left, right);
  }

  evaluateUnary(ast: UnaryAST) {
    const operand = this.evaluate(ast.expression).get();

    const operatorAccess = new OperatorAccessExpression(ast.location, operand, ast.operator, 1);
    return new FunctionCallExpression(ast.location, operatorAccess, []);
  }

  evaluateBinary(ast: BinaryAST) {
    const left = this.evaluate(ast.left).get();
    const right = this.evaluate(ast.right).get();

    const operatorAccess = new OperatorAccessExpression(ast.location, left, ast.operator, 2);
    return new FunctionCallExpression(ast.location, operatorAccess, [right]);
  }

  evaluateIdentifier(ast: IdentifierAST) {
    const variable = this.environment.getVariable(ast.name);
    if (!variable) {
      throw CompilationError.typeError(
        `Variable '${ast.name}' not in scope`,
        ast.location
      );
    }
    return new IdentifierExpression(ast, variable.type.get());
  }

  evalauteNumber(ast: NumberAST) {
    return new LiteralExpression(ast.location, ast.value);
  }

  evaluateString(ast: StringAST) {
    return new LiteralExpression(ast.location, ast.value);
  }

  evaluateMemberAccess(ast: MemberAccessAST) {
    const obj = this.evaluate(ast.object).get();
    return new MemberAccessExpression(ast.location, obj, ast.member)
  }

  evaluateFunction(ast: FunctionAST, thisType = voidType): ExpressionThunk {
    const funcThunk = FunctionExpression.thunk(
      ast.location, this.environment, ast.name, thisType, ast.parameters,
      (env) => {
        return new TypeEvaluator(env).evaluateExpressions(ast.expressions).map(e => e.get());
      }
    );

    if (ast.addAsVariable) {
      const thunk = new ExpressionThunk(ast.location, () => {
        return new AssignmentExpression(ast.location, AssignType.Constant, ast.name, funcThunk.get());
      });
      this.environment.assignVariable(AssignType.Constant, ast.name, thunk.type);
      return thunk;
    } else {
      return funcThunk;
    }
  }

  evaluateFunctionCall(ast: FunctionCallAST) {
    const func = this.evaluate(ast.function).get();
    const args = this.evaluateExpressions(ast.arguments).map(e => e.get());
    return new FunctionCallExpression(ast.location, func, args, ast.isNewCall);
  }

  evaluateClass(ast: ClassAST) {
    const thunk = new ExpressionThunk(ast.location, () => {
      const expr = new ClassExpression(ast.location, ast.name);
      for (const memberAST of ast.members) {
        const member = this.evaluateFunction(memberAST, expr.type);
        expr.addMember(memberAST.name, member);
      }
      return expr;
    });
    this.environment.assignVariable(AssignType.Constant, ast.name, thunk.type);
    this.environment.addType(ast.name, thunk.type);
    return thunk;
  }
}
