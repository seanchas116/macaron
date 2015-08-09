import Expression from "./Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import {voidType} from "../nativeTypes";
import CompilationError from "../../common/CompilationError";
import FunctionExpression from "./FunctionExpression";
import SourceLocation from "../../common/SourceLocation";

export default
class ClassExpression extends Expression {
  _type: Type;

  constructor(location: SourceLocation, public name: Identifier, public members: FunctionExpression[]) {
    super(location);

    // TODO: superclass
    const superType = voidType;

    const type = this._type = new Type(name.name, superType, this);
    for (const member of members) {
      type.selfMembers.set(member.name.name, member.type);

      const superMember = superType.getMembers().get(name);
      if (superMember && !type.isCastableTo(superMember)) {
        throw CompilationError.typeError(
          `Type of "${name}" is not compatible to super types`,
          member.name.location
        );
      }

      if (member.name.name === "constructor") {
        type.newSignatures.push(...member.type.callSignatures);
      }
    }
  }

  get type() {
    return this._type;
  }
}
