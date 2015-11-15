import Expression from "../Expression";
import TypeExpression from "../TypeExpression";
import Type from "../Type";
import InterfaceType from "../type/InterfaceType";
import MetaType from "../type/MetaType";
import Thunk from "../Thunk";
import Identifier from "../Identifier";
import Environment from "../Environment";
import Member, {Constness} from "../Member";
import SourceRange from "../../common/SourceRange";
import CompilationError from "../../common/CompilationError";
import {voidType} from "../defaultEnvironment";

export default
class InterfaceExpression implements TypeExpression {
  metaType: InterfaceType;

  members: Expression[] = [];
  superTypes: Type[];

  constructor(public range: SourceRange, env: Environment, public name: Identifier, public superExpressions: TypeExpression[]) {
    let superTypes = this.superTypes = superExpressions.map(superExpr => superExpr.metaType);

    const type = this.metaType = new InterfaceType(name.name, superTypes, env, range);
  }

  addMember(constness: Constness, name: Identifier, member: Expression) {
    const type = this.metaType;
    type.selfMembers.set(name.name, new Member(constness, new Thunk(member.range, () => member.valueType)));

    for (const superType of this.superTypes) {
      const superMember = superType.getMember(name.name);
      const errors: string[] = [];
      if (superMember && !superMember.type.get().isAssignable(member.valueType, errors)) {
        throw CompilationError.typeError(
          name.range,
          `Type of "${name.name}" is not compatible to super types`,
          ...errors
        );
      }
    }

    this.members.push(member);
  }
}
