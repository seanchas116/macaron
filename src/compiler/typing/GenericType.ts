import Type from "./Type";
import TupleType from "./type/TupleType";
import SourceLocation from "../common/SourceLocation";
import CompilationError from "../common/CompilationError";

interface GenericTypeParam {
  type: Type;
  variadic: boolean;
  name: String;
  location: SourceLocation;
}

export
class GenericType {
  constructor(public name: string, public typeParams: GenericTypeParam[]) {
    const variadicParams = typeParams.filter(p => p.variadic);
    if (variadicParams.length >= 2) {
      throw CompilationError.typeError(
        `Cannot contain 2 or more variadic generic parameters`,
        variadicParams[1].location
      );
    }
  }

  instantiate(types: Type[], location: SourceLocation) {
    const variadicParam = this.typeParams.find(p => p.variadic);
    if (variadicParam) {
      if (types.length < this.typeParams.length - 1) {
        throw CompilationError.typeError(
          `Wrong type argument count for generic type (${types.length} for ${this.typeParams.length - 1}...)`,
          location
        );
      }
      const countBefore = this.typeParams.indexOf(variadicParam);
      const countAfter = this.typeParams.length - countBefore - 1;

      const tuple = new TupleType(types.slice(countBefore, -countAfter), null);

      const args = types.slice(0, countBefore - 1)
        .concat([tuple])
        .concat(types.slice(types.length - countAfter));

      return new InstantiatedType(this, args);
    }
    else {
      if (types.length != this.typeParams.length) {
        throw CompilationError.typeError(
          `Wrong type argument count for generic type (${types.length} for ${this.typeParams.length})`,
          location
        );
      }
      return new InstantiatedType(this, types);
    }
  }
}

export
class InstantiatedType extends Type {
  constructor(public generic: GenericType, public typeArgs: Type[]) {
    super("");
    this.name = this.createName();
  }

  private createName() {
    const base = this.generic.name;
    const types = this.typeArgs.map(t => t.name);
    return `${base}<${types.join()}>`;
  }
}
