
export default
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
class FunctionType extends Type {
  constructor(public requiredParameters: Type[], public optionalParameters: Type[], public returnType: Type) {
    super(functionTypeName(requiredParameters, optionalParameters, returnType));
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
      if (other.requiredParameters.length !== this.requiredParameters.length) {
        return false;
      }
      if (this.optionalParameters.length < other.optionalParameters.length) {
        return false;
      }

      for (let i = 0; i < other.requiredParameters.length; ++i) {
        if (!other.requiredParameters[i].isCastableTo(this.requiredParameters[i])) {
          return false;
        }
      }
      for (let i = 0; i < other.optionalParameters.length; ++i) {
        if (!other.optionalParameters[i].isCastableTo(this.optionalParameters[i])) {
          return false;
        }
      }
    }
    else {
      return false;
    }
  }
}
