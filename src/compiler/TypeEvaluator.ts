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
  MemberAccessAST
} from "./AST";

import {
  Expression,
  BinaryExpression,
  NumberExpression,
  StringExpression,
  FunctionExpression,
  IdentifierExpression,
  FunctionCallExpression,
  ConstructorCallExpression,
  ReturnExpression,
  ClassMemberExpression,
  ClassMethodExpression,
  ClassExpression,
  MemberAccessExpression
} from "./Expression";

import Environment from "./Environment";
import DeclarationType from "./DeclarationType";
import CompilerError from "./CompilerError";
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
import ErrorInfo from "./ErrorInfo";

function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].type;
}

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
        if (error instanceof CompilerError) {
          console.log("pushing errors");
          errors.push(...error.infos);
        }
        else {
          throw error;
        }
      }
    }

    if (errors.length > 0) {
      console.log("throwing errors");
      throw new CompilerError(errors);
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
      throw CompilerError.typeError(
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

  evaluateMemberAccess(ast: MemberAccessAST) {
    const obj = this.evaluate(ast.object);
    const objType = obj.type;
    const memberName = ast.member.name;
    const memberType = objType.getMembers().get(memberName);
    const memberLoc = ast.member.location;
    if (!memberType) {
      throw CompilerError.typeError(
        `Type "${objType.name}" has no member "${memberName}"`,
        memberLoc
      );
    }
    const memberExpr = new IdentifierExpression(memberName, memberLoc, memberType);
    return new MemberAccessExpression(obj, memberExpr);
  }

  evaluateFunction(ast: FunctionAST) {
    const {params, expressions, location, type} = this.evaluateFunctionLike(voidType, ast.parameters, ast.expressions, ast.location);
    return new FunctionExpression(params, expressions, location, type);
  }

  checkArgumentType(funcType: FunctionType, args: Expression[], location: SourceLocation) {
    if (args.length < funcType.minParamCount || funcType.maxParamCount < args.length) {
      throw CompilerError.typeError(
        `Cannot pass ${args.length} arguments for ${funcType.minParamCount}...${funcType.maxParamCount} parameter function`,
        location
      );
    }
    funcType.parameters.forEach((type, i) => {
      if (!args[i].type.isCastableTo(type)) {
        throw CompilerError.typeError(
          `Cannot pass '${args[i].type.name}' to '${type.name}'`,
          args[i].location
        );
      }
    });
  }

  evaluateFunctionCall(ast: FunctionCallAST) {
    const args = this.evaluateExpressions(ast.arguments);

    const func = this.evaluate(ast.function);
    const funcType = func.type;

    if (funcType instanceof FunctionType) {
      this.checkArgumentType(funcType, args, ast.location);
      return new FunctionCallExpression(func, args, ast.location, funcType.returnType);
    }
    else {
      throw CompilerError.typeError(
        `${funcType.name} is not an function`,
        ast.location
      );
    }
  }

  evaluateConstructorCall(ast: ConstructorCallAST) {
    const args = this.evaluateExpressions(ast.arguments);

    const classExpr = this.evaluate(ast.function);
    const classMetaType = classExpr.type;
    if (classMetaType instanceof MetaType) {
      const classType = classMetaType.type;
      if (classType instanceof ClassType) {
        this.checkArgumentType(classType.constructorType, args, ast.location);
        return new ConstructorCallExpression(classExpr, args, ast.location, classType);
      }
    }
    throw CompilerError.typeError(
      `${classMetaType.name} is not an class`,
      ast.location
    );
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
          throw CompilerError.typeError(
            `Class "${className}" already has member "${name}"`,
            member.location
          );
        }

        const superMember = superType.getMembers().get(name);
        if (superMember && !type.isCastableTo(superMember)) {
          throw CompilerError.typeError(
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
        throw CompilerError.typeError(
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
