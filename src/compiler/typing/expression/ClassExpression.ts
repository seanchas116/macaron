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
  classType: Type;
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

    const type = this.selfType = new Type(name.name, [superType], location, this);

    // TODO: class type must inherit Function
    const classType = this.classType = new Type(`${name.name} class`, [superType]);
    classType.selfNewSignatures = [new CallSignature(voidType, [], type)];

    this.type = new MetaType(`[class ${name}]`, type, classType);
  }

  addMember(constness: Constness, name: Identifier, member: ExpressionThunk) {
    const type = this.selfType;
    type.addMember(name.name, new Member(constness, member.type));

    const superType = this.superType;
    const superMember = superType.getMember(name.name);
    if (superMember && !superMember.type.get().isAssignable(member.type.get())) {
      throw CompilationError.typeError(
        name.location,
        `Type of "${name.name}" is not compatible to super types`
      );
    }

    if (name.name === "constructor") {
      this.classType.selfNewSignatures = member.type.get().getCallSignatures().map(sig => {
        return new CallSignature(voidType, sig.params, type);
      });
    }

    this.members.push(member);
  }
}
