import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import {voidType} from "../nativeTypes";
import CallSignature from "../CallSignature";
import Thunk from "../Thunk";
import ExpressionThunk from "../thunk/ExpressionThunk";
import MetaValue from "../MetaValue";
import Member, {Constness} from "../Member";
import CompilationError from "../../common/CompilationError";
import FunctionExpression from "./FunctionExpression";
import SourceLocation from "../../common/SourceLocation";

export default
class ClassExpression extends Expression {
  members: ExpressionThunk[] = [];
  classType: Type;
  superType: Type;
  selfType: Type;

  constructor(location: SourceLocation, public name: Identifier, public superExpression: Expression) {
    super(location);

    let superType: Type;
    if (superExpression) {
      superType = superExpression.metaValue.metaType;
    }
    else {
      // TODO: superType must be Object
      superType = voidType;
    }
    this.superType = superType;

    const type = this.selfType = new Type(name.name, [superType], location, this);

    // TODO: class type must inherit Function
    const classType = this.classType = new Type(`${name.name} class`, [superType]);
    classType.newSignatures = [new CallSignature(voidType, [], type)];

    this.metaValue = new MetaValue(classType, type);
  }

  addMember(constness: Constness, name: Identifier, member: ExpressionThunk) {
    const type = this.selfType;
    type.addMember(name.name, new Member(constness, member.metaValue));

    const superType = this.superType;
    const superMember = superType.getMember(name.name);
    if (superMember && !type.isCastableTo(superMember.getType())) {
      throw CompilationError.typeError(
        `Type of "${name.name}" is not compatible to super types`,
        name.location
      );
    }

    if (name.name === "constructor") {
      this.classType.newSignatures = member.metaValue.get().valueType.callSignatures.map(sig => {
        return new CallSignature(voidType, sig.params, type);
      });
    }

    this.members.push(member);
  }
}
