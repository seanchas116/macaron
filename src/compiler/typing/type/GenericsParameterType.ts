import Type from "../Type";

export default
class GenericsParameterType extends Type {
  constructor(name: string, public genericsType: Type, public genericsIndex: number, public restriction: Type) {
    super(name, [restriction]);
  }
}
