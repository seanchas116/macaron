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

import TypeExpression, {
  GenericsParameterExpression
} from "./TypeExpression";

import FunctionExpression from "./expression/FunctionExpression";
import FunctionBodyExpression from "./expression/FunctionBodyExpression";

import AssignableExpression, {IdentifierAssignableExpression} from "./AssignableExpression";

import Type from "./Type";
import FunctionType from "./type/FunctionType";
import GenericsParameterType from "./type/GenericsParameterType";
import GenericsType from "./type/GenericsType";

import TypeThunk from "./thunk/TypeThunk";
import ExpressionThunk from "./thunk/ExpressionThunk";

import Member, {Constness} from "./Member";
import {voidType, numberType, booleanType, stringType} from "./defaultEnvironment";
import CompilationError from "../common/CompilationError";
import SourceRange from "../common/SourceRange";
import Identifier from "./Identifier";
import Environment from "./Environment";

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

  buildAssignment(range: SourceRange, left: AssignableExpression, right: Expression) {
    if (left instanceof IdentifierAssignableExpression) {
      const varName = left.name;
      this.environment.checkAssignVariable(left.name, right.type);
      return new AssignmentExpression(range, left, right);
    }
    throw new Error(`unsupported assignable Expression: ${left.constructor.name}`);
  }

  buildNewVariable(
    range: SourceRange, constness: Constness,
    left: AssignableExpression, right: Expression
  ) {
    if (left instanceof IdentifierAssignableExpression) {
      const varName = left.name;
      const type = left.type || right.type;
      this.environment.checkAddVariable(constness, left.name, type);
      this.environment.checkAssignVariable(left.name, right.type, true);
      return new NewVariableExpression(range, constness, left, right);
    }
    throw new Error(`unsupported assignable Expression: ${left.constructor.name}`);
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
      if (func instanceof MemberAccessExpression || func instanceof OperatorAccessExpression) {
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
      throw CompilationError.typeError(range,
        `Type '${funcType}' cannot be called with [${argTypes.join(", ")}]`,
        ...reasons
      );
    }
    return new FunctionCallExpression(range, func, args, isNewCall, sig.returnType);
  }

  buildLiteral(range: SourceRange, value: any) {
    return new LiteralExpression(range, value);
  }

  buildMemberAccess(range: SourceRange, object: Expression, member: Identifier) {
    return new MemberAccessExpression(range, object, member);
  }

  buildIf(
    range: SourceRange,
    evalCondition: (env: Environment) => Expression,
    evalIfTrue: (env: Environment) => Expression[],
    evalIfFalse: (env: Environment) => Expression[]
  ) {
    const tempVarName = this.environment.addTempVariable("__macaron$ifTemp");

    const ifEnv = this.environment.newChild();
    const cond = evalCondition(ifEnv);

    const ifTrue = evalIfTrue(ifEnv.newChild());
    const ifFalse = evalIfFalse(ifEnv.newChild());

    return new IfExpression(range, this.environment, cond, ifTrue, ifFalse, tempVarName);
  }

  buildFunction(
    range: SourceRange,
    name: Identifier,
    evalParameters: (env: Environment) => AssignableExpression[],
    evalBody: (env: Environment) => FunctionBodyExpression,
    thisType: Type,
    returnType: Type
  ) {
    const subEnv = this.environment.newChild(thisType);
    const parameters = evalParameters(subEnv);

    for (const param of parameters) {
      if (param instanceof IdentifierAssignableExpression) {
        subEnv.checkAddVariable(Constness.Constant, param.name, param.type);
      } else {
        throw new Error(`unsupported assignable Expression: ${param.constructor.name}`);
      }
    }

    subEnv.checkAddVariable(Constness.Constant, new Identifier("this"), thisType);

    const paramTypes = parameters.map(p => p.type);
    const createType = (returnType: Type) =>
      new FunctionType(thisType, paramTypes, [], returnType, subEnv, range);

    const predefinedType = returnType && createType(returnType);

    return new ExpressionThunk(range, () => {
      const body = evalBody(subEnv);
      const type = predefinedType || createType(body.type);
      return new FunctionExpression(range, name, type, parameters, body);
    }, predefinedType);
  }

  buildGenericsParameter(
    range: SourceRange,
    name: Identifier,
    constraint: TypeExpression
  ) {
    const type = new GenericsParameterType(
      name.name, constraint.type.metaType,
      this.environment, range
    );
    return new GenericsParameterExpression(range, name, constraint, type);
  }

  buildGenerics(
    range: SourceRange,
    evalParams: (env: Environment) => GenericsParameterExpression[],
    evalValue: (env: Environment) => ExpressionThunk
  ) {
    const subEnv = this.environment.newChild();
    const params = evalParams(subEnv);

    for (const param of params) {
      subEnv.addGenericsPlaceholder(param.parameterType);
      subEnv.checkAddVariable(Constness.Constant, param.name, param.type);
    }
    const valueThunk = evalValue(subEnv);
    const typeThunk = new TypeThunk(
      range,
      () => {
        const template = valueThunk.type.get();
        return new GenericsType(
          template.name, params.map(p => p.parameterType), template,
          subEnv, range
        );
      }
    );
    return new ExpressionThunk(
      range,
      () => new GenericsExpression(range, params, typeThunk.get() as GenericsType, valueThunk.get()),
      typeThunk
    );
  }

  buildGenericsCall(
    range: SourceRange,
    value: Expression,
    args: TypeExpression[]
  ) {
    const genericsType = value.type;
    if (genericsType instanceof GenericsType) {
      const paramLength = genericsType.parameters.length
      if (paramLength !== args.length) {
        throw CompilationError.typeError(
          args[0].range,
          `Number of generics arguments wrong (${args.length} for ${paramLength})`
        );
      }

      const types = new Map<GenericsParameterType, Type>();
      for (const [i, placeholder] of genericsType.parameters.entries()) {
        const reasons: string[] = [];
        const {constraint} = placeholder;
        if (!constraint.isAssignable(args[i].type.metaType, reasons)) {
          throw CompilationError.typeError(
            args[i].range,
            `Cannot assign '${args[i]}' to type '${constraint}'`,
            ...reasons
          );
        }
        types.set(placeholder, args[i].type.metaType);
      }

      const type = genericsType.template.resolveGenerics(types);
      return new GenericsCallExpression(range, value, args, type);
    } else {
      throw CompilationError.typeError(value.range,
        `The value is not generic`
      );
    }
  }
}
