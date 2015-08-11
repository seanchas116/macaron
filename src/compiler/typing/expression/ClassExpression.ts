import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import {voidType} from "../nativeTypes";
import CallSignature from "../CallSignature";
import Thunk, {ExpressionThunk, TypeThunk} from "../Thunk";
import CompilationError from "../../common/CompilationError";
import FunctionExpression from "./FunctionExpression";
import SourceLocation from "../../common/SourceLocation";

export default
class ClassExpression extends Expression {
  members: ExpressionThunk[] = [];
  superType: Type;

  constructor(location: SourceLocation, public name: Identifier) {
    super(location);

    // TODO: superclass
    const superType = this.superType =  voidType;

    const type = this.type = new Type(name.name, superType, this);
    type.newSignatures = [new CallSignature(voidType, [], type)];
  }

  addMember(name: Identifier, member: ExpressionThunk) {
    const type = this.type;
    type.addMember(name.name, member.type);

    const superMember = this.superType.getMember(name.name);
    if (superMember && !type.isCastableTo(superMember.get())) {
      throw CompilationError.typeError(
        `Type of "${name}" is not compatible to super types`,
        name.location
      );
    }

    if (name.name === "constructor") {
      type.newSignatures = member.type.get().callSignatures.map(sig => {
        return new CallSignature(voidType, sig.params, type);
      });
    }

    this.members.push(member);
  }
}
