
export
class Type {
  constructor(public name: string) {
  }

  isCastableTo(other: Type) {
    return this === other;
  }
}

function functionTypeName(requiredParams: Type[], optionalParams: Type[], returnType: Type) {
  if (optionalParams.length > 0) {
    return `(${requiredParams.join()}[, ${optionalParams.join()}])=>${returnType.name}`;
  }
  else {
    return `(${requiredParams.join()})=>${returnType.name}`
  }
}

export
class MetaType extends Type {
  constructor(public type: Type) {
    super(`type:${type.name}`);
  }
}

export
class FunctionType extends Type {
  constructor(public requiredParams: Type[], public optionalParams: Type[], public returnType: Type) {
    super(functionTypeName(requiredParams, optionalParams, returnType));
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

  isCastableTo(other: Type) {
    if (other instanceof FunctionType) {
      // OK: (Object)=>HTMLElement to (HTMLElement)=>Object
      // NG: (HTMLElement)=>Object to (Object)=>HTMLElement
      // OK: (Object[, Object])=>void to (Object)=>void
      // NG: (Object)=>void to (Object[, Object])=>void

      if (!this.returnType.isCastableTo(other.returnType)) {
        return false;
      }
      if (other.requiredParams.length !== this.requiredParams.length) {
        return false;
      }
      if (this.optionalParams.length < other.optionalParams.length) {
        return false;
      }

      for (let i = 0; i < other.requiredParams.length; ++i) {
        if (!other.requiredParams[i].isCastableTo(this.requiredParams[i])) {
          return false;
        }
      }
      for (let i = 0; i < other.optionalParams.length; ++i) {
        if (!other.optionalParams[i].isCastableTo(this.optionalParams[i])) {
          return false;
        }
      }
    }
    else {
      return false;
    }
  }


}
