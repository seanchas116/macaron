import Expression from "../Expression";
import TypeExpression from "../TypeExpression";
import InterfaceExpression from "./InterfaceExpression";
import Identifier from "../Identifier";
import SourceRange from "../../common/SourceRange";
import {voidType} from "../defaultEnvironment";
import MetaType from "../type/MetaType";
import InterfaceType from "../type/InterfaceType";
import CallSignature from "../CallSignature";
import Environment from "../Environment";
import {Constness} from "../Member";

export default
class ClassExpression extends InterfaceExpression implements Expression {
  classType: InterfaceType;
  valueType: MetaType;

  constructor(range: SourceRange, env: Environment, public name: Identifier, public superValueExpression: Expression, public superExpression: TypeExpression) {
    // TODO: inherit Object by default
    super(range, env, name, superExpression ? [superExpression] : []);

    this.metaType = new InterfaceType(name.name, this.superTypes, env, range);
    this.classType = new InterfaceType(`class ${name.name}`, superValueExpression ? [superValueExpression.valueType] : [], env, range);
    this.classType.newSignatures = [new CallSignature(voidType, [], this.metaType)];
    this.valueType = new MetaType(this.classType, this.metaType, env, range);
  }

  addMember(constness: Constness, name: Identifier, member: Expression) {
    super.addMember(constness, name, member)

    if (name.name === "constructor") {
      this.classType.newSignatures = member.valueType.getCallSignatures().map(sig => {
        return new CallSignature(voidType, sig.params, this.metaType);
      });
    }
  }
}
