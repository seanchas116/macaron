import Expression from "./Expression";
import Type from "./Type";
import Identifier from "./Identifier";
import MetaType from "./type/MetaType";
import {voidType} from "./nativeTypes";
import SourceRange from "../common/SourceRange";
import IntersectionType from "./type/IntersectionType";
import UnionType from "./type/UnionType";
import Environment from "./Environment";

export default
class TypeExpression extends Expression {
  type: MetaType;
}

export
class EmptyTypeExpression extends TypeExpression {
  range = SourceRange.empty();
  type = MetaType.typeOnly(this.metaType);

  constructor(
    public metaType: Type
  ) {
    super();
  }
}

export
class TypeIdentifierExpression extends TypeExpression {
  type = MetaType.typeOnly(this.metaType);

  constructor(
    public range: SourceRange,
    public name: Identifier,
    public metaType: Type
  ) {
    super();
  }
}

export
class TypeAliasExpression extends TypeExpression {
  metaType = this.value.type;
  type = MetaType.typeOnly(this.metaType);

  constructor(
    public range: SourceRange,
    public assignable: Identifier,
    public value: TypeExpression
  ) {
    super();
  }
}

export
class TypeUnionExpression extends TypeExpression {
  metaType = new UnionType([this.left.type.metaType, this.right.type.metaType], this.environment, this.range);
  type = MetaType.typeOnly(this.metaType);

  constructor(
    public range: SourceRange,
    public environment: Environment,
    public left: TypeExpression,
    public right: TypeExpression
  ) {
    super();
  }
}

export
class TypeIntersectionExpression extends TypeExpression {
  metaType = new IntersectionType([this.left.type.metaType, this.right.type.metaType], this.environment, this.range);
  type = MetaType.typeOnly(this.metaType);

  constructor(
    public range: SourceRange,
    public environment: Environment,
    public left: TypeExpression,
    public right: TypeExpression
  ) {
    super();
  }
}
