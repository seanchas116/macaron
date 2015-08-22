import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import {voidType} from "../nativeTypes";
import CallSignature from "../CallSignature";
import Thunk from "../Thunk";
import TypeThunk from "../thunk/TypeThunk";
import ExpressionThunk from "../thunk/ExpressionThunk";
import MetaValue from "../MetaValue";
import Member, {Constness} from "../Member";
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

    const type = new Type(name.name, superType, location, this);
    this.metaValue = new MetaValue(type);
    type.newSignatures = [new CallSignature(voidType, [], type)];
  }

  addMember(constness: Constness, name: Identifier, member: ExpressionThunk) {
    const type = this.getType();
    type.addMember(name.name, new Member(constness, new MetaValue(member.type)));

    const superMember = this.superType.getMember(name.name);
    if (superMember && !type.isCastableTo(superMember.getType())) {
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
