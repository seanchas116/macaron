import Expression, {
  LiteralExpression,
  IdentifierExpression,
  AssignmentExpression,
  NewVariableExpression,
  FunctionCallExpression,
  GenericsCallExpression,
  GenericsExpression,
  ReturnExpression,
  MemberAccessExpression,
  OperatorAccessExpression,
  IfExpression,
  EmptyExpression,
  DeclarationExpression,
} from "./Expression";

import SourceRange from "../common/SourceRange";
import Identifier from "./Identifier";
import Environment from "./Environment";
import AssignableExpression, {IdentifierAssignbleExpression} from "./AssignableExpression";
import Type from "./Type";
import TypeThunk from "./thunk/TypeThunk";
import Member, {Constness} from "./Member";

export default
class ExpressionBuilder {
  constructor(public environment: Environment) {
  }

  buildNewVariable(
    range: SourceRange, constness: Constness,
    left: IdentifierAssignbleExpression, right: Expression
  ) {
    const varName = left.name;
    const type = left.type || right.type;
    this.environment.checkAddVariable(constness, left, type);
    this.environment.checkAssignVariable(left, right.type, true);
    return new NewVariableExpression(range, constness, left, right);
  }

  buildIdentifier(range: SourceRange, name: Identifier): Expression {
    const {member, needsThis} = this.environment.checkGetVariable(name);

    if (needsThis) {
      const thisIdentifier = new Identifier("this", range);
      const {member: thisMember} = this.environment.checkGetVariable(thisIdentifier);
      const thisExpr = new IdentifierExpression(range, thisIdentifier, thisMember.type.get());
      return new MemberAccessExpression(range, thisExpr, name);
    } else {
      return new IdentifierExpression(range, name, member.type.get());
    }
  }

  buildAssignment(range: SourceRange, left: IdentifierAssignbleExpression, right: Expression) {
    const varName = left.name;

    this.environment.checkAssignVariable(left, right.type);
    return new AssignmentExpression(range, left, right);
  }
}
