import DeclarationType from "../DeclarationType";
import {voidType, numberType, stringType} from "../nativeTypes";
import Type from "../Type";
import SourceLocation from "../../common/SourceLocation";
import Identifier from "../Identifier";
import CompilationError from "../../common/CompilationError";

export default
class Expression {
  constructor(public location: SourceLocation) {
  }

  get type(): Type {
    return voidType;
  }
}

export
class IdentifierExpression extends Expression {
  constructor(public name: Identifier, public type: Type) {
    super(name.location);
  }
}

export
class AssignmentExpression extends Expression {
  constructor(location: SourceLocation, public declarationType: DeclarationType, public assignable: Identifier, public value: Expression) {
    super(location);
    this.type = value.type;
  }
}

export
class FunctionCallExpression extends Expression {
  function: Expression;
  arguments: Expression[];
  isNewCall: boolean;

  constructor(location: SourceLocation, func: Expression, args: Expression[], isNewCall: boolean) {
    super(location);
    this.isNewCall = isNewCall;
    this.function = func;
    this.arguments = args;

    const sigs = isNewCall ? func.type.callSignatures : func.type.newSignatures;
    const argTypes = args.map(a => a.type);
    const sig = sigs.find(sig => sig.isCallable(voidType, argTypes));
    if (!sig) {
      throw CompilationError.typeError(
        `Type ${func.type} cannot be called with ${argTypes.join(",")}`,
        location
      );
    }
    this.type = sig.returnType;
  }
}

export
class LiteralExpression extends Expression {
  constructor(location: SourceLocation, public value: number|string) {
    super(location);
    if (typeof value === "number") {
      this.type = numberType;
    } else {
      this.type = stringType;
    }
  }
}

export
class ReturnExpression extends Expression {
  constructor(location: SourceLocation, public expression: Expression) {
    super(location);
    this.type = expression.type;
  }
}

export
class MemberAccessExpression extends Expression {
  constructor(location: SourceLocation, public object: Expression , public member: Identifier) {
    super(location);

    const members = object.type.members;
    if (!members.has(member.name)) {
      throw CompilationError.typeError(
        `Type '${object.type}' don't have member '${member.name}'`,
        location
      );
    }
    this.type = members.get(member.name);
  }
}
