import Type from "./Type";
import Identifier from "./Identifier";
import SourceRange from "../common/SourceRange";
import IntersectionType from "./type/IntersectionType";
import UnionType from "./type/UnionType";
import GenericsParameterType from "./type/GenericsParameterType";
import Environment from "./Environment";

interface TypeExpression {
  range: SourceRange;
  metaType: Type;
}

export default TypeExpression;

export
function isTypeExpression(expr: any): expr is TypeExpression {
  return expr && expr.metaType instanceof Type;
}

export
class EmptyTypeExpression implements TypeExpression {
  range = SourceRange.empty();
  constructor(
    public metaType: Type
  ) {
  }
}

export
class TypeIdentifierExpression implements TypeExpression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public metaType: Type
  ) {
  }
}

export
class TypeAliasExpression implements TypeExpression {
  metaType = this.value.metaType;

  constructor(
    public range: SourceRange,
    public assignable: Identifier,
    public value: TypeExpression
  ) {
  }
}

export
class TypeUnionExpression implements TypeExpression {
  metaType: Type;
  constructor(
    public range: SourceRange,
    public environment: Environment,
    public left: TypeExpression,
    public right: TypeExpression
  ) {
    this.metaType = new UnionType([left.metaType, right.metaType], environment, range);
  }
}

export
class TypeIntersectionExpression implements TypeExpression {
  metaType: Type;
  constructor(
    public range: SourceRange,
    public environment: Environment,
    public left: TypeExpression,
    public right: TypeExpression
  ) {
    this.metaType = new IntersectionType([left.metaType, right.metaType], environment, range);
  }
}

export
class GenericsParameterExpression implements TypeExpression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public constrait: TypeExpression,
    public metaType: GenericsParameterType
  ) {
  }
}
