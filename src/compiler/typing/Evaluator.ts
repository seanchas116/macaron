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
  ClassAST,
  MemberAccessAST,
  IfAST,
  InterfaceAST,
} from "../parser/AST";

import Expression, {
  LiteralExpression,
  IdentifierExpression,
  AssignmentExpression,
  NewVariableExpression,
  FunctionCallExpression,
  ReturnExpression,
  MemberAccessExpression,
  OperatorAccessExpression,
  IfExpression,
  EmptyExpression
} from "./Expression";
import FunctionExpression from "./expression/FunctionExpression";
import FunctionBodyExpression from "./expression/FunctionBodyExpression";
import ClassExpression from "./expression/ClassExpression";

import Identifier from "./Identifier";
import Type from "./Type";
import FunctionType from "./type/FunctionType";
import MetaType from "./type/MetaType";
import UnionType from "./type/UnionType";
import IntersectionType from "./type/IntersectionType";
import ExpressionThunk from "./thunk/ExpressionThunk";
import {voidType, typeOnlyType} from "./nativeTypes";
import CallSignature from "./CallSignature";
import Member, {Constness} from "./Member";
import TypeThunk from "./thunk/TypeThunk";

import CompilationError from "../common/CompilationError";
import SourceLocation from "../common/SourceLocation";
import ErrorInfo from "../common/ErrorInfo";

import EvaluationContext from "./EvaluationContext";

export default
class Evaluator {

  constructor(public context: EvaluationContext) {
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
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluate(ast: ExpressionAST) {
    return ExpressionThunk.resolve(this.evaluateImpl(ast));
  }

  evaluateNewVariable(ast: NewVariableAST) {
    const varName = ast.left.name;
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
    this.context.addVariable(constness, ast.left, right.type);
    return new NewVariableExpression(ast.location, constness, ast.left, right);
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

  evaluateFunction(ast: FunctionAST, thisType = voidType): ExpressionThunk {
    const {location} = ast;

    const paramTypes: Type[] = [];
    const subContext = this.context.newChild(thisType);
    const subEvaluator = new Evaluator(subContext);

    for (const {name, type: typeExpr} of ast.parameters) {
      const type = subEvaluator.evaluateType(typeExpr);
      subContext.addVariable(Constness.Constant, name, type);
      paramTypes.push(type);
    }

    subContext.addVariable(Constness.Constant, new Identifier("this"), thisType);

    const bodyThunk = new ExpressionThunk(location, () => {
      const body = subEvaluator.evaluateExpressions(ast.expressions).map(e => e.get());
      return new FunctionBodyExpression(location, body);
    });

    const createType = (returnType: Type) => {
      return new FunctionType(thisType, paramTypes, [], returnType, ast.location);
    }

    let typeThunk: TypeThunk;
    if (ast.returnType) {
      const returnType = subEvaluator.evaluateType(ast.returnType);
      const type = createType(returnType);
      typeThunk = TypeThunk.resolve(type);
    }
    else {
      typeThunk = new TypeThunk(ast.location, () => {
        const returnType = bodyThunk.get().type;
        const type = createType(returnType);
        return type;
      });
    }

    const funcThunk = new ExpressionThunk(location, () => {
      return new FunctionExpression(location, ast.name, typeThunk.get(), ast.parameters.map(p => p.name), <FunctionBodyExpression>bodyThunk.get());
    });

    if (ast.addAsVariable) {
      const thunk = new ExpressionThunk(location, () => {
        return new NewVariableExpression(location, Constness.Constant, ast.name, funcThunk.get());
      });
      this.context.addVariable(Constness.Constant, ast.name, typeThunk);
      return thunk;
    } else {
      return funcThunk;
    }
  }

  evaluateFunctionCall(ast: FunctionCallAST) {
    const func = this.evaluate(ast.function).get();
    const args = this.evaluateExpressions(ast.arguments).map(e => e.get());
    return new FunctionCallExpression(ast.location, func, args, ast.isNewCall);
  }

  evaluateClass(ast: ClassAST) {
    const thunk = new ExpressionThunk(ast.location, () => {
      let superExpr: Expression;
      if (ast.superclass) {
        console.log(ast.superclass);
        superExpr = this.evaluate(ast.superclass).get();
        const superType = superExpr.type;

        let ok = superType instanceof MetaType && superType.valueType !== typeOnlyType;
        if (!ok) {
          throw CompilationError.typeError(
            `Superclass is not a class`,
            ast.superclass.location
          );
        }
      }

      const expr = new ClassExpression(ast.location, ast.name, superExpr);
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
      const type = subEvaluator.evaluateType(typeExpr);
      subContext.addVariable(Constness.Constant, name, type);
      paramTypes.push(type);
    }

    const returnType = subEvaluator.evaluateType(ast.returnType);

    return new FunctionType(selfType, paramTypes, [], returnType, ast.location);
  }

  evaluateInterface(ast: InterfaceAST) {
    // TODO: super types
    const type = new Type(ast.name.name);

    for (const memberAST of ast.members) {
      const memberType = new TypeThunk(memberAST.location, () => {
        return this.evaluateDeclarationType(type, memberAST)
      });
      type.addMember(memberAST.name.name, new Member(Constness.Constant, memberType));
    }
    const varType = MetaType.typeOnly(type);

    this.context.addVariable(Constness.Constant, ast.name, varType);
    return new EmptyExpression(ast.location, varType);
  }

  evaluateIf(ast: IfAST) {
    const tempVarName = this.context.environment.addTempVariable("__macaron$ifTemp");

    const ifContext = this.context.newChild();
    const cond = new Evaluator(ifContext).evaluate(ast.condition).get();

    const ifTrue = new Evaluator(ifContext.newChild()).evaluateExpressions(ast.ifTrue).map(e => e.get());
    const ifFalse = new Evaluator(ifContext.newChild()).evaluateExpressions(ast.ifFalse).map(e => e.get());

    return new IfExpression(ast.location, cond, ifTrue, ifFalse, tempVarName);
  }

  evaluateType(ast: ExpressionAST): Type {
    if (ast instanceof IdentifierAST) {
      return this.evaluateTypeIdentifier(ast);
    } else if (ast instanceof BinaryAST) {
      return this.evaluateTypeBinary(ast);
    } else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateTypeIdentifier(ast: IdentifierAST): Type {
    const {member} = this.context.getVariable(ast);
    const type = member.type.get();
    if (type instanceof MetaType) {
      return type.metaType;
    }
    throw CompilationError.typeError(
      `Expression does not represent type`,
      ast.location
    );
  }

  evaluateTypeBinary(ast: BinaryAST): Type {
    const left = this.evaluateType(ast.left);
    const right = this.evaluateType(ast.left);

    switch (ast.operator.name) {
      case "&": {
        return new IntersectionType([left, right], ast.location);
      }
      case "|": {
        return new UnionType([left, right], ast.location);
      }
      default: {
        throw new Error(`Unsupported type operator: ${ast.operator.name}`);
      }
    }
  }
}
