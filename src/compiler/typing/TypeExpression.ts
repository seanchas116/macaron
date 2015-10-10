import Expression from "./Expression";
import Type from "./Type";
import Identifier from "./Identifier";
import MetaType from "./type/MetaType";
import {voidType} from "./nativeTypes";
import SourceLocation from "../common/SourceLocation";
import IntersectionType from "./type/IntersectionType";
import UnionType from "./type/UnionType";

export default
class TypeExpression extends Expression {
  metaType: Type;
  type: Type;

  constructor(location: SourceLocation) {
    super(location);
    this.setMetaType(voidType());
  }

  setMetaType(metaType: Type) {
    this.metaType = metaType;
    this.type = MetaType.typeOnly(this.metaType);
  }
}

export
class EmptyTypeExpression extends TypeExpression {
  constructor(type: Type) {
    super(SourceLocation.empty());
    this.setMetaType(type);
  }
}

export
class TypeIdentifierExpression extends TypeExpression {
  constructor(public name: Identifier, type: Type) {
    super(name.location);
    this.setMetaType(type);
  }
}

export
class TypeAliasExpression extends TypeExpression {
  constructor(location: SourceLocation, public assignable: Identifier, public value: TypeExpression) {
    super(location);
    this.setMetaType(value.metaType);
  }
}

export
class TypeUnionExpression extends TypeExpression {
  constructor(location: SourceLocation, public left: TypeExpression, public right: TypeExpression) {
    super(location);
    const type = new UnionType([left.metaType, right.metaType], location);
    this.setMetaType(type);
  }
}

export
class TypeIntersectionExpression extends TypeExpression {
  constructor(location: SourceLocation, public left: TypeExpression, public right: TypeExpression) {
    super(location);
    const type = new IntersectionType([left.metaType, right.metaType], location);
    this.setMetaType(type);
  }
}
