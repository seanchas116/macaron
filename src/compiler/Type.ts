import {Expression} from "./Expression";

export
class Type {
  get name() {
    return "[anonymous type]";
  }

  get members() {
    return new Map<string, Expression>();
  }

  isCastableTo(superType: Type) {
    return this === superType;
  }

  get boxType(): Type {
    return null;
  }

  get hasBoxType() {
    return !!this.boxType;
  }
}

export
class AnyType extends Type {
  get name() {
    return "any";
  }
}

export
class PrimitiveType extends Type {
  constructor(private _name: string) {
    super();
  }

  get name() {
    return this._name;
  }

  isCastableTo(superType: Type): boolean {
    return this === superType || superType instanceof AnyType;
  }
}

export
class MetaType extends Type {
  constructor(public type: Type) {
    super();
  }

  get name() {
    return `type:${this.type.name}`;
  }
}

export
class FunctionType extends Type {
  constructor(public selfType: Type, public requiredParams: Type[], public optionalParams: Type[], public returnType: Type) {
    super();
  }

  get name() {
    const requiredNames = this.requiredParams.map(t => t.name);
    const optionalNames = this.optionalParams.map(t => t.name);
    const returnName = this.returnType.name;

    const funcName = (() => {
      if (optionalNames.length > 0) {
        return `(${requiredNames.join()}[, ${optionalNames.join()}])=>${returnName}`;
      }
      else {
        return `(${requiredNames.join()})=>${returnName}`
      }
    })();

    if (this.selfType) {
      return `(${this.selfType.name})${funcName}`;
    }
    else {
      return funcName;
    }
  }

  get parameters() {
    return this.requiredParams.concat(this.optionalParams);
  }

  get minParamCount() {
    return this.requiredParams.length;
  }

  get maxParamCount() {
    return this.requiredParams.length + this.optionalParams.length;
  }

  isCastableTo(superType: Type) {
    if (superType instanceof FunctionType) {
      // OK: (Object)=>HTMLElement to (HTMLElement)=>Object
      // NG: (HTMLElement)=>Object to (Object)=>HTMLElement
      // OK: (Object[, Object])=>void to (Object)=>void
      // NG: (Object)=>void to (Object[, Object])=>void

      if (superType.selfType && !superType.selfType.isCastableTo(this.selfType)) {
        return false;
      }

      if (!this.returnType.isCastableTo(superType.returnType)) {
        return false;
      }
      if (superType.requiredParams.length !== this.requiredParams.length) {
        return false;
      }
      if (this.optionalParams.length < superType.optionalParams.length) {
        return false;
      }

      for (let i = 0; i < superType.requiredParams.length; ++i) {
        if (!superType.requiredParams[i].isCastableTo(this.requiredParams[i])) {
          return false;
        }
      }
      for (let i = 0; i < superType.optionalParams.length; ++i) {
        if (!superType.optionalParams[i].isCastableTo(this.optionalParams[i])) {
          return false;
        }
      }
    }
    else {
      return false;
    }
  }
}

export
class TupleType extends Type {
  constructor(public types: Type[]) {
    super();
  }

  get name() {
    return `[${this.types.join()}]`;
  }
}

export
class ClassType extends Type {
  constructor(public members: Map<string, Expression>) {
    super();
  }
}
