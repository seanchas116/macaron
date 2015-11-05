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

import SourceRange from "../common/SourceRange";
import Identifier from "./Identifier";
import Environment from "./Environment";
import AssignableExpression, {IdentifierAssignbleExpression} from "./AssignableExpression";
import Type from "./Type";
import TypeThunk from "./thunk/TypeThunk";
import Member, {Constness} from "./Member";
import {voidType, numberType, booleanType, stringType} from "./defaultEnvironment";
import CompilationError from "../common/CompilationError";

export default
class ExpressionBuilder {
  constructor(public environment: Environment) {
  }

  buildIdentifier(range: SourceRange, name: Identifier): Expression {
    const {member, needsThis} = this.environment.checkGetVariable(name);

    if (needsThis) {
      const thisIdentifier = new Identifier("this", range);
      const {member: thisMember} = this.environment.checkGetVariable(thisIdentifier);
      const thisExpr = new IdentifierExpression(range, thisIdentifier, thisMember.type.get());
      return new MemberAccessExpression(range, thisExpr, name);
    } else {
      return new IdentifierExpression(range, name, member.type.get());
    }
  }

  buildAssignment(range: SourceRange, left: IdentifierAssignbleExpression, right: Expression) {
    const varName = left.name;

    this.environment.checkAssignVariable(left, right.type);
    return new AssignmentExpression(range, left, right);
  }

  buildNewVariable(
    range: SourceRange, constness: Constness,
    left: IdentifierAssignbleExpression, right: Expression
  ) {
    const varName = left.name;
    const type = left.type || right.type;
    this.environment.checkAddVariable(constness, left, type);
    this.environment.checkAssignVariable(left, right.type, true);
    return new NewVariableExpression(range, constness, left, right);
  }

  buildUnary(range: SourceRange, operator: Identifier, operand: Expression) {
    const operatorAccess = new OperatorAccessExpression(range, operand, operator, 1);
    return this.buildFunctionCall(range, operatorAccess, [], false);
  }

  buildBinary(range: SourceRange, operator: Identifier, left: Expression, right: Expression) {
    const operatorAccess = new OperatorAccessExpression(range, left, operator, 2);
    return this.buildFunctionCall(range, operatorAccess, [right], false);
  }

  buildFunctionCall(range: SourceRange, func: Expression, args: Expression[], isNewCall: boolean) {
    let selfType: Type = voidType;
    let hasSelf = false;
    if (!isNewCall) {
      if (func instanceof MemberAccessExpression) {
        selfType = func.object.type;
        hasSelf = true;
      }
      if (func instanceof OperatorAccessExpression) {
        selfType = func.object.type;
        hasSelf = true;
      }
    }

    const funcType = func.type;
    const sigs = isNewCall ? funcType.getNewSignatures() : funcType.getCallSignatures();
    const argTypes = args.map(a => a.type);
    const reasons: string[] = [];
    const sig = sigs.find(sig => sig.isCallable(selfType, argTypes, reasons, hasSelf)); // ignore self type check on method call
    if (!sig) {
      throw CompilationError.typeError(
        range,
        `Type '${funcType}' cannot be called with [${argTypes.join(", ")}]`,
        ...reasons
      );
    }
    return new FunctionCallExpression(range, func, args, isNewCall, sig.returnType);
  }
}
