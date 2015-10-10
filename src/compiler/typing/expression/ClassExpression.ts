import Expression, {EmptyExpression, EmptyTypeExpression} from "../Expression";
import InterfaceExpression from "./InterfaceExpression";
import ExpressionThunk from "../thunk/ExpressionThunk";
import Identifier from "../Identifier";
import SourceLocation from "../../common/SourceLocation";
import {voidType} from "../nativeTypes";
import MetaType from "../type/MetaType";
import CallSignature from "../CallSignature";
import {Constness} from "../Member";

export default
class ClassExpression extends InterfaceExpression {
  constructor(location: SourceLocation, public name: Identifier, public superExpression: Expression) {
    // TODO: inherit Object by default
    super(location, name, [superExpression || new EmptyTypeExpression(voidType)]);

    const classType = this.type = new MetaType(`class ${name.name}`, this.selfType);
    classType.newSignatures = [new CallSignature(voidType, [], this.selfType)];
  }

  addMember(constness: Constness, name: Identifier, member: ExpressionThunk) {
    super.addMember(constness, name, member)

    if (name.name === "constructor") {
      this.type.newSignatures = member.type.get().callSignatures.map(sig => {
        return new CallSignature(voidType, sig.params, this.selfType);
      });
    }
  }
}
