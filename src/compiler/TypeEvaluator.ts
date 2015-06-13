import {
  ExpressionAST,
  AssignmentAST,
  BinaryAST,
  IdentifierAST,
  NumberAST,
  FunctionAST,
  FunctionCallAST
} from "./AST";

import {
  Expression,
  OperatorExpression,
  NumberExpression,
  FunctionExpression,
  IdentifierExpression,
  FunctionCallExpression
} from "./Expression";

import Environment from "./Environment";
import DeclarationType from "./DeclarationType";
import TypeCheckError from "./TypeCheckError";
import {
  FunctionType,
  MetaType
} from "./Type";

function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].type;
}

export default
class TypeEvaluator {

  evaluateExpressions(asts: ExpressionAST[], env: Environment) {
    const expressions: Expression[] = [];

    for (const ast of asts) {
      // TODO: catch and collect errors
      expressions.push(this.evaluate(ast, env));
    }

    return expressions;
  }

  evaluate(ast: ExpressionAST, env: Environment): Expression {
    if (ast instanceof AssignmentAST) {
      return this.evaluateAssignment(ast, env);
    }
    else if (ast instanceof BinaryAST) {
      return this.evaluateBinary(ast, env);
    }
    else if (ast instanceof IdentifierAST) {
      return this.evaluateIdentifier(ast, env);
    }
    else if (ast instanceof NumberAST) {
      return this.evalauteNumber(ast, env);
    }
    else if (ast instanceof FunctionAST) {
      return this.evaluateFunction(ast, env);
    }
    else if (ast instanceof FunctionCallAST) {
      return this.evaluateFunctionCall(ast, env);
    }
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateAssignment(ast: AssignmentAST, env: Environment) {
    const right = this.evaluate(ast.right, env);
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

    return env.addVariableExpression(type, ast.left, right);
  }

  evaluateBinary(ast: BinaryAST, env: Environment) {
    const left = this.evaluate(ast.left, env);
    const right = this.evaluate(ast.right, env);
    if (left.type !== right.type) {
      throw new TypeCheckError(
        `Cannot perform "${ast.operator.name}" operation between "${left.type}" and "right.type"`,
        ast.operator.location
      );
    }
    return new OperatorExpression(ast.operator.name, ast.operator.location, left, right);
  }

  evaluateIdentifier(ast: IdentifierAST, env: Environment) {
    return env.getVariableExpression(ast);
  }

  evalauteNumber(ast: NumberAST, env: Environment) {
    return new NumberExpression(ast.value, ast.location);
  }

  evaluateFunction(ast: FunctionAST, env: Environment) {
    const subEnv = new Environment(env);
    const params: IdentifierExpression[] = [];
    for (const {name, type} of ast.parameters) {
      const metaType = this.evaluate(type, env).type;
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
    const expressions = this.evaluateExpressions(ast.expressions, subEnv);
    const paramTypes = params.map(p => p.type);
    const type = new FunctionType(paramTypes, [], returnType(expressions));
    return new FunctionExpression(params, expressions, type);
  }

  evaluateFunctionCall(ast: FunctionCallAST, env: Environment) {
    const func = this.evaluate(ast.function, env);
    const funcType = func.type;

    const args = this.evaluateExpressions(ast.arguments, env);

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

      return new FunctionCallExpression(func, args);
    }
    else {
      throw new TypeCheckError(
        `${funcType.name} is not an function`,
        ast.location
      );
    }
  }
}
