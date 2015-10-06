import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import MetaType from "../type/MetaType";
import {voidType} from "../nativeTypes";
import CallSignature from "../CallSignature";
import Thunk from "../Thunk";
import ExpressionThunk from "../thunk/ExpressionThunk";
import Member, {Constness} from "../Member";
import CompilationError from "../../common/CompilationError";
import FunctionExpression from "./FunctionExpression";
import SourceLocation from "../../common/SourceLocation";

export default
class ClassExpression extends Expression {
  members: ExpressionThunk[] = [];
  superType: Type;
  selfType: Type;

  constructor(location: SourceLocation, public name: Identifier, public superExpression: Expression) {
    super(location);

    let superType: Type;
    if (superExpression) {
      const superValueType = superExpression.type;
      if (superValueType instanceof MetaType) {
        superType = superValueType.metaType;
      } else {
        throw new Error("super value is not a type");
      }
    }
    else {
      // TODO: superType must be Object
      superType = voidType;
    }
    this.superType = superType;

    const type = this.selfType = new Type(name.name, location, this);
    type.inherit(superType);

    // TODO: class type must inherit Function
    const classType = this.type = new MetaType(`class ${name.name}`, type);
    classType.newSignatures = [new CallSignature(voidType, [], type)];
  }

  addMember(constness: Constness, name: Identifier, member: ExpressionThunk) {
    const type = this.selfType;
    type.members.set(name.name, new Member(constness, member.type));

    const superType = this.superType;
    const superMember = superType.members.get(name.name);
    const errors: string[] = [];
    if (superMember && !superMember.type.get().isAssignable(member.type.get(), errors)) {
      throw CompilationError.typeError(
        name.location,
        `Type of "${name.name}" is not compatible to super types`,
        ...errors
      );
    }

    if (name.name === "constructor") {
      this.type.newSignatures = member.type.get().callSignatures.map(sig => {
        return new CallSignature(voidType, sig.params, type);
      });
    }

    this.members.push(member);
  }
}
