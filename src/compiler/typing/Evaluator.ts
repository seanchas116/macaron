import AST, {
  AssignableAST,
  IdentifierAssignableAST,
  NewVariableAST,
  AssignmentAST,
  UnaryAST,
  BinaryAST,
  IdentifierAST,
  LiteralAST,
  GenericsParameterAST,
  FunctionAST,
  FunctionCallAST,
  GenericsCallAST,
  ClassAST,
  MemberAccessAST,
  IfAST,
  InterfaceAST,
  TypeAliasAST,
} from "../parser/AST";

import Expression, {
  DeclarationExpression
} from "./Expression";

import {ClassExpression, InterfaceExpression} from "./ClassExpression";

import AssignableExpression, {
  IdentifierAssignableExpression
} from "./AssignableExpression";

import TypeExpression, {
  TypeUnionExpression,
  TypeIntersectionExpression,
  TypeIdentifierExpression,
  TypeAliasExpression,
} from "./TypeExpression"

import Type from "./Type";
import FunctionType from "./type/FunctionType";
import MetaType from "./type/MetaType";
import {Constness} from "./Member";
import {voidType} from "./defaultEnvironment";
import Environment from "./Environment";
import ExpressionBuilder, {ClassExpressionBuilder, InterfaceExpressionBuilder} from "./ExpressionBuilder";

import CompilationError from "../common/CompilationError";
import ErrorInfo from "../common/ErrorInfo";

export default
class Evaluator {
  builder = new ExpressionBuilder(this.environment);

  constructor(public environment: Environment) {
  }

