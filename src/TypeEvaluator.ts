import {
  ExpressionAST,
  AssignmentAST,
  BinaryAST,
  IdentifierAST,
  NumberAST
} from "./AST";

import {
  Expression,
  OperatorExpression,
  NumberExpression
} from "./Expression";

import Environment from "./Environment";
import DeclarationType from "./DeclarationType";
import TypeCheckError from "./TypeCheckError";

export default
class TypeEvaluator {

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
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }
}
