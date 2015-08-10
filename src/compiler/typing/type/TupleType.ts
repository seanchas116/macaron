import Type from "../Type";

export default
class TupleType extends Type {
  constructor(types: Type[]) {
    super("");
    types.forEach((type, i) => {
      this.selfMembers.set(i.toString(), type);
    });
  }
}
