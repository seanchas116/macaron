import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import {voidType} from "../nativeTypes";
import CallSignature from "../CallSignature";
import CompilationError from "../../common/CompilationError";
import FunctionExpression from "./FunctionExpression";
import SourceLocation from "../../common/SourceLocation";

export default
class ClassExpression extends Expression {
  members: FunctionExpression[];

  constructor(location: SourceLocation, public name: Identifier, members: Expression[]) {
    super(location);

    // TODO: superclass
    const superType = voidType;

    const type = this.type = new Type(name.name, superType, this);
    type.newSignatures = [new CallSignature(voidType, [], type)];
    for (const member of members) {
      if (member instanceof FunctionExpression) {
        type.selfMembers.set(member.name.name, member.type);

        const superMember = superType.members.get(name.name);
        if (superMember && !type.isCastableTo(superMember)) {
          throw CompilationError.typeError(
            `Type of "${name}" is not compatible to super types`,
            member.name.location
          );
        }

        if (member.name.name === "constructor") {
          type.newSignatures = member.type.callSignatures.map(sig => {
            return new CallSignature(voidType, sig.params, type);
          });
        }
      } else {
        throw new Error(`Not supported expression as class member: ${member.constructor.name}`);
      }
    }
    this.members = <FunctionExpression[]>members;
  }
}
