import {
  ExpressionAST,
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
  TypeExpressionAST,
  TypeIdentifierAST,
} from "../parser/AST";

import Expression, {
  LiteralExpression,
  IdentifierExpression,
  AssignmentExpression,
  FunctionCallExpression,
  ReturnExpression,
  MemberAccessExpression,
  OperatorAccessExpression,
  IfExpression,
} from "./Expression";
import FunctionExpression from "./expression/FunctionExpression";
import FunctionBodyExpression from "./expression/FunctionBodyExpression";
import ClassExpression from "./expression/ClassExpression";

import AssignType from "./AssignType";
import Identifier from "./Identifier";
import Type from "./Type";
import {ExpressionThunk, TypeThunk} from "./Thunk";
import {voidType} from "./nativeTypes";
import CallSignature from "./CallSignature";

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
    if (ast instanceof AssignmentAST) {
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
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluate(ast: ExpressionAST) {
    return ExpressionThunk.resolve(this.evaluateImpl(ast));
  }

  evaluateAssignment(ast: AssignmentAST) {
    const varName = ast.left.name;
    const right = this.evaluate(ast.right).get();
    const type = (() => {
      switch (ast.declaration) {
      case "let":
        return AssignType.Constant;
      case "var":
        return AssignType.Variable;
      default:
        return AssignType.Assign;
      }
    })();
    this.context.assignVariable(type, ast.left, right.type);
    return new AssignmentExpression(ast.location, type, ast.left, right);
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

  evaluateIdentifier(ast: IdentifierAST) {
    const variable = this.context.getVariable(ast);
    return new IdentifierExpression(ast, variable.type.get());
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
    const subContext = this.context.newChild();
    const subEvaluator = new Evaluator(subContext);

    for (const {name, type: typeExpr} of ast.parameters) {
      const type = subEvaluator.evaluateType(typeExpr).get();
      subContext.assignVariable(AssignType.Constant, name, type);
      paramTypes.push(type);
    }

    subContext.assignVariable(AssignType.Constant, new Identifier("this"), thisType);

    const bodyThunk = new ExpressionThunk(location, () => {
      const body = subEvaluator.evaluateExpressions(ast.expressions).map(e => e.get());
      return new FunctionBodyExpression(location, body);
    });
    const type = new Type("function", voidType);
    const returnType = ast.returnType ? subEvaluator.evaluateType(ast.returnType) : bodyThunk.type;
    const callSig = new CallSignature(thisType, paramTypes, returnType);
    type.callSignatures.push(callSig);

    const funcThunk = new ExpressionThunk(location, () => {
      return new FunctionExpression(location, ast.name, type, ast.parameters.map(p => p.name), <FunctionBodyExpression>bodyThunk.get());
    });

    if (ast.addAsVariable) {
      const thunk = new ExpressionThunk(location, () => {
        return new AssignmentExpression(location, AssignType.Constant, ast.name, funcThunk.get());
      });
      this.context.assignVariable(AssignType.Constant, ast.name, type);
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
      const expr = new ClassExpression(ast.location, ast.name);
      for (const memberAST of ast.members) {
        const member = this.evaluateFunction(memberAST, expr.type);
        expr.addMember(memberAST.name, member);
      }
      return expr;
    });
    this.context.assignVariable(AssignType.Constant, ast.name, thunk.type);
    this.context.addType(ast.name, thunk.type);
    return thunk;
  }

  evaluateIf(ast: IfAST) {
    const tempVarName = this.context.environment.addTempVariable("__macaron$ifTemp");

    const ifContext = this.context.newChild();
    const cond = new Evaluator(ifContext).evaluate(ast.condition).get();

    const ifTrue = new Evaluator(ifContext.newChild()).evaluateExpressions(ast.ifTrue).map(e => e.get());
    const ifFalse = new Evaluator(ifContext.newChild()).evaluateExpressions(ast.ifFalse).map(e => e.get());

    return new IfExpression(ast.location, cond, ifTrue, ifFalse, tempVarName);
  }

  evaluateType(ast: TypeExpressionAST): TypeThunk {
    if (ast instanceof TypeIdentifierAST) {
      return this.evaluateTypeIdentifier(ast);
    }
    else {
      throw new Error(`Not supported AST: ${ast.constructor.name}`);
    }
  }

  evaluateTypeIdentifier(ast: TypeIdentifierAST) {
    return this.context.getType(ast);
  }
}
