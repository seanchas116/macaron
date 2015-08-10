import {
  ExpressionAST,
  AssignmentAST,
  BinaryAST,
  IdentifierAST,
  NumberAST,
  StringAST,
  ParameterAST,
  FunctionAST,
  FunctionCallAST,
  ConstructorCallAST,
  ClassAST,
  ClassMethodAST,
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
} from "./expression/Expression";
import FunctionExpression from "./expression/FunctionExpression";
import ClassExpression from "./expression/ClassExpression";

import Identifier from "./Identifier";
import Environment from "./Environment";
import DeclarationType from "./DeclarationType";
import CompilationError from "../common/CompilationError";
import Type from "./Type";
import {voidType} from "./nativeTypes";
import SourceLocation from "../common/SourceLocation";
import ErrorInfo from "../common/ErrorInfo";

export default
class TypeEvaluator {

  constructor(public environment: Environment) {
  }

  evaluateExpressions(asts: ExpressionAST[]) {
    const expressions: Expression[] = [];
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

  evaluate(ast: ExpressionAST): Expression {
    if (ast instanceof AssignmentAST) {
      return this.evaluateAssignment(ast);
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
    else if (ast instanceof ConstructorCallAST) {
      return this.evaluateConstructorCall(ast);
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

  evaluateAssignment(ast: AssignmentAST) {
    const varName = ast.left.name;
    const right = this.evaluate(ast.right);
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
    const variable = this.environment.getVariable(varName);
    if (type === DeclarationType.Assignment) {
      if (!variable) {
        throw CompilationError.typeError(
          `Variable '${varName}' not in scope`,
          ast.left.location
        );
      }
      if (!right.type.isCastableTo(variable.type)) {
        throw CompilationError.typeError(
          `Cannot assign '${right.type}' to ${variable.type}`,
          ast.left.location
        );
      }
    } else {
      if (this.environment.getOwnVariable(varName)) {
        throw CompilationError.typeError(
          `Variable ${varName} already defined`,
          ast.left.location
        );
      }
      this.environment.addVariable(varName, right.type, type);
    }
    return new AssignmentExpression(ast.location, type, ast.left, right);
  }

  evaluateBinary(ast: BinaryAST) {
    const left = this.evaluate(ast.left);
    const right = this.evaluate(ast.right);

    const operatorAccess = new OperatorAccessExpression(ast.location, left, ast.operator, 2);
    return new FunctionCallExpression(ast.location, operatorAccess, [right]);
  }

  evaluateIdentifier(ast: IdentifierAST) {
    const type = this.environment.getType(ast.name);
    if (!type) {
      throw CompilationError.typeError(
        `Variable '${ast.name}' not in scope`,
        ast.location
      );
    }
    return new IdentifierExpression(ast, type);
  }

  evalauteNumber(ast: NumberAST) {
    return new LiteralExpression(ast.location, ast.value);
  }

  evaluateString(ast: StringAST) {
    return new LiteralExpression(ast.location, ast.value);
  }

  evaluateMemberAccess(ast: MemberAccessAST) {
    const obj = this.evaluate(ast.object);
    const member = new Identifier(ast.member.location, ast.member.name);
    return new MemberAccessExpression(ast.location, obj, member)
  }

  evaluateFunction(ast: FunctionAST) {
    const subEnv = new Environment(this.environment);
    const params: [Identifier, Type][] = [];
    for (const {name, type: typeName} of ast.parameters) {
      const type = subEnv.getType(typeName.name);
      if (!type) {
        throw CompilationError.typeError(
          `Type '${typeName}' not in scope`,
          typeName.location
        );
      }
      params.push([name, type]);
    }
    const body = new TypeEvaluator(subEnv).evaluateExpressions(ast.expressions);
    return new FunctionExpression(ast.location, ast.name, params, body);
  }

  evaluateFunctionCall(ast: FunctionCallAST) {
    const func = this.evaluate(ast.function);
    const args = this.evaluateExpressions(ast.arguments);
    return new FunctionCallExpression(ast.location, func, args, false);
  }

  evaluateConstructorCall(ast: ConstructorCallAST) {
    const func = this.evaluate(ast.function);
    const args = this.evaluateExpressions(ast.arguments);
    return new FunctionCallExpression(ast.location, func, args, true);
  }

  evaluateClass(ast: ClassAST) {
    const members = this.evaluateExpressions(ast.members);
    return new ClassExpression(ast.location, ast.name, members);
  }
}
