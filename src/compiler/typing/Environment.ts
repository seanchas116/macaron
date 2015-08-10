import DeclarationType from "./DeclarationType";
import Type from "./Type";

interface Variable {
  type: Type;
  isConstant: boolean;
}

export default
class Environment {
  variables = new Map<string, Variable>();
  types = new Map<string, Type>();

  constructor(public parent: Environment = null) {
  }

  addVariable(name: string, type: Type, declarationType: DeclarationType) {
    const isConstant = declarationType === DeclarationType.Constant;
    this.variables.set(name, {type, isConstant});
  }

  getVariable(name: string): Variable {
    if (this.parent) {
      const parentVariable = this.parent.getVariable(name);
      if (parentVariable) {
        return parentVariable;
      }
    }
    return this.getOwnVariable(name);
  }
  getOwnVariable(name: string) {
    return this.variables.get(name);
  }

  addType(name: string, type: Type) {
    this.types.set(name, type);
  }

  getType(name: string): Type {
    if (this.parent) {
      const parentType = this.parent.getType(name);
      if (parentType) {
        return parentType;
      }
    }
    return this.getOwnType(name);
  }
  getOwnType(name: string) {
    return this.types.get(name);
  }
}
