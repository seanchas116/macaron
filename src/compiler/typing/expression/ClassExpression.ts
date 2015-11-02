import Expression from "../Expression";
import {EmptyTypeExpression} from "../TypeExpression";
import InterfaceExpression from "./InterfaceExpression";
import ExpressionThunk from "../thunk/ExpressionThunk";
import Identifier from "../Identifier";
import SourceRange from "../../common/SourceRange";
import {voidType} from "../defaultEnvironment";
import MetaType from "../type/MetaType";
import InterfaceType from "../type/InterfaceType";
import CallSignature from "../CallSignature";
import Environment from "../Environment";
import {Constness} from "../Member";

export default
class ClassExpression extends InterfaceExpression {
  classType: InterfaceType;

  constructor(range: SourceRange, env: Environment, public name: Identifier, public superExpression: Expression) {
    // TODO: inherit Object by default
    super(range, env, name, [superExpression || new EmptyTypeExpression(voidType)]);

    const classType = this.classType = new InterfaceType(`class ${name.name}`, this.superTypes, env, range);
    this.type = new MetaType(classType, this.selfType, env, range);
    classType.newSignatures = [new CallSignature(voidType, [], this.selfType)];
  }

  addMember(constness: Constness, name: Identifier, member: Expression|ExpressionThunk) {
    super.addMember(constness, name, member)

    if (name.name === "constructor") {
      const memberThunk = ExpressionThunk.resolve(member);
      this.classType.newSignatures = memberThunk.type.get().getCallSignatures().map(sig => {
        return new CallSignature(voidType, sig.params, this.selfType);
      });
    }
  }
}
