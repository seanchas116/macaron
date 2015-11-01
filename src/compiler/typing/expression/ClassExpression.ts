import Expression from "../Expression";
import {EmptyTypeExpression} from "../TypeExpression";
import InterfaceExpression from "./InterfaceExpression";
import ExpressionThunk from "../thunk/ExpressionThunk";
import Identifier from "../Identifier";
import SourceRange from "../../common/SourceRange";
import {voidType} from "../nativeTypes";
import MetaType from "../type/MetaType";
import CallSignature from "../CallSignature";
import Environment from "../Environment";
import {Constness} from "../Member";

export default
class ClassExpression extends InterfaceExpression {
  constructor(range: SourceRange, env: Environment, public name: Identifier, public superExpression: Expression) {
    // TODO: inherit Object by default
    super(range, env, name, [superExpression || new EmptyTypeExpression(voidType(), env)]);

    const classType = new MetaType(`class ${name.name}`, this.selfType, env);
    this.type = classType;
    classType.newSignatures = [new CallSignature(voidType(), [], this.selfType)];
  }

  addMember(constness: Constness, name: Identifier, member: Expression|ExpressionThunk) {
    super.addMember(constness, name, member)

    if (name.name === "constructor") {
      const memberThunk = ExpressionThunk.resolve(member);
      this.type.newSignatures = memberThunk.type.get().callSignatures.map(sig => {
        return new CallSignature(voidType(), sig.params, this.selfType);
      });
    }
  }
}