  evaluateExpressions(asts: AST[]) {
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

  evaluate(ast: AST): Expression {
    if (ast instanceof NewVariableAST) {
      return this.evaluateNewVariable(ast);
    } else if (ast instanceof AssignmentAST) {
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
    else if (ast instanceof LiteralAST) {
      return this.evalauteLiteral(ast);
    }
    else if (ast instanceof FunctionAST) {
      return this.evaluateFunction(ast);
    }
    else if (ast instanceof FunctionCallAST) {
      return this.evaluateFunctionCall(ast);
    }
    else if (ast instanceof GenericsCallAST) {
      return this.evaluateGenericsCall(ast);
    }
    else if (ast instanceof ClassAST) {
      return this.evaluateClass(ast);
    }
    else if (ast instanceof MemberAccessAST) {
      return this.evaluateMemberAccess(ast);
    }
    else if (ast instanceof IfAST) {
      return this.evaluateIf(ast);
    }
    else if (ast instanceof InterfaceAST) {
      return this.builder.buildTypeOnly(ast.range, this.evaluateInterface(ast));
    }
    else if (ast instanceof TypeAliasAST) {
      return this.builder.buildTypeOnly(ast.range, this.evaluateTypeAlias(ast));
    }
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateAssignable(ast: AssignableAST): AssignableExpression {
    if (ast instanceof IdentifierAssignableAST) {
      return this.evaluateIdentifierAssignable(ast);
    }
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateIdentifierAssignable(ast: IdentifierAssignableAST) {
    return new IdentifierAssignableExpression(
      ast.range,
      ast.name,
      ast.type && this.evaluateType(ast.type).metaType
    );
  }

  evaluateNewVariable(ast: NewVariableAST) {
    const left = this.evaluateAssignable(ast.left);
    const right = this.evaluate(ast.right);

    const constness = (() => {
      switch (ast.declaration) {
      case "let":
        return Constness.Constant;
      case "var":
        return Constness.Variable;
      default:
        throw new Error(`not supported declaration: ${ast.declaration}`);
      }
    })();

    return this.builder.buildNewVariable(ast.range, constness, left, right);
  }


  evaluateAssignment(ast: AssignmentAST) {
    const left = this.evaluateAssignable(ast.left);
    const right = this.evaluate(ast.right);
    return this.builder.buildAssignment(ast.range, left, right);
  }

  evaluateUnary(ast: UnaryAST) {
    const operand = this.evaluate(ast.expression);
    return this.builder.buildUnary(ast.range, ast.operator, operand);
  }

  evaluateBinary(ast: BinaryAST) {
    const left = this.evaluate(ast.left);
    const right = this.evaluate(ast.right);
    return this.builder.buildBinary(ast.range, ast.operator, left, right);
  }

  evaluateIdentifier(ast: IdentifierAST) {
    return this.builder.buildIdentifier(ast.range, ast);
  }

  evalauteLiteral(ast: LiteralAST) {
    return this.builder.buildLiteral(ast.range, ast.value);
  }

  evaluateMemberAccess(ast: MemberAccessAST) {
    const obj = this.evaluate(ast.object);
    return this.builder.buildMemberAccess(ast.range, obj, ast.member);
  }

  evaluateFunction(ast: FunctionAST, thisType: Type = voidType): Expression {
    const func = this.evaluateFunctionGenerics(ast, thisType);
    if (ast.addAsVariable) {
      return this.builder.buildNewVariable(
        ast.range, Constness.Constant,
        new IdentifierAssignableExpression(ast.range, ast.name, null), func
      );
    } else {
      return func;
    }
  }

  evaluateGenericsParameter(ast: GenericsParameterAST) {
    const constraint = this.evaluateType(ast.type);
    return this.builder.buildGenericsParameter(ast.range, ast.name, constraint);
  }

  evaluateFunctionGenerics(ast: FunctionAST, thisType: Type) {
    if (ast.genericsParameters && ast.genericsParameters.length > 0) {
      return this.builder.buildGenerics(
        ast.range,
        env => {
          const evaluator = new Evaluator(env);
          return ast.genericsParameters.map(p => evaluator.evaluateGenericsParameter(p));
        },
        env => new Evaluator(env).evaluateFunctionMain(ast, thisType)
      )
    } else {
      return this.evaluateFunctionMain(ast, thisType);
    }
  }

  evaluateFunctionMain(ast: FunctionAST, thisType: Type) {
    return this.builder.buildFunction(
      ast.range,
      ast.name,
      env => {
        const evaluator = new Evaluator(env);
        return ast.parameters.map(p => evaluator.evaluateAssignable(p))
      },
      env => {
        const evaluator = new Evaluator(env);
        const body = evaluator.evaluateExpressions(ast.expressions);
        return this.builder.buildFunctionBody(ast.range, body);
      },
      thisType,
      ast.returnType && this.evaluateType(ast.returnType).metaType
    );
  }

  evaluateFunctionCall(ast: FunctionCallAST) {
    const func = this.evaluate(ast.function);
    const args = this.evaluateExpressions(ast.arguments);
    return this.builder.buildFunctionCall(ast.range, func, args, ast.isNewCall);
  }

  evaluateGenericsCall(ast: GenericsCallAST) {
    const value = this.evaluate(ast.value);
    const args = ast.arguments.map(a => this.evaluateType(a));
    return this.builder.buildGenericsCall(ast.range, value, args);
  }

  evaluateClass(ast: ClassAST) {
    const lazy = this.builder.buildLazy(ast.range, ast.name, () => {
      let builder: ClassExpressionBuilder;

      if (ast.superclass) {
        const superExpr = this.evaluate(ast.superclass);
        const superType = this.evaluateType(ast.superclass);
        builder = new ClassExpressionBuilder(ast.range, this.environment, ast.name, superType, superExpr);
      } else {
        builder = new ClassExpressionBuilder(ast.range, this.environment, ast.name, null, null);
      }

      for (const memberAST of ast.members) {
        const member = this.builder.buildLazy(
          memberAST.range, memberAST.name,
          () => this.evaluateFunction(memberAST, builder.selfType)
        );
        builder.addMember(Constness.Constant, memberAST.name, member);
      }

      return builder.buildClass();
    });

    this.environment.checkAddVariable(Constness.Constant, ast.name, lazy.valueTypeThunk);
    return lazy;
  }

  evaluateDeclarationType(selfType: Type, ast: AST) {
    if (ast instanceof FunctionAST) {
      return this.evaluateMethodDeclarationType(selfType, ast);
    } else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateMethodDeclarationType(selfType: Type, ast: FunctionAST) {
    return this.builder.buildLazy(ast.range, ast.name, () => {
      const paramTypes: Type[] = [];
      const subEnv = this.environment.newChild();
      const subEvaluator = new Evaluator(subEnv);

      for (const param of ast.parameters) {
        if (param instanceof IdentifierAssignableAST) {
          const {name, type: typeExpr} = param;
          const type = subEvaluator.evaluateType(typeExpr).metaType;
          subEnv.checkAddVariable(Constness.Constant, name, type);
          paramTypes.push(type);
        } else {
          throw new Error(`unsupported assignable Expression: ${param.constructor.name}`);
        }
      }

      const returnType = subEvaluator.evaluateType(ast.returnType).metaType;

      const type = new FunctionType(selfType, paramTypes, [], returnType, this.environment, ast.range);
      return new DeclarationExpression(ast.range, ast.name, type);
    });
  }

  evaluateInterface(ast: InterfaceAST) {
    const supers = ast.superTypes.map(ast => this.evaluateType(ast));
    const builder = new InterfaceExpressionBuilder(ast.range, this.environment, ast.name, supers);

    for (const memberAST of ast.members) {
      builder.addMember(Constness.Constant, memberAST.name,
        this.evaluateDeclarationType(builder.selfType, memberAST));
    }

    this.environment.checkAddVariable(Constness.Constant, ast.name, MetaType.typeOnly(builder.selfType));
    return builder.buildInterface();
  }

  evaluateIf(ast: IfAST) {
    return this.builder.buildIf(ast.range,
      (env) => new Evaluator(env).evaluate(ast.condition),
      (env) => new Evaluator(env).evaluateExpressions(ast.ifTrue),
      (env) => new Evaluator(env).evaluateExpressions(ast.ifFalse)
    );
  }

  evaluateTypeAlias(ast: TypeAliasAST) {
    const typeExpr = this.evaluateType(ast.right);

    this.environment.checkAddVariable(Constness.Constant, ast.left, MetaType.typeOnly(typeExpr.metaType));

    return new TypeAliasExpression(ast.range, ast.left, typeExpr);
  }

  evaluateType(ast: AST): TypeExpression {
    if (ast instanceof IdentifierAST) {
      return this.evaluateTypeIdentifier(ast);
    } else if (ast instanceof BinaryAST) {
      return this.evaluateTypeBinary(ast);
    } else if (ast instanceof InterfaceAST) {
      return this.evaluateInterface(ast);
    } else if (ast instanceof TypeAliasAST) {
      return this.evaluateTypeAlias(ast);
    } else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateTypeIdentifier(ast: IdentifierAST) {
    const {member} = this.environment.checkGetVariable(ast);
    const type = member.type.get();
    if (type instanceof MetaType) {
      return new TypeIdentifierExpression(ast.range, ast, type.metaType);
    }
    throw CompilationError.typeError(
      ast.range,
      `Variable '${ast.name}' is not a type`
    );
  }

  evaluateTypeBinary(ast: BinaryAST): TypeExpression {
    const left = this.evaluateType(ast.left);
    const right = this.evaluateType(ast.right);

    switch (ast.operator.name) {
      case "&": {
        return new TypeIntersectionExpression(ast.range, this.environment, left, right);
      }
      case "|": {
        return new TypeUnionExpression(ast.range, this.environment, left, right);
      }
      default: {
        throw new Error(`Unsupported type operator: ${ast.operator.name}`);
      }
    }
  }
}
