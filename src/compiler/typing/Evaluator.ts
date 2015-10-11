import {
  ExpressionAST,
  NewVariableAST,
  AssignmentAST,
  UnaryAST,
  BinaryAST,
  IdentifierAST,
  LiteralAST,
  ParameterAST,
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

import TypeExpression, {
  TypeUnionExpression,
  TypeIntersectionExpression,
  TypeIdentifierExpression,
  TypeAliasExpression,
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
import {voidType} from "./nativeTypes";

import CompilationError from "../common/CompilationError";
import SourceLocation from "../common/SourceLocation";
import ErrorInfo from "../common/ErrorInfo";

import EvaluationContext from "./EvaluationContext";

export default
class Evaluator {

  constructor(public context: EvaluationContext) {
  }

  get environment() {
    return this.context.environment;
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

  private evaluateImpl(ast: ExpressionAST): Expression|ExpressionThunk {
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

  evaluate(ast: ExpressionAST) {
    return ExpressionThunk.resolve(this.evaluateImpl(ast));
  }

  evaluateNewVariable(ast: NewVariableAST) {
    const varName = ast.left.name;
    const right = this.evaluate(ast.right);
    let type: TypeThunk;
    if (ast.type) {
      type = TypeThunk.resolve(this.evaluateType(ast.type).metaType);
    } else {
      type = right.type;
    }

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
    this.context.addVariable(constness, ast.left, type);
    this.context.assignVariable(ast.left, right.type, true);
    return new NewVariableExpression(ast.location, constness, ast.left, right.get());
  }

  evaluateAssignment(ast: AssignmentAST) {
    const varName = ast.left.name;
    const right = this.evaluate(ast.right).get();

    this.context.assignVariable(ast.left, right.type);
    return new AssignmentExpression(ast.location, ast.left, right);
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

  evaluateIdentifier(ast: IdentifierAST): Expression {
    const {member, needsThis} = this.context.getVariable(ast);

    if (needsThis) {
      const thisIdentifier = new Identifier("this", ast.location);
      const {member: thisMember} = this.context.getVariable(thisIdentifier);
      const thisExpr = new IdentifierExpression(thisIdentifier, thisMember.type.get());
      return new MemberAccessExpression(ast.location, thisExpr, ast);
    } else {
      return new IdentifierExpression(ast, member.type.get());
    }
  }

  evalauteLiteral(ast: LiteralAST) {
    return new LiteralExpression(ast.location, ast.value);
  }

  evaluateMemberAccess(ast: MemberAccessAST) {
    const obj = this.evaluate(ast.object).get();
    return new MemberAccessExpression(ast.location, obj, ast.member)
  }

  evaluateFunction(ast: FunctionAST, thisType = voidType()) {
    const funcThunk = this.evaluateFunctionGenerics(ast, thisType);
    if (ast.addAsVariable) {
      const thunk = new ExpressionThunk(ast.location, () => {
        return new NewVariableExpression(ast.location, Constness.Constant, ast.name, funcThunk.get());
      });
      this.context.addVariable(Constness.Constant, ast.name, funcThunk.type);
      return thunk;
    } else {
      return funcThunk;
    }
  }

  evaluateFunctionGenerics(ast: FunctionAST, thisType: Type) {
    if (ast.genericsParameters && ast.genericsParameters.length > 0) {
      const subContext = this.context.newChild();
      const params = ast.genericsParameters.map(p => new GenericsParameterType(p.name.name, this.evaluateType(p.type).metaType, this.environment));
      for (const [i, p] of params.entries()) {
        subContext.environment.addGenericsPlaceholder(p);
        subContext.addVariable(Constness.Constant, ast.genericsParameters[i].name, MetaType.typeOnly(p, this.environment));
      }
      const funcThunk = new Evaluator(subContext).evaluateFunctionMain(ast, thisType);
      const typeThunk = funcThunk.type.map(template => new GenericsType(template.name, params, template, subContext.environment));
      return new ExpressionThunk(
        ast.location,
        () => new GenericsExpression(ast.location, typeThunk.get() as GenericsType, funcThunk.get()),
        typeThunk
      );
    } else {
      return this.evaluateFunctionMain(ast, thisType);
    }
  }

  evaluateFunctionMain(ast: FunctionAST, thisType: Type) {
    const {location} = ast;

    const paramTypes: Type[] = [];
    const subContext = this.context.newChild(thisType);
    const subEvaluator = new Evaluator(subContext);

    for (const {name, type: typeExpr} of ast.parameters) {
      const type = subEvaluator.evaluateType(typeExpr).metaType;
      subContext.addVariable(Constness.Constant, name, type);
      paramTypes.push(type);
    }

    subContext.addVariable(Constness.Constant, new Identifier("this"), thisType);

    const bodyThunk = new ExpressionThunk(location, () => {
      const body = subEvaluator.evaluateExpressions(ast.expressions).map(e => e.get());
      return new FunctionBodyExpression(location, body);
    });

    const createType = (returnType: Type) => {
      return new FunctionType(thisType, paramTypes, [], returnType, subContext.environment, ast.location);
    }

    let typeThunk: TypeThunk;
    if (ast.returnType) {
      const returnType = subEvaluator.evaluateType(ast.returnType).metaType;
      typeThunk = TypeThunk.resolve(createType(returnType));
    }
    else {
      typeThunk = new TypeThunk(ast.location, () => {
        const returnType = bodyThunk.get().type;
        return createType(returnType);
      });
    }

    return new ExpressionThunk(location, () => {
      return new FunctionExpression(location, ast.name, typeThunk.get(), ast.parameters.map(p => p.name), <FunctionBodyExpression>bodyThunk.get());
    }, typeThunk);
  }

  evaluateFunctionCall(ast: FunctionCallAST) {
    const func = this.evaluate(ast.function).get();
    const args = this.evaluateExpressions(ast.arguments).map(e => e.get());
    return new FunctionCallExpression(ast.location, func, args, ast.isNewCall);
  }

  evaluateGenericsCall(ast: GenericsCallAST) {
    const value = this.evaluate(ast.value).get();
    const args = ast.arguments.map(a => this.evaluateType(a).metaType);
    return new GenericsCallExpression(ast.location, value, args);
  }

  evaluateClass(ast: ClassAST) {
    const thunk = new ExpressionThunk(ast.location, () => {
      let superExpr: Expression;
      if (ast.superclass) {
        console.log(ast.superclass);
        superExpr = this.evaluate(ast.superclass).get();
        const superType = superExpr.type;

        let ok = superType instanceof MetaType && !superType.typeOnly;
        if (!ok) {
          throw CompilationError.typeError(
            ast.superclass.location,
            `Superclass is not a class`
          );
        }
      }

      const expr = new ClassExpression(ast.location, this.environment, ast.name, superExpr);
      for (const memberAST of ast.members) {
        const memberThunk = new ExpressionThunk(memberAST.location, () => this.evaluateFunction(memberAST, expr.selfType).get());
        expr.addMember(Constness.Constant, memberAST.name, memberThunk);
      }
      return expr;
    });

    this.context.addVariable(Constness.Constant, ast.name, thunk.type);
    return thunk;
  }

  evaluateDeclarationType(selfType: Type, ast: ExpressionAST) {
    if (ast instanceof FunctionAST) {
      return this.evaluateMethodDeclarationType(selfType, ast);
    } else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateMethodDeclarationType(selfType: Type, ast: FunctionAST) {
    const paramTypes: Type[] = [];
    const subContext = this.context.newChild();
    const subEvaluator = new Evaluator(subContext);

    for (const {name, type: typeExpr} of ast.parameters) {
      const type = subEvaluator.evaluateType(typeExpr).metaType;
      subContext.addVariable(Constness.Constant, name, type);
      paramTypes.push(type);
    }

    const returnType = subEvaluator.evaluateType(ast.returnType).metaType;

    const type = new FunctionType(selfType, paramTypes, [], returnType, this.environment, ast.location);
    return new DeclarationExpression(ast.name, type);
  }

  evaluateInterface(ast: InterfaceAST) {
    // TODO: super types
    const expr = new InterfaceExpression(ast.location, this.environment, ast.name, []);

    for (const memberAST of ast.members) {
      expr.addMember(Constness.Constant, memberAST.name,
        new ExpressionThunk(memberAST.location, () => this.evaluateDeclarationType(expr.type, memberAST)));
    }

    this.context.addVariable(Constness.Constant, ast.name, expr.type);
    return expr;
  }

  evaluateIf(ast: IfAST) {
    const tempVarName = this.context.environment.addTempVariable("__macaron$ifTemp");

    const ifContext = this.context.newChild();
    const cond = new Evaluator(ifContext).evaluate(ast.condition).get();

    const ifTrue = new Evaluator(ifContext.newChild()).evaluateExpressions(ast.ifTrue).map(e => e.get());
    const ifFalse = new Evaluator(ifContext.newChild()).evaluateExpressions(ast.ifFalse).map(e => e.get());

    return new IfExpression(ast.location, this.environment, cond, ifTrue, ifFalse, tempVarName);
  }

  evaluateTypeAlias(ast: TypeAliasAST) {
    const typeExpr = this.evaluateType(ast.right);

    this.context.addVariable(Constness.Constant, ast.left, typeExpr.type);

    return new TypeAliasExpression(ast.location, this.environment, ast.left, typeExpr);
  }

  evaluateType(ast: ExpressionAST): TypeExpression {
    if (ast instanceof IdentifierAST) {
      return this.evaluateTypeIdentifier(ast);
    } else if (ast instanceof BinaryAST) {
      return this.evaluateTypeBinary(ast);
    } else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateTypeIdentifier(ast: IdentifierAST) {
    const {member} = this.context.getVariable(ast);
    const type = member.type.get();
    if (type instanceof MetaType) {
      return new TypeIdentifierExpression(this.environment, ast, type.metaType);
    }
    throw CompilationError.typeError(
      ast.location,
      `Variable '${ast.name}' is not a type`
    );
  }

  evaluateTypeBinary(ast: BinaryAST) {
    const left = this.evaluateType(ast.left);
    const right = this.evaluateType(ast.right);

    switch (ast.operator.name) {
      case "&": {
        return new TypeIntersectionExpression(ast.location, this.environment, left, right);
      }
      case "|": {
        return new TypeUnionExpression(ast.location, this.environment, left, right);
      }
      default: {
        throw new Error(`Unsupported type operator: ${ast.operator.name}`);
      }
    }
  }
}
