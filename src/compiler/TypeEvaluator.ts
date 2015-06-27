import {
  ExpressionAST,
  AssignmentAST,
  BinaryAST,
  IdentifierAST,
  NumberAST,
  StringAST,
  FunctionAST,
  FunctionCallAST
} from "./AST";

import {
  Expression,
  BinaryExpression,
  NumberExpression,
  StringExpression,
  FunctionExpression,
  IdentifierExpression,
  FunctionCallExpression,
  ReturnExpression
} from "./Expression";

import Environment from "./Environment";
import DeclarationType from "./DeclarationType";
import TypeCheckError from "./TypeCheckError";
import {
  FunctionType,
  MetaType
} from "./Type";
import {
  voidType
} from "./nativeTypes";

function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].type;
}

export default
class TypeEvaluator {

  constructor(public environment: Environment) {

  }

  evaluateExpressions(asts: ExpressionAST[]) {
    const expressions: Expression[] = [];

    for (const ast of asts) {
      // TODO: catch and collect errors
      expressions.push(this.evaluate(ast));
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
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateAssignment(ast: AssignmentAST) {
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

    return this.environment.addVariableExpression(type, ast.left, right);
  }

  evaluateBinary(ast: BinaryAST) {
    const left = this.evaluate(ast.left);
    const right = this.evaluate(ast.right);
    if (left.type !== right.type) {
      throw new TypeCheckError(
        `Cannot perform "${ast.operator.name}" operation between "${left.type}" and "right.type"`,
        ast.operator.location
      );
    }
    return new BinaryExpression(ast.operator.name, left, right, ast.location);
  }

  evaluateIdentifier(ast: IdentifierAST) {
    return this.environment.getVariableExpression(ast);
  }

  evalauteNumber(ast: NumberAST) {
    return new NumberExpression(ast.value, ast.location);
  }

  evaluateString(ast: StringAST) {
    return new StringExpression(ast.value, ast.location);
  }

  evaluateFunction(ast: FunctionAST) {
    const subEnv = new Environment(this.environment);
    const params: IdentifierExpression[] = [];
    for (const {name, type} of ast.parameters) {
      const metaType = this.evaluate(type).type;
      if (metaType instanceof MetaType) {
        subEnv.addVariable(DeclarationType.Constant, name, metaType.type);
        params.push(new IdentifierExpression(name.name, name.location, metaType.type));
      }
      else {
        throw new TypeCheckError(
          `Provided expression is not a type`,
          type.location
        );
      }
    }
    const expressions = new TypeEvaluator(subEnv).evaluateExpressions(ast.expressions);
    const paramTypes = params.map(p => p.type);
    const type = new FunctionType(voidType, paramTypes, [], returnType(expressions));
    return new FunctionExpression(params, expressions, ast.location, type);
  }

  evaluateFunctionCall(ast: FunctionCallAST) {
    const func = this.evaluate(ast.function);
    const funcType = func.type;

    const args = this.evaluateExpressions(ast.arguments);

    if (funcType instanceof FunctionType) {
      if (args.length < funcType.minParamCount || funcType.maxParamCount < args.length) {
        throw new TypeCheckError(
          `Cannot pass ${args.length} arguments for ${funcType.minParamCount}...${funcType.maxParamCount} parameter function`,
          ast.location
        );
      }
      funcType.parameters.forEach((type, i) => {
        if (!args[i].type.isCastableTo(type)) {
          throw new TypeCheckError(
            `Cannot pass '${args[i].type.name}' to '${type.name}'`,
            ast.arguments[i].location
          );
        }
      });

      return new FunctionCallExpression(func, args, ast.location);
    }
    else {
      throw new TypeCheckError(
        `${funcType.name} is not an function`,
        ast.location
      );
    }
  }
}
