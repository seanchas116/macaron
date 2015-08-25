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
} from "./Expression";
import FunctionExpression from "./expression/FunctionExpression";
import FunctionBodyExpression from "./expression/FunctionBodyExpression";
import ClassExpression from "./expression/ClassExpression";

import Identifier from "./Identifier";
import Type from "./Type";
import ExpressionThunk from "./thunk/ExpressionThunk";
import {voidType, typeOnlyType} from "./nativeTypes";
import CallSignature from "./CallSignature";
import Member, {Constness} from "./Member";
import MetaValue from "./MetaValue";
import MetaValueThunk from "./thunk/MetaValueThunk";

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

    if (ast.declaration) {
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
      this.context.addVariable(constness, ast.left, right.metaValue);
      return new NewVariableExpression(ast.location, constness, ast.left, right);
    }
    else {
      this.context.assignVariable(ast.left, right.metaValue);
      return new AssignmentExpression(ast.location, ast.left, right);
    }
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
    const metaValue = variable.metaValue.get();

    let literalValue: any = null;
    if (variable.constness != Constness.Variable) {
      literalValue = metaValue.literalValue;
    }
    return new IdentifierExpression(ast, new MetaValue(metaValue.type, literalValue, metaValue.metaType));
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
      const type = subEvaluator.evaluateType(typeExpr);
      subContext.addVariable(Constness.Constant, name, new MetaValue(type));
      paramTypes.push(type);
    }

    subContext.addVariable(Constness.Constant, new Identifier("this"), new MetaValue(thisType));

    const bodyThunk = new ExpressionThunk(location, () => {
      const body = subEvaluator.evaluateExpressions(ast.expressions).map(e => e.get());
      return new FunctionBodyExpression(location, body);
    });

    const createType = (returnType: Type) => {
      const type = new Type("function", voidType);
      const callSig = new CallSignature(thisType, paramTypes, returnType);
      type.callSignatures.push(callSig);
      return type;
    }

    let metaValueThunk: MetaValueThunk;
    if (ast.returnType) {
      const returnType = subEvaluator.evaluateType(ast.returnType);
      const type = createType(returnType);
      metaValueThunk = MetaValueThunk.resolve(new MetaValue(type));
    }
    else {
      metaValueThunk = new MetaValueThunk(ast.location, () => {
        const returnType = bodyThunk.get().metaValue.type;
        const type = createType(returnType);
        return new MetaValue(type);
      });
    }

    const funcThunk = new ExpressionThunk(location, () => {
      return new FunctionExpression(location, ast.name, metaValueThunk.get().type, ast.parameters.map(p => p.name), <FunctionBodyExpression>bodyThunk.get());
    });

    if (ast.addAsVariable) {
      const thunk = new ExpressionThunk(location, () => {
        return new NewVariableExpression(location, Constness.Constant, ast.name, funcThunk.get());
      });
      this.context.addVariable(Constness.Constant, ast.name, metaValueThunk);
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
        const superValue = superExpr.metaValue;
        if (superValue.type == typeOnlyType || !superValue.metaType) {
          throw CompilationError.typeError(
            `Superclass is not a class`,
            ast.superclass.location
          );
        }
      }

      const expr = new ClassExpression(ast.location, ast.name, superExpr);
      for (const memberAST of ast.members) {
        const member = this.evaluateFunction(memberAST, expr.selfType);
        expr.addMember(Constness.Constant, memberAST.name, member);
      }
      return expr;
    });

    this.context.addVariable(Constness.Constant, ast.name, thunk.metaValue);
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

  evaluateType(ast: ExpressionAST) {
    const metaValue = this.evaluate(ast).get().metaValue;
    if (!metaValue.metaType) {
      throw CompilationError.typeError(
        `Expression does not represent type`,
        ast.location
      );
    }
    return metaValue.metaType;
  }
}
