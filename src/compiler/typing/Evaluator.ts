import AST, {
  ExpressionAST,
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
  LiteralExpression,
  IdentifierExpression,
  AssignmentExpression,
  NewVariableExpression,
  FunctionCallExpression,
  GenericsCallExpression,
  GenericsExpression,
  ReturnExpression,
  MemberAccessExpression,
  OperatorAccessExpression,
  IfExpression,
  EmptyExpression,
  DeclarationExpression,
} from "./Expression";

import FunctionExpression from "./expression/FunctionExpression";
import FunctionBodyExpression from "./expression/FunctionBodyExpression";
import ClassExpression from "./expression/ClassExpression";
import InterfaceExpression from "./expression/InterfaceExpression";

import AssignableExpression, {
  IdentifierAssignableExpression
} from "./AssignableExpression";

import TypeExpression, {
  TypeUnionExpression,
  TypeIntersectionExpression,
  TypeIdentifierExpression,
  TypeAliasExpression,
  GenericsParameterExpression
} from "./TypeExpression"

import Identifier from "./Identifier";
import Type from "./Type";
import FunctionType from "./type/FunctionType";
import MetaType from "./type/MetaType";
import UnionType from "./type/UnionType";
import IntersectionType from "./type/IntersectionType";
import GenericsType from "./type/GenericsType";
import GenericsParameterType from "./type/GenericsParameterType";
import ExpressionThunk from "./thunk/ExpressionThunk";
import CallSignature from "./CallSignature";
import Member, {Constness} from "./Member";
import TypeThunk from "./thunk/TypeThunk";
import {voidType} from "./defaultEnvironment";
import Environment from "./Environment";
import ExpressionBuilder from "./ExpressionBuilder";

import CompilationError from "../common/CompilationError";
import SourceRange from "../common/SourceRange";
import ErrorInfo from "../common/ErrorInfo";

export default
class Evaluator {
  builder = new ExpressionBuilder(this.environment);

  constructor(public environment: Environment) {
  }

  evaluateExpressions(asts: AST[]) {
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

  private evaluateImpl(ast: AST): Expression|ExpressionThunk {
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
      return this.evaluateInterface(ast);
    }
    else if (ast instanceof TypeAliasAST) {
      return this.evaluateTypeAlias(ast);
    }
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluate(ast: AST) {
    return ExpressionThunk.resolve(this.evaluateImpl(ast));
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
      ast.type && this.evaluateType(ast.type).type.metaType
    );
  }

  evaluateNewVariable(ast: NewVariableAST) {
    const left = this.evaluateAssignable(ast.left);
    const right = this.evaluate(ast.right).get();

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
    const right = this.evaluate(ast.right).get();
    return this.builder.buildAssignment(ast.range, left, right);
  }

  evaluateUnary(ast: UnaryAST) {
    const operand = this.evaluate(ast.expression).get();
    return this.builder.buildUnary(ast.range, ast.operator, operand);
  }

  evaluateBinary(ast: BinaryAST) {
    const left = this.evaluate(ast.left).get();
    const right = this.evaluate(ast.right).get();
    return this.builder.buildBinary(ast.range, ast.operator, left, right);
  }

  evaluateIdentifier(ast: IdentifierAST): Expression {
    return this.builder.buildIdentifier(ast.range, ast);
  }

  evalauteLiteral(ast: LiteralAST) {
    return this.builder.buildLiteral(ast.range, ast.value);
  }

  evaluateMemberAccess(ast: MemberAccessAST) {
    const obj = this.evaluate(ast.object).get();
    return this.builder.buildMemberAccess(ast.range, obj, ast.member);
  }

  evaluateFunction(ast: FunctionAST, thisType: Type = voidType) {
    const funcThunk = this.evaluateFunctionGenerics(ast, thisType);
    if (ast.addAsVariable) {
      const thunk = new ExpressionThunk(ast.range, () => {
        return new NewVariableExpression(
          ast.range, Constness.Constant,
          new IdentifierAssignableExpression(ast.range, ast.name, null), funcThunk.get()
        );
      });
      this.environment.checkAddVariable(Constness.Constant, ast.name, funcThunk.type);
      return thunk;
    } else {
      return funcThunk;
    }
  }

  evaluateGenericsParameter(ast: GenericsParameterAST) {
    const constraint = this.evaluateType(ast.type);
    return this.builder.buildGenericsParameter(ast.range, ast.name, constraint);
  }

