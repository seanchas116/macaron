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
  FunctionType
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
    else if (ast instanceof BinaryAST) {
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
    else if (ast instanceof IdentifierAST) {
      return env.getVariableExpression(ast);
    }
    else if (ast instanceof NumberAST) {
      return new NumberExpression(ast.value, ast.location);
    }
    else if (ast instanceof FunctionAST) {
      const subEnv = new Environment(env);
      const params: IdentifierExpression[] = [];
      for (const {name, type} of ast.parameters) {
        const typeExpr = this.evaluate(type, env);
        if (!typeExpr.typeValue) {
          throw new TypeCheckError(
            `Provided expression is not a type`,
            type.location
          );
        }
        subEnv.addVariable(DeclarationType.Constant, name, typeExpr.typeValue);
        params.push(new IdentifierExpression(name.name, name.location, typeExpr.typeValue));
      }
      const expressions = this.evaluateExpressions(ast.expressions, subEnv);
      return new FunctionExpression(params, expressions, returnType(expressions));
    }
    else if (ast instanceof FunctionCallAST) {
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
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }
}
