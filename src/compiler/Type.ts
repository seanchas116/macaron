import {Expression} from "./Expression";
import TypeCheckError from "./TypeCheckError";

export
class Type {
  name = "[anonymous type]";

  getMembers() {
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
  name = "any";
}

export
class PrimitiveType extends Type {
  constructor(public name: string) {
    super();
  }

  isCastableTo(superType: Type): boolean {
    return this === superType || superType instanceof AnyType;
  }
}

export
class MetaType extends Type {
  constructor(public type: Type) {
    super();
    this.name = `type:${this.type.name}`;
  }
}

export
class FunctionType extends Type {
  constructor(public selfType: Type, public requiredParams: Type[], public optionalParams: Type[], public returnType: Type) {
    super();

    this.name = this.buildName();
  }

  buildName() {
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
    this.name = `[${this.types.join()}]`;
  }
}

function mergeMap<TKey, TValue>(a: Map<TKey, TValue>, b: Map<TKey, TValue>) {
  const ret = new Map<TKey, TValue>();
  for (const [k, v] of a) {
    ret.set(k, v);
  }
  for (const [k, v] of b) {
    ret.set(k, v);
  }
  return ret;
}

export
class ClassType extends Type {
  selfMembers = new Map<string, Expression>();

  constructor(public name: string, public superClass: Type) {
    super();
  }

  getMembers(): Map<string, Expression> {
    return mergeMap(this.selfMembers, this.superClass.getMembers());
  }

  addMember(name: string, member: Expression) {
    const superMember = this.superClass.getMembers().get(name);
    if (superMember && !member.type.isCastableTo(superMember.type)) {
      throw new TypeCheckError(
        `Member type is not compatible to super types`,
        member.location
      )
    }
  }
}
