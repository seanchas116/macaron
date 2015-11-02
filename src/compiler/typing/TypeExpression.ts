import Expression from "./Expression";
import Type from "./Type";
import Identifier from "./Identifier";
import MetaType from "./type/MetaType";
import SourceRange from "../common/SourceRange";
import IntersectionType from "./type/IntersectionType";
import UnionType from "./type/UnionType";
import Environment from "./Environment";

interface TypeExpression extends Expression {
  type: MetaType;
}
export default TypeExpression;

export
class EmptyTypeExpression implements TypeExpression {
  range = SourceRange.empty();
  type = MetaType.typeOnly(this.metaType);

  constructor(
    public metaType: Type
  ) {}
}

export
class TypeIdentifierExpression implements TypeExpression {
  type = MetaType.typeOnly(this.metaType);

  constructor(
    public range: SourceRange,
    public name: Identifier,
    public metaType: Type
  ) {}
}

export
class TypeAliasExpression implements TypeExpression {
  metaType = this.value.type;
  type = MetaType.typeOnly(this.metaType);

  constructor(
    public range: SourceRange,
    public assignable: Identifier,
    public value: TypeExpression
  ) {}
}

export
class TypeUnionExpression implements TypeExpression {
  metaType = new UnionType([this.left.type.metaType, this.right.type.metaType], this.environment, this.range);
  type = MetaType.typeOnly(this.metaType);

  constructor(
    public range: SourceRange,
    public environment: Environment,
    public left: TypeExpression,
    public right: TypeExpression
  ) {}
}

export
class TypeIntersectionExpression implements TypeExpression {
  metaType = new IntersectionType([this.left.type.metaType, this.right.type.metaType], this.environment, this.range);
  type = MetaType.typeOnly(this.metaType);

  constructor(
    public range: SourceRange,
    public environment: Environment,
    public left: TypeExpression,
    public right: TypeExpression
  ) {}
}
