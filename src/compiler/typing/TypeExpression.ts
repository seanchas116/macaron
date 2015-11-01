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
  metaType: Type;
  type: Type;

  constructor(range: SourceRange, public environment: Environment) {
    super(range);
    this.setMetaType(voidType());
  }

  setMetaType(metaType: Type) {
    this.metaType = metaType;
    this.type = MetaType.typeOnly(this.metaType, this.environment);
  }
}

export
class EmptyTypeExpression extends TypeExpression {
  constructor(type: Type, env: Environment) {
    super(SourceRange.empty(), env);
    this.setMetaType(type);
  }
}

export
class TypeIdentifierExpression extends TypeExpression {
  constructor(env: Environment, public name: Identifier, type: Type) {
    super(name.range, env);
    this.setMetaType(type);
  }
}

export
class TypeAliasExpression extends TypeExpression {
  constructor(loc: SourceRange, env: Environment, public assignable: Identifier, public value: TypeExpression) {
    super(loc, env);
    this.setMetaType(value.metaType);
  }
}

export
class TypeUnionExpression extends TypeExpression {
  constructor(loc: SourceRange, env: Environment, public left: TypeExpression, public right: TypeExpression) {
    super(loc, env);
    const type = new UnionType([left.metaType, right.metaType], env, loc);
    this.setMetaType(type);
  }
}

export
class TypeIntersectionExpression extends TypeExpression {
  constructor(loc: SourceRange, env: Environment, public left: TypeExpression, public right: TypeExpression) {
    super(loc, env);
    const type = new IntersectionType([left.metaType, right.metaType], env, loc);
    this.setMetaType(type);
  }
}