  evaluateFunctionGenerics(ast: FunctionAST, thisType: Type) {
    if (ast.genericsParameters && ast.genericsParameters.length > 0) {
      const subEnv = this.environment.newChild();
      const subEvaluator = new Evaluator(subEnv);

      const params = ast.genericsParameters.map(p => subEvaluator.evaluateGenericsParameter(p));
      for (const param of params) {
        subEnv.addGenericsPlaceholder(param.parameterType);
        subEnv.checkAddVariable(Constness.Constant, param.name, param.type);
      }
      const funcThunk = subEvaluator.evaluateFunctionMain(ast, thisType);
      const typeThunk = funcThunk.type.map(template =>
        new GenericsType(
          template.name, params.map(p => p.parameterType), template,
          subEnv, ast.range
        )
      );
      return new ExpressionThunk(
        ast.range,
        () => new GenericsExpression(ast.range, params, typeThunk.get() as GenericsType, funcThunk.get()),
        typeThunk
      );
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
        const body = evaluator.evaluateExpressions(ast.expressions).map(e => e.get());
        return new FunctionBodyExpression(ast.range, body);
      },
      thisType,
      ast.returnType && this.evaluateType(ast.returnType).type.metaType
    );
  }

  evaluateFunctionCall(ast: FunctionCallAST) {
    const func = this.evaluate(ast.function).get();
    const args = this.evaluateExpressions(ast.arguments).map(e => e.get());
    return this.builder.buildFunctionCall(ast.range, func, args, ast.isNewCall);
  }

  evaluateGenericsCall(ast: GenericsCallAST) {
    const value = this.evaluate(ast.value).get();
    const args = ast.arguments.map(a => this.evaluateType(a).type.metaType);
    return new GenericsCallExpression(ast.range, value, args);
  }

  evaluateClass(ast: ClassAST) {
    const thunk = new ExpressionThunk(ast.range, () => {
      let superExpr: Expression;
      if (ast.superclass) {
        console.log(ast.superclass);
        superExpr = this.evaluate(ast.superclass).get();
        const superType = superExpr.type;

        let ok = superType instanceof MetaType && !superType.typeOnly;
        if (!ok) {
          throw CompilationError.typeError(
            ast.superclass.range,
            `Superclass is not a class`
          );
        }
      }

      const expr = new ClassExpression(ast.range, this.environment, ast.name, superExpr);
      for (const memberAST of ast.members) {
        const memberThunk = new ExpressionThunk(memberAST.range, () => this.evaluateFunction(memberAST, expr.selfType).get());
        expr.addMember(Constness.Constant, memberAST.name, memberThunk);
      }
      return expr;
    });

    this.environment.checkAddVariable(Constness.Constant, ast.name, thunk.type);
    return thunk;
  }

  evaluateDeclarationType(selfType: Type, ast: AST) {
    if (ast instanceof FunctionAST) {
      return this.evaluateMethodDeclarationType(selfType, ast);
    } else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateMethodDeclarationType(selfType: Type, ast: FunctionAST) {
    const paramTypes: Type[] = [];
    const subEnv = this.environment.newChild();
    const subEvaluator = new Evaluator(subEnv);

    for (const param of ast.parameters) {
      if (param instanceof IdentifierAssignableAST) {
        const {name, type: typeExpr} = param;
        const type = subEvaluator.evaluateType(typeExpr).type.metaType;
        subEnv.checkAddVariable(Constness.Constant, name, type);
        paramTypes.push(type);
      } else {
        throw new Error(`unsupported assignable Expression: ${param.constructor.name}`);
      }
    }

    const returnType = subEvaluator.evaluateType(ast.returnType).type.metaType;

    const type = new FunctionType(selfType, paramTypes, [], returnType, this.environment, ast.range);
    return new DeclarationExpression(ast.range, ast.name, type);
  }

  evaluateInterface(ast: InterfaceAST) {
    const supers = ast.superTypes.map(ast => this.evaluateType(ast));
    const expr = new InterfaceExpression(ast.range, this.environment, ast.name, supers);

    for (const memberAST of ast.members) {
      expr.addMember(Constness.Constant, memberAST.name,
        new ExpressionThunk(memberAST.range, () => this.evaluateDeclarationType(expr.type, memberAST)));
    }

    this.environment.checkAddVariable(Constness.Constant, ast.name, expr.type);
    return expr;
  }

  evaluateIf(ast: IfAST) {
    return this.builder.buildIf(ast.range,
      (env) => new Evaluator(env).evaluate(ast.condition).get(),
      (env) => new Evaluator(env).evaluateExpressions(ast.ifTrue).map(e => e.get()),
      (env) => new Evaluator(env).evaluateExpressions(ast.ifFalse).map(e => e.get())
    );
  }

  evaluateTypeAlias(ast: TypeAliasAST) {
    const typeExpr = this.evaluateType(ast.right);

    this.environment.checkAddVariable(Constness.Constant, ast.left, typeExpr.type);

    return new TypeAliasExpression(ast.range, ast.left, typeExpr);
  }

  evaluateType(ast: AST): TypeExpression {
    if (ast instanceof IdentifierAST) {
      return this.evaluateTypeIdentifier(ast);
    } else if (ast instanceof BinaryAST) {
      return this.evaluateTypeBinary(ast);
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
