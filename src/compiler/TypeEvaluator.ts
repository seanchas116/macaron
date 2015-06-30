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
  ClassAST,
  ClassMethodAST
} from "./AST";

import {
  Expression,
  BinaryExpression,
  NumberExpression,
  StringExpression,
  FunctionExpression,
  IdentifierExpression,
  FunctionCallExpression,
  ReturnExpression,
  ClassMemberExpression,
  ClassMethodExpression,
  ClassExpression
} from "./Expression";

import Environment from "./Environment";
import DeclarationType from "./DeclarationType";
import TypeCheckError from "./TypeCheckError";
import {
  Type,
  FunctionType,
  MetaType,
  ClassType
} from "./Type";
import {
  voidType
} from "./nativeTypes";
import SourceLocation from "./SourceLocation";

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
    else if (ast instanceof ClassAST) {
      return this.evaluateClass(ast);
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
    const {params, expressions, location, type} = this.evaluateFunctionLike(voidType, ast.parameters, ast.expressions, ast.location);
    return new FunctionExpression(params, expressions, location, type);
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

  evaluateClass(ast: ClassAST) {
    // TODO: superclass
    const superType = voidType;
    const className = ast.name.name;
    const classType = new ClassType(className, superType);
    const memberExpressions: ClassMemberExpression[] = [];

    for (const member of ast.members) {
      if (member instanceof ClassMethodAST) {
        const {params, expressions, location, type} = this.evaluateFunctionLike(classType, member.parameters, member.expressions, member.location);
        const name = member.name.name;

        if (classType.selfMembers.has(name)) {
          throw new TypeCheckError(
            `Class "${className}" already has member "${name}"`,
            member.location
          );
        }

        const superMember = superType.getMembers().get(name);
        if (superMember && !type.isCastableTo(superMember)) {
          throw new TypeCheckError(
            `Type of "${name}" is not compatible to super types`,
            member.location
          );
        }

        classType.selfMembers.set(name, type);
        const nameExpr = new IdentifierExpression(name, member.location, type);
        memberExpressions.push(new ClassMethodExpression(params, expressions, nameExpr, location));

        if (name === "constructor") {
          classType.constructorType = new FunctionType(voidType, type.requiredParams, type.optionalParams, type.returnType);
        }
      }
    }
    if (!classType.constructorType) {
      classType.constructorType = new FunctionType(voidType, [], [], voidType);
    }
    this.environment.addVariable(DeclarationType.Constant, ast.name, new MetaType(classType));
    const classNameExpr = new IdentifierExpression(ast.name.name, ast.name.location, classType);
    return new ClassExpression(classNameExpr, memberExpressions, ast.location, classType);
  }

  evaluateFunctionLike(selfType: Type, paramASTs: ParameterAST[], expressionASTs: ExpressionAST[], location: SourceLocation) {
    const subEnv = new Environment(this.environment);
    const params: IdentifierExpression[] = [];
    for (const {name, type} of paramASTs) {
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
    const expressions = new TypeEvaluator(subEnv).evaluateExpressions(expressionASTs);
    const paramTypes = params.map(p => p.type);
    const type = new FunctionType(selfType, paramTypes, [], returnType(expressions));
    return {params, expressions, location, type};
  }
}
