import Expression, {
  LiteralExpression,
  IdentifierExpression,
  AssignmentExpression,
  NewVariableExpression,
  FunctionCallExpression,
  GenericsCallExpression,
  MemberAccessExpression,
  OperatorAccessExpression,
  IfExpression,
  FunctionBodyExpression,
  FunctionExpression,
  LazyExpression,
  TypeOnlyExpression,
  NamedExpression
} from "./Expression";

import TypeExpression, {
  GenericsParameterExpression
} from "./TypeExpression";

import {InterfaceExpression, ClassExpression} from "./ClassExpression";

import AssignableExpression, {IdentifierAssignableExpression} from "./AssignableExpression";

import Type from "./Type";
import InterfaceType from "./type/InterfaceType";
import UnionType from "./type/UnionType";
import FunctionType from "./type/FunctionType";
import GenericsParameterType from "./type/GenericsParameterType";
import GenericsType from "./type/GenericsType";
import MetaType from "./type/MetaType";
import CallSignature from "./CallSignature";
import Thunk from "./Thunk";
import Operator from "./Operator";
import Member, {Constness} from "./Member";
import {voidType, numberType, booleanType, stringType} from "./defaultEnvironment";
import CompilationError from "../common/CompilationError";
import SourceRange from "../common/SourceRange";
import Identifier from "./Identifier";
import Environment from "./Environment";

function blockType(block: Expression[]) {
  if (block.length > 0) {
    return block[block.length - 1].valueType;
  } else {
    return voidType;
  }
}

export default
class ExpressionBuilder {
  constructor(public environment: Environment) {
  }

  buildIdentifier(range: SourceRange, name: Identifier): Expression {
    const {member, needsThis} = this.environment.checkGetVariable(name);
    const type = member.type.get();

    if (needsThis) {
      const thisIdentifier = new Identifier("this", range);
      const {member: thisMember} = this.environment.checkGetVariable(thisIdentifier);
      const thisExpr = new IdentifierExpression(range, thisIdentifier, thisMember.type.get());
      return new MemberAccessExpression(range, thisExpr, name, type);
    } else {
      return new IdentifierExpression(range, name, type);
    }
  }

  buildAssignment(range: SourceRange, left: AssignableExpression, right: Expression) {
    if (left instanceof IdentifierAssignableExpression) {
      this.environment.checkAssignVariable(left.name, right.valueType);
      return new AssignmentExpression(range, left, right, right.valueType);
    }
    throw new Error(`unsupported assignable Expression: ${left.constructor.name}`);
  }

  buildNewVariable(
    range: SourceRange, constness: Constness,
    left: AssignableExpression, right: Expression
  ): Expression {
    if (left instanceof IdentifierAssignableExpression) {
      if (left.type) {
        this.environment.checkAddVariable(constness, left.name, left.type);
        this.environment.checkAssignVariable(left.name, right.valueType, true);
        return new NewVariableExpression(range, constness, left, right, right.valueType);
      } else {
        // Expression can be lazy
        this.environment.checkAddVariable(constness, left.name, new Thunk(right.range, () => right.valueType));
        return this.buildLazy(range, left.name, () => new NewVariableExpression(range, constness, left, right, right.valueType));
      }
    }
    throw new Error(`unsupported assignable Expression: ${left.constructor.name}`);
  }

  buildUnary(range: SourceRange, operator: Identifier, operand: Expression) {
    const operatorAccess = this.buildOperatorAccess(range, operand, operator, 1);
    return this.buildFunctionCall(range, operatorAccess, [], false);
  }

  buildBinary(range: SourceRange, operator: Identifier, left: Expression, right: Expression) {
    const operatorAccess = this.buildOperatorAccess(range, left, operator, 2);
    return this.buildFunctionCall(range, operatorAccess, [right], false);
  }

  buildFunctionCall(range: SourceRange, func: Expression, args: Expression[], isNewCall: boolean) {
    let selfType: Type = voidType;
    let hasSelf = false;
    if (!isNewCall) {
      if (func instanceof MemberAccessExpression || func instanceof OperatorAccessExpression) {
        selfType = func.object.valueType;
        hasSelf = true;
      }
    }

    const funcType = func.valueType;
    const sigs = isNewCall ? funcType.getNewSignatures() : funcType.getCallSignatures();
    const argTypes = args.map(a => a.valueType);
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
    const valueType = (() => {
      switch (typeof value) {
        case "number":
          return numberType;
        case "string":
          return stringType;
        case "boolean":
          return booleanType;
        default:
          return voidType;
      }
    })();
    return new LiteralExpression(range, value, valueType);
  }

  buildMemberAccess(range: SourceRange, object: Expression, member: Identifier) {
    const objectType = object.valueType;

    if (!objectType.getMember(member.name)) {
      throw CompilationError.typeError(
        range,
        `Type '${objectType}' don't have member '${member.name}'`
      );
    }
    const valueType = objectType.getMember(member.name).type.get();
    return new MemberAccessExpression(range, object, member, valueType);
  }

  buildOperatorAccess(
    range: SourceRange,
    object: Expression,
    operatorName: Identifier,
    arity: number
  ) {
    const objectType = object.valueType;
    let operator: Operator;
    if (arity === 1) {
      operator = objectType.getUnaryOperators().get(operatorName.name);
    } else if (arity === 2) {
      operator = objectType.getBinaryOperators().get(operatorName.name);
    } else {
      throw new Error("unsupported arity");
    }
    if (!operator) {
      throw CompilationError.typeError(
        operatorName.range,
        `No operator '${operatorName.name}' for type '${objectType}'`
      );
    }
    const valueType = operator.type;
    return new OperatorAccessExpression(range, object, operator, valueType);
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
    const valueType = new UnionType([blockType(ifTrue), blockType(ifFalse)], ifEnv, range);

    return new IfExpression(range, this.environment, cond, ifTrue, ifFalse, tempVarName, valueType);
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

    return this.buildLazy(
      range, name,
      () => {
        const body = evalBody(subEnv);
        const type = predefinedType || createType(body.valueType);
        return new FunctionExpression(range, name, type, parameters, body);
      },
      predefinedType && (() => predefinedType)
    );
  }

