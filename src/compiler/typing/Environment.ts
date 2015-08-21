import Type from "./Type";
import {TypeThunk} from "./Thunk";
import AssignType from "./AssignType";
import {voidType} from "./nativeTypes";
import Member, {Constness} from "./Member";
import MetaValue from "./MetaValue";

interface Variable {
  type: TypeThunk;
  assignType: AssignType;
}

export default
class Environment {
  variables = new Map<string, Member>();
  types = new Map<string, TypeThunk>();

  constructor(public parent: Environment = null) {
  }

  newChild() {
    return new Environment(this);
  }

  addTempVariable(baseName: string) {
    const name = this.nonDuplicateVariableName(baseName);
    this.variables.set(name, new Member(Constness.Constant, new MetaValue(voidType)));
    return name;
  }

  nonDuplicateVariableName(baseName: string) {
    for (let i = 0; true; ++i) {
      const name = baseName + i;
      if (!this.getVariable(name)) {
        return name;
      }
    }
  }

  setVariable(name: string, variable: Member) {
    this.variables.set(name, variable);
  }

  getVariable(name: string): Member {
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

  setType(name: string, type: Type|TypeThunk) {
    this.types.set(name, TypeThunk.resolve(type));
  }

  getType(name: string): TypeThunk {
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
