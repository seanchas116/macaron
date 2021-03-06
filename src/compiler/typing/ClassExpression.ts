import {Expression, NamedExpression} from "./Expression";
import TypeExpression from "./TypeExpression";
import Type from "./Type";
import InterfaceType from "./type/InterfaceType";
import Identifier from "./Identifier";
import Environment from "./Environment";
import Member, {Constness} from "./Member";
import SourceRange from "../common/SourceRange";

export
class InterfaceExpression implements TypeExpression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public superExpression: TypeExpression[],
    public members: NamedExpression[],
    public environment: Environment,
    public metaType: InterfaceType
  ) {}
}

export
class ClassExpression implements TypeExpression, Expression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public superExpression: TypeExpression,
    public superClassExpression: Expression,
    public members: NamedExpression[],
    public environment: Environment,
    public valueType: InterfaceType,
    public metaType: InterfaceType
  ) {}
}