  buildFunctionBody(
    range: SourceRange,
    exprs: Expression[]
  ) {
    const returnType = exprs[exprs.length - 1].valueType;
    return new FunctionBodyExpression(range, exprs, returnType);
  }

  buildGenericsParameter(
    range: SourceRange,
    name: Identifier,
    constraint: TypeExpression
  ) {
    const type = new GenericsParameterType(
      name.name, constraint.metaType,
      this.environment, range
    );
    return new GenericsParameterExpression(range, name, constraint, type);
  }

  buildGenerics(
    range: SourceRange,
    evalParams: (env: Environment) => GenericsParameterExpression[],
    evalValue: (env: Environment) => NamedExpression
  ) {
    const subEnv = this.environment.newChild();
    const params = evalParams(subEnv);

    for (const param of params) {
      subEnv.addGenericsPlaceholder(param.metaType);
      subEnv.checkAddVariable(Constness.Constant, param.name, MetaType.typeOnly(param.metaType));
    }
    const value = evalValue(subEnv);
    return this.buildLazy(
      range,
      value.name,
      () => value,
      () => {
        const template = value.valueType;
        return new GenericsType(
          template.name, params.map(p => p.metaType), template,
          subEnv, range
        );
      }
    );
  }

  buildGenericsCall(
    range: SourceRange,
    value: Expression,
    args: TypeExpression[]
  ) {
    const genericsType = value.valueType;
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
        if (!constraint.isAssignable(args[i].metaType, reasons)) {
          throw CompilationError.typeError(
            args[i].range,
            `Cannot assign '${args[i]}' to type '${constraint}'`,
            ...reasons
          );
        }
        types.set(placeholder, args[i].metaType);
      }

      const type = genericsType.template.resolveGenerics(types);
      return new GenericsCallExpression(range, value, args, type);
    } else {
      throw CompilationError.typeError(value.range,
        `The value is not generic`
      );
    }
  }

  buildLazy(range: SourceRange, name: Identifier, getExpr: () => Expression, getType: () => Type = null) {
    const exprThunk = new Thunk(range, getExpr);
    if (!getType) {
      getType = () => exprThunk.get().valueType;
    }
    const typeThunk = new Thunk(range, getType);
    return new LazyExpression(range, name, exprThunk, typeThunk);
  }

  buildTypeOnly(range: SourceRange, typeExpr: TypeExpression) {
    return new TypeOnlyExpression(range, typeExpr, voidType);
  }
}

export
class InterfaceExpressionBuilder {
  members: [Constness, Identifier, Expression][] = [];
  selfType = this.createSelfType();

  constructor(public range: SourceRange, public environment: Environment, public name: Identifier, public superExpressions: TypeExpression[]) {
  }

  addMember(constness: Constness, name: Identifier, member: Expression) {
    for (const superType of this.superTypes()) {
      const superMember = superType.getMember(name.name);
      const errors: string[] = [];
      if (superMember && !superMember.type.get().isAssignable(member.valueType, errors)) {
        throw CompilationError.typeError(
          name.range,
          `Type of "${name.name}" is not compatible to super types`,
          ...errors
        );
      }
    }
    this.selfType.selfMembers.set(name.name, new Member(constness, new Thunk(member.range, () => member.valueType)));
    this.members.push([constness, name, member]);
  }

  superTypes() {
    return this.superExpressions.map(e => e.metaType);
  }

  createSelfType() {
    return new InterfaceType(this.name.name, this.superTypes(), this.environment, this.range);
  }

  buildInterface() {
    return new InterfaceExpression(
      this.range,
      this.name,
      this.superExpressions,
      this.members.map(m => m[2]),
      this.environment,
      this.selfType
    );
  }
}

export
class ClassExpressionBuilder extends InterfaceExpressionBuilder {
  classType = this.createClassType();

  constructor(range: SourceRange, environment: Environment, public name: Identifier, public superExpression: TypeExpression, public superClassExpression: Expression) {
    super(range, environment, name, superExpression ? [superExpression] : []);
  }

  createSelfType() {
    return new InterfaceType(this.name.name, this.superTypes(), this.environment, this.range);
  }

  createClassType() {
    return new InterfaceType(
      `class ${this.name.name}`,
      this.superClassExpression ? [this.superClassExpression.valueType] : [],
      this.environment, this.range
    );
  }

  buildClass() {
    const valueType = new MetaType(
      this.classType, this.selfType,
      this.environment, this.range
    );
    let newSignatures = [new CallSignature(voidType, [], this.selfType)];
    for (const [constness, name, expr] of this.members) {
      if (name.name === "constructor") {
        newSignatures = expr.valueType.getCallSignatures().map(sig => {
          return new CallSignature(voidType, sig.params, this.selfType);
        });
      }
    }
    this.classType.newSignatures = newSignatures;
    return new ClassExpression(
      this.range,
      this.name,
      this.superExpression,
      this.superClassExpression,
      this.members.map(m => m[2]),
      this.environment,
      valueType,
      this.selfType
    )
  }
}
