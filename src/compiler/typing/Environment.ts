import Type from "./Type";
import TypeThunk from "./thunk/TypeThunk";
import {voidType} from "./nativeTypes";
import Member, {Constness} from "./Member";
import MetaValue from "./MetaValue";

export default
class Environment {
  variables = new Map<string, Member>();

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
}
