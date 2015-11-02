import Expression from "../Expression";
import TypeExpression from "../TypeExpression";
import ExpressionThunk from "../thunk/ExpressionThunk";
import Type from "../Type";
import InterfaceType from "../type/InterfaceType";
import MetaType from "../type/MetaType";
import Identifier from "../Identifier";
import Environment from "../Environment";
import Member, {Constness} from "../Member";
import SourceRange from "../../common/SourceRange";
import CompilationError from "../../common/CompilationError";

export default
class InterfaceExpression extends TypeExpression {
  type: MetaType;
  members: ExpressionThunk[] = [];
  superTypes: Type[];
  selfType: InterfaceType;

  constructor(public range: SourceRange, env: Environment, public name: Identifier, public superExpressions: Expression[]) {
    super();

    let superTypes = this.superTypes = superExpressions.map(superExpr => {
      const superValueType = superExpr.type;
      if (superValueType instanceof MetaType) {
        return superValueType.metaType;
      } else {
        throw new Error("super value is not a type");
      }
    });

    const type = this.selfType = new InterfaceType(name.name, superTypes, env, range);
    this.type = MetaType.typeOnly(type);
  }

  addMember(constness: Constness, name: Identifier, member: Expression|ExpressionThunk) {
    const memberThunk = ExpressionThunk.resolve(member);

    const type = this.selfType;
    type.selfMembers.set(name.name, new Member(constness, member.type));

    for (const superType of this.superTypes) {
      const superMember = superType.getMember(name.name);
      const errors: string[] = [];
      if (superMember && !superMember.type.get().isAssignable(memberThunk.type.get(), errors)) {
        throw CompilationError.typeError(
          name.range,
          `Type of "${name.name}" is not compatible to super types`,
          ...errors
        );
      }
    }

    this.members.push(memberThunk);
  }
}
