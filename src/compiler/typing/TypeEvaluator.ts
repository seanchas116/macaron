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

import Identifier from "./Identifier";
import Environment from "./Environment";
import DeclarationType from "./DeclarationType";

import Type from "./Type";

import ExpressionThunk from "./ExpressionThunk";
import TypeThunk from "./TypeThunk";

import {voidType} from "./nativeTypes";

import CompilationError from "../common/CompilationError";
import SourceLocation from "../common/SourceLocation";
import ErrorInfo from "../common/ErrorInfo";

export default
class TypeEvaluator {

  constructor(public environment: Environment) {
  }

  addVariable(type: DeclarationType, name: Identifier, valueType: Type|TypeThunk) {
    const valueTypeThunk = TypeThunk.resolve(valueType);
    const variable = this.environment.getVariable(name.name);
    if (type === DeclarationType.Assignment) {
      if (!variable) {
        throw CompilationError.typeError(
          `Variable '${name.name}' not in scope`,
          name.location
        );
      }
      if (variable.isConstant) {
        throw CompilationError.typeError(
          `Variable '${name.name}' is constant`,
          name.location
        );
      }
      if (!valueTypeThunk.get().isCastableTo(variable.type.get())) {
        throw CompilationError.typeError(
          `Cannot assign '${valueType}' to type '${variable.type}'`,
          name.location
        );
      }
    } else {
      if (this.environment.getOwnVariable(name.name)) {
        throw CompilationError.typeError(
          `Variable '${name.name}' already defined`,
          name.location
        );
      }
      this.environment.addVariable(name.name, valueTypeThunk, type);
    }
  }

  addType(name: Identifier, type: Type) {
    if (this.environment.getOwnType(name.name)) {
      throw CompilationError.typeError(
        `Type '${name.name}' already defined`,
        name.location
      );
    }
    this.environment.addType(name.name, type);
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

  evaluate(ast: ExpressionAST): ExpressionThunk {
    const expr: Expression|ExpressionThunk = (() => {
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
    })();

    return ExpressionThunk.resolve(expr);
  }

  evaluateAssignment(ast: AssignmentAST) {
    const varName = ast.left.name;
    const right = this.evaluate(ast.right).get();
    const type = (() => {
      switch (ast.declaration) {
      case "let":
        return DeclarationType.Constant;
      case "var":
        return DeclarationType.Variable;
      default:
        return DeclarationType.Assignment;
      }
    })();
    this.addVariable(type, ast.left, right.type);
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
    const member = new Identifier(ast.member.location, ast.member.name);
    return new MemberAccessExpression(ast.location, obj, member)
  }

  evaluateFunction(ast: FunctionAST): Expression|ExpressionThunk {
    const subEnv = new Environment(this.environment);
    const params: [Identifier, Type][] = [];
    for (const {name, type: typeName} of ast.parameters) {
      const type = subEnv.getType(typeName.name).get();
      if (!type) {
        throw CompilationError.typeError(
          `Type '${typeName}' not in scope`,
          typeName.location
        );
      }
      subEnv.addVariable(name.name, type, DeclarationType.Constant);
      params.push([name, type]);
    }
    const getExpr = () => {
      const body = new TypeEvaluator(subEnv).evaluateExpressions(ast.expressions).map(e => e.get());
      return new FunctionExpression(ast.location, ast.name, params, body);
    }

    if (ast.addAsVariable) {
      const thunk = new ExpressionThunk(ast.location, () => {
        return new AssignmentExpression(ast.location, DeclarationType.Constant, ast.name, getExpr());
      });
      this.addVariable(DeclarationType.Constant, ast.name, thunk.getType());
      return thunk;
    } else {
      return getExpr();
    }
  }

  evaluateFunctionCall(ast: FunctionCallAST) {
    const func = this.evaluate(ast.function).get();
    const args = this.evaluateExpressions(ast.arguments).map(e => e.get());
    return new FunctionCallExpression(ast.location, func, args, ast.isNewCall);
  }

  evaluateClass(ast: ClassAST) {
    const members = this.evaluateExpressions(ast.members).map(e => e.get());
    const expr = new ClassExpression(ast.location, ast.name, members);
    this.addVariable(DeclarationType.Constant, ast.name, expr.type);
    this.addType(ast.name, expr.type);
    return expr;
  }
}
