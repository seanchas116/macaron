import Type from "../Type";

export default
class GenericsParameterType extends Type {
  constructor(name: string, public genericsType: Type, public genericsIndex: number, public restriction: Type) {
    super(name);
    this.inherit(restriction);
  }

  isAssignable(other: Type): boolean {
    return other === this;
  }

  resolveGenerics(types: Map<GenericsParameterType, Type>): Type {
    return types.get(this) || this;
  }
}
