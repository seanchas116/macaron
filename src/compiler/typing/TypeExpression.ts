import Expression from "./Expression";
import Type from "./Type";
import Identifier from "./Identifier";
import MetaType from "./type/MetaType";
import SourceRange from "../common/SourceRange";
import IntersectionType from "./type/IntersectionType";
import UnionType from "./type/UnionType";
import Environment from "./Environment";

export default
class TypeExpression extends Expression {
  type: MetaType;
  constructor(range: SourceRange, metaType: Type) {
    super(range, MetaType.typeOnly(metaType));
  }
}

export
class EmptyTypeExpression extends TypeExpression {
  constructor(
    metaType: Type
  ) {
    super(SourceRange.empty(), metaType);
  }
}

export
class TypeIdentifierExpression extends TypeExpression {
  constructor(
    range: SourceRange,
    public name: Identifier,
    metaType: Type
  ) {
    super(range, metaType);
  }
}

export
class TypeAliasExpression extends TypeExpression {
  metaType = this.value.type;

  constructor(
    range: SourceRange,
    public assignable: Identifier,
    public value: TypeExpression
  ) {
    super(range, value.type);
  }
}

export
class TypeUnionExpression extends TypeExpression {
  constructor(
    range: SourceRange,
    public environment: Environment,
    public left: TypeExpression,
    public right: TypeExpression
  ) {
    super(range, new UnionType([left.type.metaType, right.type.metaType], environment, range));
  }
}

export
class TypeIntersectionExpression extends TypeExpression {
  constructor(
    public range: SourceRange,
    public environment: Environment,
    public left: TypeExpression,
    public right: TypeExpression
  ) {
    super(range, new IntersectionType([left.type.metaType, right.type.metaType], environment, range));
  }
}
