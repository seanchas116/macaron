
export
class Type {
  get name() {
    return "[anonymous type]";
  }

  isCastableTo(superType: Type) {
    return this === superType;
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
  constructor(public requiredParams: Type[], public optionalParams: Type[], public returnType: Type) {
    super();
  }

  get name() {
    const requiredNames = this.requiredParams.map(t => t.name);
    const optionalNames = this.optionalParams.map(t => t.name);
    const returnName = this.returnType.name;

    if (optionalNames.length > 0) {
      return `(${requiredNames.join()}[, ${optionalNames.join()}])=>${returnName}`;
    }
    else {
      return `(${requiredNames.join()})=>${returnName}`
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
