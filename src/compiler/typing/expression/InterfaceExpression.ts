import Expression from "../Expression";
import TypeExpression from "../TypeExpression";
import ExpressionThunk from "../thunk/ExpressionThunk";
import Type from "../Type";
import MetaType from "../type/MetaType";
import Identifier from "../Identifier";
import Member, {Constness} from "../Member";
import SourceLocation from "../../common/SourceLocation";
import CompilationError from "../../common/CompilationError";

export default
class InterfaceExpression extends TypeExpression {
  members: ExpressionThunk[] = [];
  superTypes: Type[];
  selfType: Type;

  constructor(location: SourceLocation, public name: Identifier, public superExpressions: Expression[]) {
    super(location);

    let superTypes = this.superTypes = superExpressions.map(superExpr => {
      const superValueType = superExpr.type;
      if (superValueType instanceof MetaType) {
        return superValueType.metaType;
      } else {
        throw new Error("super value is not a type");
      }
    });

    const type = this.selfType = new Type(name.name, location, this);
    for (const superType of superTypes) {
      type.inherit(superType);
    }
    this.setMetaType(type);
  }

  addMember(constness: Constness, name: Identifier, member: Expression|ExpressionThunk) {
    const memberThunk = ExpressionThunk.resolve(member);

    const type = this.selfType;
    type.members.set(name.name, new Member(constness, member.type));

    for (const superType of this.superTypes) {
      const superMember = superType.members.get(name.name);
      const errors: string[] = [];
      if (superMember && !superMember.type.get().isAssignable(memberThunk.type.get(), errors)) {
        throw CompilationError.typeError(
          name.location,
          `Type of "${name.name}" is not compatible to super types`,
          ...errors
        );
      }
    }

    this.members.push(memberThunk);
  }
}
